import os
from dataclasses import dataclass
from typing import Any, Optional

import httpx
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field
import logging

app = FastAPI(title="ai-service")
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a helpful dental clinic assistant. Keep answers concise, safe, and non-diagnostic."
)
DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
DEFAULT_TIMEOUT_SECONDS = 8.0
OPENAI_TEMPERATURE = 0.2
SUPPORTED_AI_PROVIDERS = {"mock", "openai"}


def _safe_parse_timeout(raw: Optional[str], default: float) -> float:
    if raw is None:
        return default
    try:
        parsed = float(raw)
    except ValueError:
        logger.warning(
            "Invalid REQUEST_TIMEOUT value '%s'. Falling back to %.1f seconds.",
            raw,
            default,
        )
        return default
    if parsed <= 0:
        logger.warning(
            "REQUEST_TIMEOUT must be > 0 but got %.3f. Falling back to %.1f seconds.",
            parsed,
            default,
        )
        return default
    return parsed


def _as_sentence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.endswith((".", "!", "?")):
        return cleaned
    return f"{cleaned}."


class PatientContext(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    medicalNotes: Optional[str] = None


class GenerateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    message: str = Field(min_length=1, max_length=5000)
    patientContext: Optional[PatientContext] = None


class GenerateResponse(BaseModel):
    reply: str


@dataclass(frozen=True)
class Settings:
    ai_provider: str
    openai_api_key: str
    openai_base_url: str
    openai_model: str
    request_timeout: float

    @classmethod
    def from_env(cls) -> "Settings":
        provider = os.getenv("AI_PROVIDER", "mock").strip().lower()
        if provider not in SUPPORTED_AI_PROVIDERS:
            logger.warning(
                "Unsupported AI_PROVIDER '%s'. Falling back to 'mock'.", provider
            )
            provider = "mock"

        timeout = _safe_parse_timeout(
            os.getenv("REQUEST_TIMEOUT"),
            default=DEFAULT_TIMEOUT_SECONDS,
        )

        return cls(
            ai_provider=provider,
            openai_api_key=os.getenv("OPENAI_API_KEY", ""),
            openai_base_url=os.getenv("OPENAI_BASE_URL", DEFAULT_OPENAI_BASE_URL),
            openai_model=os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL),
            request_timeout=timeout,
        )


class OpenAIClient:
    def __init__(self, settings: Settings):
        self.api_key = settings.openai_api_key
        self.base_url = settings.openai_base_url.rstrip("/")
        self.model = settings.openai_model
        self.timeout = settings.request_timeout

    @staticmethod
    def _build_prompt(payload: GenerateRequest) -> str:
        prompt_parts = [SYSTEM_PROMPT, f"Patient message: {_as_sentence(payload.message)}"]
        if payload.patientContext:
            prompt_parts.append(
                f"Patient name: {_as_sentence(payload.patientContext.name)}"
            )
            if payload.patientContext.medicalNotes:
                prompt_parts.append(
                    f"Notes: {_as_sentence(payload.patientContext.medicalNotes)}"
                )
        return " ".join(prompt_parts)

    @staticmethod
    def _extract_reply(data: dict[str, Any]) -> str:
        try:
            reply = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise ValueError("Unexpected OpenAI response structure") from exc
        if not isinstance(reply, str) or not reply.strip():
            raise ValueError("OpenAI response content is empty")
        return reply.strip()

    async def generate(self, payload: GenerateRequest) -> str:
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY not configured")

        prompt = self._build_prompt(payload)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": OPENAI_TEMPERATURE,
                },
            )
            response.raise_for_status()
            data = response.json()
            return self._extract_reply(data)


settings = Settings.from_env()
openai_client = OpenAIClient(settings)


def mock_generate(payload: GenerateRequest) -> str:
    if payload.patientContext and payload.patientContext.medicalNotes:
        return (
            "Mock AI reply: Thanks for sharing. Continue daily brushing and flossing. "
            f"Given your notes ({payload.patientContext.medicalNotes}), if pain or swelling continues, contact the clinic."
        )
    return "Mock AI reply: Thanks for your message. Maintain oral hygiene and book a follow-up if symptoms persist."


async def _generate_reply(payload: GenerateRequest) -> str:
    if settings.ai_provider != "openai":
        return mock_generate(payload)

    try:
        return await openai_client.generate(payload)
    except (httpx.HTTPError, RuntimeError, ValueError) as exc:
        logger.warning("OpenAI generation failed, falling back to mock provider: %s", exc)
        return mock_generate(payload)


@app.get("/health")
def health():
    return {"ok": True, "service": "ai-service"}


@app.post("/generate", response_model=GenerateResponse)
async def generate(payload: GenerateRequest):
    reply = await _generate_reply(payload)
    return GenerateResponse(reply=reply)
