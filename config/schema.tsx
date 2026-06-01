import { integer, pgTable, varchar, json, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(5)
});

export const projectsTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ }).notNull(),
  userInput: varchar({}),
  device: varchar({ }),
  createdOn: timestamp().defaultNow(), 
  config: json(),
  userId: varchar().references(() => usersTable.email).notNull()
});