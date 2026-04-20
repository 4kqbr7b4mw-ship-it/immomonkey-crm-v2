import {
  mysqlTable,
  int,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

export const leadNotes = mysqlTable("lead_notes", {
  id: int("id").primaryKey().autoincrement(),
  leadId: int("lead_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});