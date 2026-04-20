import { eq, desc } from "drizzle-orm";
import { db } from "../../config/db.js";
import { leadNotes } from "../../db/schema/leadNotes.js";

export async function getNotesByLeadId(leadId: number) {
  return db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, leadId))
    .orderBy(desc(leadNotes.createdAt));
}

export async function createLeadNote(leadId: number, content: string) {
  const result = await db.insert(leadNotes).values({
    leadId,
    content,
  });

  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.id, insertedId))
    .limit(1);

  return created[0] ?? null;
}