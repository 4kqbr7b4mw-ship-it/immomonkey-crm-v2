import { z } from "zod";
import { LEAD_STATUSES } from "./leads.types.js";

export const createLeadSchema = z.object({
  firstName: z.string().trim().min(1).max(120).optional(),
  lastName: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().max(255).optional(),
  phone: z.string().trim().max(50).optional(),
  source: z.string().trim().max(100).optional(),

  status: z.enum(LEAD_STATUSES).optional(),
  score: z.string().trim().max(10).optional(),

  propertyType: z.string().trim().max(100).optional(),
  street: z.string().trim().max(255).optional(),
  zip: z.string().trim().max(20).optional(),
  city: z.string().trim().max(120).optional(),

  message: z.string().trim().optional(),
  nextFollowUpAt: z.string().datetime().optional().or(z.literal("")),
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateLeadStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});