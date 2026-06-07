import { Schema, Type } from "@google/genai";
import { z } from "zod";

// --- 1. Type Interfaces ---

export interface ClassifiedIncident {
  incidentType: "Fire" | "Medical" | "Crowd" | "Violence" | "Lost Child" | "Suspicious Activity" | "Infrastructure Failure";
  severity: "critical" | "high" | "medium" | "low";
  priorityScore: number;
  confidence: number;
  summary: string;
  reason: string;
  recommendedResource: "Fire Unit" | "Ambulance" | "Police Unit" | "Security Team";
  peopleAffected: number;
}

export interface RecommendationDetails {
  resourceType: "Fire Unit" | "Ambulance" | "Police Unit" | "Security Team";
  resourceName: string;
  distanceKm: number;
  etaMinutes: number;
  confidence: number;
}

export interface SafetyAlert {
  alert: string;
}

export interface RiskPrediction {
  overcrowdingProbability: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendedAction: string;
}

// --- 2. Zod Validation Schemas ---

export const ZodClassificationSchema = z.object({
  incidentType: z.enum([
    "Fire",
    "Medical",
    "Crowd",
    "Violence",
    "Lost Child",
    "Suspicious Activity",
    "Infrastructure Failure"
  ]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  priorityScore: z.number().int().min(0).max(100),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1),
  reason: z.string().min(1),
  recommendedResource: z.enum(["Fire Unit", "Ambulance", "Police Unit", "Security Team"]),
  peopleAffected: z.number().int().nonnegative()
});

export const ZodRecommendationSchema = z.object({
  resourceType: z.enum(["Fire Unit", "Ambulance", "Police Unit", "Security Team"]),
  resourceName: z.string().min(1),
  distanceKm: z.number().nonnegative(),
  etaMinutes: z.number().int().nonnegative(),
  confidence: z.number().min(0).max(1)
});

export const ZodAlertSchema = z.object({
  alert: z.string().min(1)
});

export const ZodPredictionSchema = z.object({
  overcrowdingProbability: z.number().min(0).max(1),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  recommendedAction: z.string().min(1)
});

// --- 3. Fallback Values ---

export const CLASSIFICATION_FALLBACK: ClassifiedIncident = {
  incidentType: "Suspicious Activity",
  severity: "medium",
  priorityScore: 50,
  confidence: 0.5,
  summary: "Emergency incident reported. Manual dispatcher verification suggested.",
  reason: "Validation of automated AI classification payload failed. Falling back to default safety parameters.",
  recommendedResource: "Security Team",
  peopleAffected: 0
};

export const RECOMMENDATION_FALLBACK: RecommendationDetails = {
  resourceType: "Security Team",
  resourceName: "General Patrol Unit",
  distanceKm: 5.0,
  etaMinutes: 15,
  confidence: 0.5
};

export const ALERT_FALLBACK: SafetyAlert = {
  alert: "Emergency incident reported. Please remain alert, avoid crowded areas, and follow directions from safety officers."
};

export const PREDICTION_FALLBACK: RiskPrediction = {
  overcrowdingProbability: 0.0,
  riskLevel: "low",
  recommendedAction: "Continue monitoring location parameters via CCTV."
};

// --- 4. Gemini SDK Structured Output Configurations ---

export const ClassificationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    incidentType: {
      type: Type.STRING,
      enum: [
        "Fire",
        "Medical",
        "Crowd",
        "Violence",
        "Lost Child",
        "Suspicious Activity",
        "Infrastructure Failure"
      ]
    },
    severity: {
      type: Type.STRING,
      enum: ["critical", "high", "medium", "low"]
    },
    priorityScore: {
      type: Type.INTEGER
    },
    confidence: {
      type: Type.NUMBER
    },
    summary: {
      type: Type.STRING
    },
    reason: {
      type: Type.STRING
    },
    recommendedResource: {
      type: Type.STRING,
      enum: ["Fire Unit", "Ambulance", "Police Unit", "Security Team"]
    },
    peopleAffected: {
      type: Type.INTEGER
    }
  },
  required: [
    "incidentType",
    "severity",
    "priorityScore",
    "confidence",
    "summary",
    "reason",
    "recommendedResource",
    "peopleAffected"
  ]
};

export const RecommendationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    resourceType: {
      type: Type.STRING,
      enum: ["Fire Unit", "Ambulance", "Police Unit", "Security Team"]
    },
    resourceName: {
      type: Type.STRING
    },
    distanceKm: {
      type: Type.NUMBER
    },
    etaMinutes: {
      type: Type.INTEGER
    },
    confidence: {
      type: Type.NUMBER
    }
  },
  required: ["resourceType", "resourceName", "distanceKm", "etaMinutes", "confidence"]
};

export const AlertSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    alert: {
      type: Type.STRING
    }
  },
  required: ["alert"]
};

export const PredictionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overcrowdingProbability: {
      type: Type.NUMBER
    },
    riskLevel: {
      type: Type.STRING,
      enum: ["low", "medium", "high", "critical"]
    },
    recommendedAction: {
      type: Type.STRING
    }
  },
  required: ["overcrowdingProbability", "riskLevel", "recommendedAction"]
};
