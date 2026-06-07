/**
 * Parses and validates Gemini copilot responses using Zod schemas.
 * Provides graceful fallbacks for malformed AI outputs.
 */

import { z } from "zod";

// --- Zod schema for copilot response validation ---

export const ZodCopilotResponseSchema = z.object({
  answer: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()),
  toolUsed: z.string().nullable(),
});

export type CopilotResponse = z.infer<typeof ZodCopilotResponseSchema>;

export const COPILOT_FALLBACK: CopilotResponse = {
  answer:
    "I encountered a processing error analyzing the command center telemetry. Please retry your query or rephrase the question.",
  confidence: 0.0,
  sources: [],
  toolUsed: null,
};

/**
 * Attempts to parse Gemini's raw text output into a structured CopilotResponse.
 * Falls back gracefully on malformed JSON or validation failures.
 */
export function parseCopilotResponse(rawText: string): CopilotResponse {
  if (!rawText || rawText.trim().length === 0) {
    return COPILOT_FALLBACK;
  }

  try {
    // Strip markdown code fences if present
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    const validated = ZodCopilotResponseSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }

    // If JSON parsed but Zod failed, try to extract what we can
    console.warn("Copilot response Zod validation failed:", validated.error.issues);

    return {
      answer: parsed.answer || parsed.response || parsed.text || rawText,
      confidence: typeof parsed.confidence === "number" ? Math.min(1, Math.max(0, parsed.confidence)) : 0.7,
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      toolUsed: parsed.toolUsed || null,
    };
  } catch {
    // If JSON.parse failed entirely, treat the raw text as the answer
    return {
      answer: rawText.trim(),
      confidence: 0.6,
      sources: [],
      toolUsed: null,
    };
  }
}
