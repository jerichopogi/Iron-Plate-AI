import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export class GeminiClient {
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }

  async generateContent(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Empty response from Gemini API');
        }

        return text;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message.toLowerCase();

        // Check if it's a non-retryable error
        if (errorMessage.includes('invalid api key') || errorMessage.includes('api key not valid')) {
          throw new Error('Invalid Gemini API key');
        }

        if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
          throw new Error('Content blocked by safety filters');
        }

        // Log retry attempt
        console.error(`Gemini API attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);

        // If we haven't exhausted retries, wait with exponential backoff
        if (attempt < MAX_RETRIES) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
          await this.sleep(backoffMs);
        }
      }
    }

    throw lastError || new Error('Failed to generate content after retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance for reuse
let geminiClientInstance: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClientInstance) {
    geminiClientInstance = new GeminiClient();
  }
  return geminiClientInstance;
}
