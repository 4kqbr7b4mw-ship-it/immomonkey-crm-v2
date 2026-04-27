import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { leads } from "../../db/schema/leads.js";
import type { LeadStatus } from "./leads.types.js";

type LeadInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: LeadStatus;
  score?: string;
  propertyType?: string;
  street?: string;
  zip?: string;
  city?: string;
  message?: string;
  nextFollowUpAt?: string;
};

export async function getAllLeads() {
  return db.select().from(leads);
}

export async function getLeadById(id: number) {
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createLead(input: LeadInput) {
  const result = await db.insert(leads).values({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    source: input.source,
    status: input.status ?? "new",
    score: input.score,
    propertyType: input.propertyType,
    street: input.street,
    zip: input.zip,
    city: input.city,
    message: input.message,
    nextFollowUpAt: input.nextFollowUpAt
      ? new Date(input.nextFollowUpAt)
      : null,
  });

  const insertedId = Number(result[0].insertId);
  return getLeadById(insertedId);
}

export async function updateLead(id: number, input: LeadInput) {
  await db
    .update(leads)
    .set({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      source: input.source,
      status: input.status,
      score: input.score,
      propertyType: input.propertyType,
      street: input.street,
      zip: input.zip,
      city: input.city,
      message: input.message,
      nextFollowUpAt: input.nextFollowUpAt
        ? new Date(input.nextFollowUpAt)
        : input.nextFollowUpAt === ""
        ? null
        : undefined,
    })
    .where(eq(leads.id, id));

  return getLeadById(id);
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  await db
    .update(leads)
    .set({ status })
    .where(eq(leads.id, id));

  return getLeadById(id);
}

export async function deleteLead(id: number) {
  await db.delete(leads).where(eq(leads.id, id));
}
