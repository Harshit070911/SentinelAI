import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

/**
 * Executes a Gemini operation with retry logic and exponential backoff
 */
export async function callGeminiWithRetry<T>(
  fn: (client: GoogleGenAI) => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn(ai);
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error(`Gemini operation failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      console.warn(`Gemini operation failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms. Error: ${error.message || error}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
