import { callGeminiWithRetry } from "./gemini";
import { ZodAlertSchema, ALERT_FALLBACK, AlertSchema } from "./schemas";

/**
 * Generates a short, urgent public alert message based on incident type, location, and summary.
 * Uses Zod schemas to validate output formatting and returns fallbacks on failure.
 */
export async function generateAlert(
  incidentType: string,
  location: string,
  summary: string
): Promise<string> {
  try {
    const responseText = await callGeminiWithRetry(async (client) => {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an emergency response broadcast generator.
Create a short, clear, and urgent public alert message based on the following details:
- Incident Type: ${incidentType}
- Location: ${location}
- Summary: ${summary}

Rules:
1. Output MUST be formatted in JSON with a single key "alert".
2. Keep it brief (typically 3 sentences). Avoid inducing panic.
3. Direct members of the public on what safety measures to take.

Example Output Format:
{
  "alert": "Fire reported near Gate 5. Please avoid the area and proceed toward Exit B. Emergency teams have been dispatched."
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: AlertSchema,
        },
      });
      return response.text?.trim() || "";
    });

    if (!responseText) {
      throw new Error("Empty response received from Gemini alert generator.");
    }

    const parsed = JSON.parse(responseText);

    // Validate with Zod
    const validated = ZodAlertSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn("Zod validation failed for safety alert generator:", validated.error);
      return ALERT_FALLBACK.alert;
    }

    return validated.data.alert;
  } catch (error) {
    console.error("Failed to generate emergency alert, returning fallback. Error:", error);
    return ALERT_FALLBACK.alert;
  }
}
