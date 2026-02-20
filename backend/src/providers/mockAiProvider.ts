import type { AiGenerateInput, AiProvider } from './aiProvider.js';

export class MockAiProvider implements AiProvider {
  async generate(input: AiGenerateInput): Promise<string> {
    const patientName = input.patientContext?.name ? ` for ${input.patientContext.name}` : '';
    const notes = input.patientContext?.medicalNotes ? ` I see notes: ${input.patientContext.medicalNotes}.` : '';
    return `Dental assistant reply${patientName}: Thanks for your message. Please keep brushing twice daily, floss nightly, and schedule a check if pain persists over 48 hours.${notes}`;
  }
}
