export const MAP_CENTER: [number, number] = [28.4595, 77.0266];
export const DEFAULT_ZOOM = 13;

export const INCIDENT_PRIORITIES = {
  CRITICAL: {
    label: "CRITICAL",
    color: "bg-error/20 text-error border-error/30 hover:bg-error/30",
    badge: "bg-error text-on-error shadow-[0_0_8px_var(--color-error)]",
    bullet: "bg-error"
  },
  HIGH: {
    label: "HIGH",
    color: "bg-error/15 text-error/90 border-error/20 hover:bg-error/25",
    badge: "bg-error/30 text-error border border-error/40",
    bullet: "bg-error/80"
  },
  MEDIUM: {
    label: "MEDIUM",
    color: "bg-tertiary/20 text-tertiary border-tertiary/30 hover:bg-tertiary/30",
    badge: "bg-tertiary/20 text-tertiary border border-tertiary/30",
    bullet: "bg-tertiary"
  },
  LOW: {
    label: "LOW",
    color: "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30",
    badge: "bg-primary/20 text-primary border border-primary/30",
    bullet: "bg-primary"
  }
} as const;

export const RESOURCE_STATUSES = {
  Available: {
    label: "Available",
    color: "text-primary bg-primary/10 border border-primary/20",
    bullet: "bg-primary animate-pulse"
  },
  Dispatched: {
    label: "Dispatched",
    color: "text-error bg-error/10 border border-error/20",
    bullet: "bg-error"
  },
  Staged: {
    label: "Staged",
    color: "text-tertiary bg-tertiary/10 border border-tertiary/20",
    bullet: "bg-tertiary"
  },
  Maintenance: {
    label: "Out of Service",
    color: "text-on-surface-variant bg-surface-container-high border border-outline-variant/30",
    bullet: "bg-outline"
  }
} as const;
