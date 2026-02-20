import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';
import type { AiGenerateInput, AiProvider } from './aiProvider.js';

export class HttpAiProvider implements AiProvider {
  async generate(input: AiGenerateInput): Promise<string> {
    if (!env.AI_SERVICE_URL) {
      throw new HttpError(503, 'AI_UNAVAILABLE', 'AI service URL not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);

    try {
      const response = await fetch(`${env.AI_SERVICE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      const json = (await response.json()) as { reply?: string };
      if (!json.reply) {
        throw new Error('AI service did not return reply');
      }
      return json.reply;
    } catch (error) {
      throw new HttpError(503, 'AI_UNAVAILABLE', `AI service failed: ${(error as Error).message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
