import { callGeminiWithRetry } from "./gemini";
import {
  ClassificationSchema,
  ClassifiedIncident,
  ZodClassificationSchema,
  CLASSIFICATION_FALLBACK,
} from "./schemas";
import { AiCache } from "../lib/cache";

/**
 * Classifies an incident description into structured JSON using Gemini 2.5 Flash.
 * Validates the output with Zod, checks the in-memory cache, and falls back gracefully on failure.
 */
export async function classifyIncident(text: string): Promise<ClassifiedIncident> {
  const trimmed = text?.trim();
  if (!trimmed) {
    return CLASSIFICATION_FALLBACK;
  }

  // 1. Check cache first
  const cacheKey = `classify:${trimmed}`;
  const cachedResult = AiCache.get<ClassifiedIncident>(cacheKey);
  if (cachedResult !== null) {
    return cachedResult;
  }

  try {
    const responseText = await callGeminiWithRetry(async (client) => {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an AI emergency response dispatcher. Analyze the situation and extract details.
Emergency Description:
"${trimmed}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: ClassificationSchema,
        },
      });
      return response.text?.trim() || "";
    });

    if (!responseText) {
      throw new Error("Empty response received from Gemini classifier.");
    }

    const parsed = JSON.parse(responseText);
    
    // Validate with Zod
    const validated = ZodClassificationSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn(
        "Zod validation failed for Gemini classification response. Error details:",
        validated.error,
        "Raw response:",
        responseText
      );
      return CLASSIFICATION_FALLBACK;
    }

    // 2. Store in cache
    AiCache.set(cacheKey, validated.data);

    return validated.data;
  } catch (error: any) {
    console.error("Failed to classify incident using Gemini. Returning fallback values. Error:", error);
    return CLASSIFICATION_FALLBACK;
  }
}
