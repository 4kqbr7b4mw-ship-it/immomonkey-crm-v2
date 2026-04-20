import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";

export const tasks = mysqlTable("tasks", {
  id: int("id").primaryKey().autoincrement(),
  leadId: int("lead_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueAt: timestamp("due_at"),
  done: boolean("done").notNull().default(false),
  doneAt: timestamp("done_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});