export type LeadStatus =
  | "new"
  | "contact_attempt"
  | "contacted"
  | "qualified"
  | "appointment_scheduled"
  | "analysis_in_progress"
  | "offer_sent"
  | "follow_up"
  | "won"
  | "lost"
  | "archived";

export type LeadSortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "follow_up";

export type LeadFollowUpFilter = "all" | "overdue" | "today";

export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  score: string | null;
  createdAt: string;
  updatedAt: string;

  nextFollowUpAt: string | null;

  propertyType: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
  source: string | null;
  message: string | null;
}

export interface LeadNote {
  id: number;
  leadId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}