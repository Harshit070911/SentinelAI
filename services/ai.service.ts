import { translateToEnglish } from "../ai/translator";
import { classifyIncident } from "../ai/classifier";
import { determineSeverity } from "../ai/severity";
import { recommendResourceAndEta } from "../ai/recommendation";
import { generateAlert } from "../ai/alertGenerator";
import { createServerSupabaseClient } from "../supabase/server";

export const AiService = {
  /**
   * Helper: Logs incident timeline milestones into the public.incident_events table.
   */
  async logIncidentEvent(incidentId: string, eventType: string, description: string): Promise<void> {
    try {
      const supabase = createServerSupabaseClient();
      const { error } = await supabase
        .from("incident_events")
        .insert([
          {
            incident_id: incidentId,
            event_type: eventType,
            description: description || null,
          }
        ]);
      if (error) {
        console.error(`Failed to insert incident event '${eventType}' into DB:`, error.message);
      }
    } catch (err) {
      console.error(`Error logging incident event '${eventType}':`, err);
    }
  },

  /**
   * Coordinates the full AI analysis pipeline for a raw message string.
   * Applying translation, classification, hybrid severity rules, ETA calculation, and alerts.
   */
  async processIncidentMessage(message: string, latitude: number, longitude: number) {
    // 1. Multilingual Translation
    const englishText = await translateToEnglish(message);

    // 2. Extract structured fields
    const classification = await classifyIncident(englishText);

    // 3. Rule override check for severity levels
    const refinedSeverity = determineSeverity(
      classification.incidentType,
      classification.peopleAffected,
      englishText
    );

    // 4. Closest resource lookup & ETA estimation
    const recommendation = await recommendResourceAndEta(
      classification.recommendedResource,
      latitude,
      longitude
    );

    // 5. Short warning directive generation
    const publicAlert = await generateAlert(
      classification.incidentType,
      classification.summary,
      englishText
    );

    return {
      translatedText: englishText,
      classification: {
        ...classification,
        severity: refinedSeverity,
      },
      recommendation,
      publicAlert,
    };
  },

  /**
   * Main Background Non-Blocking execution task.
   * Logs every timeline event state sequentially and updates the incidents table.
   */
  async runBackgroundAiPipeline(
    incidentId: string,
    message: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    try {
      // Event 1: AI classification started
      await this.logIncidentEvent(
        incidentId,
        "AI classification started",
        "Background emergency analyzer has initialized processing."
      );

      // Translate & Classify
      const englishText = await translateToEnglish(message);
      const classification = await classifyIncident(englishText);

      // Event 2: AI classified as incidentType
      await this.logIncidentEvent(
        incidentId,
        `AI classified as ${classification.incidentType}`,
        `Confidence score: ${(classification.confidence * 100).toFixed(0)}%. Summary: ${classification.summary}`
      );

      // Refine Severity (includes critical keyword rules override)
      const refinedSeverity = determineSeverity(
        classification.incidentType,
        classification.peopleAffected,
        englishText
      );

      // Event 3: Priority score calculated
      await this.logIncidentEvent(
        incidentId,
        "Priority score calculated",
        `Calculated Priority Score: ${classification.priorityScore} (Severity: ${refinedSeverity}). Reason: ${classification.reason}`
      );

      // Resource recommendation
      const recommendation = await recommendResourceAndEta(
        classification.recommendedResource,
        latitude,
        longitude
      );

      // Event 4: Resource recommended
      await this.logIncidentEvent(
        incidentId,
        "Resource recommended",
        `Recommended Resource: ${recommendation.resourceType} (Unit: ${recommendation.resourceName}). Estimated ETA: ${recommendation.etaMinutes} mins. Distance: ${recommendation.distanceKm} km.`
      );

      // Alert generation
      const publicAlert = await generateAlert(
        classification.incidentType,
        classification.summary,
        englishText
      );

      // Save database telemetry updates
      const supabase = createServerSupabaseClient();
      const { error: dbError } = await supabase
        .from("incidents")
        .update({
          incident_type: classification.incidentType,
          severity: refinedSeverity,
          priority_score: classification.priorityScore,
          ai_summary: classification.summary,
          recommended_resource_type: recommendation.resourceType,
          ai_confidence: classification.confidence,
        })
        .eq("id", incidentId);

      if (dbError) {
        throw new Error(`Supabase update error: ${dbError.message}`);
      }

      // Generate alert event and insert if severity is high/critical
      if (["critical", "high"].includes(refinedSeverity)) {
        const dbAlertSeverity = refinedSeverity === "critical" ? "critical" : "severe";
        const { error: alertInsertError } = await supabase
          .from("alerts")
          .insert([
            {
              title: `AI Alert: ${classification.incidentType} Incident`,
              message: publicAlert,
              severity: dbAlertSeverity,
            }
          ]);

        if (!alertInsertError) {
          // Event 5: Alert generated
          await this.logIncidentEvent(
            incidentId,
            "Alert generated",
            `Broadcast alert: "${publicAlert}"`
          );
        } else {
          console.error("Failed to insert AI safety alert:", alertInsertError.message);
        }
      }

      // Final event logging
      await this.logIncidentEvent(
        incidentId,
        "AI enrichment completed",
        "AI model calculations completed. Incident record telemetry fields successfully populated."
      );
    } catch (err: any) {
      console.error(`Background AI execution failed for incident ${incidentId}:`, err);
      await this.logIncidentEvent(
        incidentId,
        "AI enrichment failed",
        `Pipeline halted due to error: ${err.message || String(err)}`
      );
    }
  },

  /**
   * Synchronous execution wrapper (for backward compatibility).
   * Automatically triggers background execution instead.
   */
  async enrichIncidentInDb(incidentId: string, message: string, latitude: number, longitude: number) {
    // Kicks off background task immediately and returns results structure asynchronously
    this.runBackgroundAiPipeline(incidentId, message, latitude, longitude).catch((err) => {
      console.error("Failed background pipeline runner:", err);
    });
    // Return a quick prediction preview structure
    return this.processIncidentMessage(message, latitude, longitude);
  },

  /**
   * Processes arrays of incidents in parallel for simulator, CCTV or bulk uploads.
   */
  async processIncidentBatch(
    batch: { message: string; latitude: number; longitude: number }[]
  ) {
    if (!batch || batch.length === 0) {
      return [];
    }
    
    // Process in parallel
    const promises = batch.map((item) =>
      this.processIncidentMessage(item.message, item.latitude, item.longitude)
        .catch((err) => {
          console.error(`Batch item failed to process: ${item.message}`, err);
          return null; // Return null on failure to allow rest of batch to finish
        })
    );

    return Promise.all(promises);
  },
};
