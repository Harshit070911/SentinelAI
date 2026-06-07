/**
 * Copilot service orchestrating the full chat pipeline:
 * 1. Build operational context from Supabase
 * 2. Resolve and execute relevant tool functions
 * 3. Send the complete prompt to Gemini 2.5 Flash
 * 4. Parse and validate the response
 */

import { callGeminiWithRetry } from "../ai/gemini";
import { buildOperationalContext } from "../copilot/contextBuilder";
import { COPILOT_SYSTEM_PROMPT, RESPONSE_FORMAT_INSTRUCTION } from "../copilot/prompts";
import { resolveToolByIntent, ToolResult } from "../copilot/tools";
import { parseCopilotResponse, CopilotResponse, COPILOT_FALLBACK } from "../copilot/parser";
import { useSentinelStore } from "../store/useSentinelStore";

export interface CopilotChatRequest {
  message: string;
}

export interface CopilotChatResult {
  answer: string;
  confidence: number;
  sources: string[];
  toolUsed: string | null;
  timestamp: string;
  context: {
    incidentCount: number;
    resourceCount: number;
    alertCount: number;
    eventCount: number;
  };
}

// In-memory fallback cache for offline QA retrieval
interface CachedCopilotResponse {
  query: string;
  answer: string;
  confidence: number;
  sources: string[];
}
const copilotQACache: CachedCopilotResponse[] = [];

export const CopilotService = {
  /**
   * Processes a single copilot chat message and returns a structured response.
   */
  async chat(request: CopilotChatRequest): Promise<CopilotChatResult> {
    const startTime = Date.now();

    // 1. Build live operational context
    let context;
    try {
      context = await buildOperationalContext();
    } catch (contextError) {
      console.error("Failed to build operational context:", contextError);
    }

    // If context is completely unavailable or empty
    if (!context || !context.contextString || context.contextString.trim().length === 0) {
      return {
        answer: "No reliable information available.",
        confidence: 0.0,
        sources: [],
        toolUsed: null,
        timestamp: new Date().toISOString(),
        context: {
          incidentCount: 0,
          resourceCount: 0,
          alertCount: 0,
          eventCount: 0,
        },
      };
    }

    try {
      // 2. Resolve and execute any relevant tool
      let toolResult: ToolResult | null = null;
      const toolFn = resolveToolByIntent(request.message);
      if (toolFn) {
        try {
          toolResult = await toolFn();
        } catch (toolError) {
          console.error("Copilot tool execution failed:", toolError);
        }
      }

      // 3. Construct the full prompt
      let fullPrompt = `${COPILOT_SYSTEM_PROMPT}\n\n${context.contextString}`;

      if (toolResult) {
        fullPrompt += `\n\n--- TOOL EXECUTION RESULT ---\nTool: ${toolResult.toolName}\nSummary: ${toolResult.summary}\nData: ${JSON.stringify(toolResult.data, null, 2).slice(0, 3000)}`;
      }

      fullPrompt += `\n\n--- OPERATOR QUERY ---\n${request.message}`;
      fullPrompt += RESPONSE_FORMAT_INSTRUCTION;

      // 4. Call Gemini with retry
      const rawResponse = await callGeminiWithRetry(async (client) => {
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
        });
        return response.text?.trim() || "";
      });

      // 5. Parse and validate
      const parsed: CopilotResponse = parseCopilotResponse(rawResponse);

      // Save to cache for offline retrieval
      const cacheKey = request.message.trim().toLowerCase();
      if (!copilotQACache.some(c => c.query === cacheKey)) {
        copilotQACache.push({
          query: cacheKey,
          answer: parsed.answer,
          confidence: parsed.confidence,
          sources: parsed.sources
        });
        if (copilotQACache.length > 25) copilotQACache.shift();
      }

      return {
        answer: parsed.answer,
        confidence: parsed.confidence,
        sources: parsed.sources,
        toolUsed: parsed.toolUsed || (toolResult ? toolResult.toolName : null),
        timestamp: new Date().toISOString(),
        context: {
          incidentCount: context.incidentCount,
          resourceCount: context.resourceCount,
          alertCount: context.alertCount,
          eventCount: context.eventCount,
        },
      };
    } catch (error: any) {
      console.error("CopilotService.chat failed. Triggering offline fallback...", error);

      // Fallback 1: Return cached results
      const lowercaseQuery = request.message.trim().toLowerCase();
      const cached = copilotQACache.find(item => 
        item.query.includes(lowercaseQuery) || lowercaseQuery.includes(item.query)
      );
      if (cached) {
        return {
          answer: `[OFFLINE CACHE ACTIVE] ${cached.answer}`,
          confidence: cached.confidence,
          sources: [...cached.sources, "Local Cache Storage"],
          toolUsed: null,
          timestamp: new Date().toISOString(),
          context: {
            incidentCount: context.incidentCount,
            resourceCount: context.resourceCount,
            alertCount: context.alertCount,
            eventCount: context.eventCount,
          }
        };
      }

      // Fallback 2: Rule-based status summary response
      const incidents = useSentinelStore.getState().incidents;
      const activeIncidents = incidents.filter(i => i.status !== "Resolved");
      const resources = useSentinelStore.getState().resources;
      const availableResources = resources.filter(r => r.status === "Available");

      const listIncidents = activeIncidents.map(i => `${i.type} at ${i.location} (Severity: ${i.priority})`).join("; ");
      const listResources = availableResources.map(r => r.name).join(", ");

      const ruleBasedAnswer = `[OFFLINE TELEMETRY STATUS] AI analysis is temporarily unavailable. Displaying rule-based status summary:
      - Active Incidents (${activeIncidents.length}): ${listIncidents || "No active emergencies."}
      - Available Dispatch Units (${availableResources.length}): ${listResources || "All units are currently dispatched."}
      - Operational Alerts: ${useSentinelStore.getState().alerts.length} active advisories.
      Please verify tactical dispatches directly from the Live Map.`;

      return {
        answer: ruleBasedAnswer,
        confidence: 0.8,
        sources: ["Command Center Local Telemetry"],
        toolUsed: null,
        timestamp: new Date().toISOString(),
        context: {
          incidentCount: context.incidentCount,
          resourceCount: context.resourceCount,
          alertCount: context.alertCount,
          eventCount: context.eventCount,
        },
      };
    }
  },
};
