export const LEAD_STATUSES = [
  "new",
  "contact_attempt",
  "contacted",
  "qualified",
  "appointment_scheduled",
  "analysis_in_progress",
  "offer_sent",
  "follow_up",
  "won",
  "lost",
  "archived",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];