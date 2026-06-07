import { callGeminiWithRetry } from "./gemini";
import { AiCache } from "../lib/cache";

/**
 * Translates input text (e.g. Hindi, mixed English/Hindi) to English before classification.
 * Returns the translated English string. Uses AiCache to prevent redundant calls.
 */
export async function translateToEnglish(text: string): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) {
    return "";
  }

  // 1. Check cache first
  const cacheKey = `translate:${trimmed}`;
  const cachedResult = AiCache.get<string>(cacheKey);
  if (cachedResult !== null) {
    return cachedResult;
  }

  const result = await callGeminiWithRetry(async (client) => {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the following emergency report or message into plain, concise English. If it is already in English, output it exactly as is. Output ONLY the English text. Do not wrap it in quotes, and do not add any markdown, explanation, or conversational prefix.\n\nReport Text:\n"${trimmed}"`,
    });
    return response.text?.trim() || trimmed;
  });

  // 2. Store result in cache
  AiCache.set(cacheKey, result);

  return result;
}
