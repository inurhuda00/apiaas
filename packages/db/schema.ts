import {
	pgTable,
	serial,
	varchar,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }),
	email: varchar("email", { length: 255 }).notNull().unique(),
	password: text("password").notNull(),
	role: varchar("role", { length: 20 }).notNull().default("free"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export const waitlist = pgTable("waitlist", {
email: varchar("email", { length: 512 }).primaryKey(),
createdAt: timestamp("created_at", { withTimezone: true })
	.notNull()
	.defaultNow(),
});