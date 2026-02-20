import { env } from '../config/env.js';
import type { AiProvider } from './aiProvider.js';
import { HttpAiProvider } from './httpAiProvider.js';
import { MockAiProvider } from './mockAiProvider.js';

const httpProvider = new HttpAiProvider();
const mockProvider = new MockAiProvider();

export const aiProvider: AiProvider = {
  async generate(input) {
    if (!env.AI_SERVICE_URL) {
      return mockProvider.generate(input);
    }

    try {
      return await httpProvider.generate(input);
    } catch {
      return mockProvider.generate(input);
    }
  }
};
