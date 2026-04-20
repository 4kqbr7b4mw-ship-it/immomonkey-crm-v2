import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";

export const leads = mysqlTable("leads", {
  id: int("id").primaryKey().autoincrement(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  source: varchar("source", { length: 100 }),

  status: varchar("status", { length: 50 }).notNull().default("new"),
  score: varchar("score", { length: 10 }),

  propertyType: varchar("property_type", { length: 100 }),
  street: varchar("street", { length: 255 }),
  zip: varchar("zip", { length: 20 }),
  city: varchar("city", { length: 120 }),

  message: text("message"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  archivedAt: timestamp("archived_at"),
});