/**
 * Severity Engine determines incident severity level (critical, high, medium, low)
 * based on keywords, people affected, and incident type.
 * Incorporates a hybrid rule-override that forces "critical" for specific high-risk keywords.
 */
export function determineSeverity(
  incidentType: string,
  peopleAffected: number,
  description: string
): "critical" | "high" | "medium" | "low" {
  const text = (description || "").toLowerCase();

  // Rule-based override: Force critical severity for extremely high-risk keywords
  const forceCriticalKeywords = [
    "weapon",
    "explosion",
    "stampede",
    "gun",
    "fire spreading",
    "collapse",
  ];

  if (forceCriticalKeywords.some((kw) => text.includes(kw))) {
    return "critical";
  }

  // Standard indicator checking
  const criticalKeywords = [
    "unconscious", "heart attack", "cardiac", "stroke", "hostage",
    "structural collapse", "terrorist", "mass casualty", "panic",
    "engulfed in flames", "toxic gas", "running for their lives"
  ];

  const highKeywords = [
    "smoke", "fire", "bleeding", "broken bone", "violence", "fight",
    "knife", "assault", "trapped", "flooding", "blackout",
    "gas leak", "people running"
  ];

  const mediumKeywords = [
    "suspicious package", "lost child", "looting", "trespassing",
    "vandalism", "theft", "minor injury"
  ];

  let keywordSeverity: "critical" | "high" | "medium" | "low" = "low";
  if (criticalKeywords.some(kw => text.includes(kw))) {
    keywordSeverity = "critical";
  } else if (highKeywords.some(kw => text.includes(kw))) {
    keywordSeverity = "high";
  } else if (mediumKeywords.some(kw => text.includes(kw))) {
    keywordSeverity = "medium";
  }

  // People affected scaling
  let peopleSeverity: "critical" | "high" | "medium" | "low" = "low";
  if (peopleAffected >= 20) {
    peopleSeverity = "critical";
  } else if (peopleAffected >= 5) {
    peopleSeverity = "high";
  } else if (peopleAffected >= 1) {
    peopleSeverity = "medium";
  }

  // Inherent risk level of incident types
  let typeSeverity: "critical" | "high" | "medium" | "low" = "low";
  if (["Fire", "Medical", "Violence", "Infrastructure Failure"].includes(incidentType)) {
    typeSeverity = "high";
  } else if (["Crowd", "Lost Child", "Suspicious Activity"].includes(incidentType)) {
    typeSeverity = "medium";
  }

  // Resolution hierarchy
  if (
    keywordSeverity === "critical" ||
    peopleSeverity === "critical" ||
    (typeSeverity === "high" && peopleAffected >= 10)
  ) {
    return "critical";
  }

  if (keywordSeverity === "high" || peopleSeverity === "high" || typeSeverity === "high") {
    return "high";
  }

  if (keywordSeverity === "medium" || peopleSeverity === "medium" || typeSeverity === "medium") {
    return "medium";
  }

  return "low";
}
