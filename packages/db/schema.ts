import {
	pgTable,
	serial,
	varchar,
	text,
	timestamp,
	integer,
	boolean,
	primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }),
	email: varchar("email", { length: 255 }).notNull().unique(),
	password: text("password").notNull(),
	role: varchar("role", { length: 20 }).notNull().default("free"),
	customerId: varchar("customer_id", { length: 255 }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export const categories = pgTable("categories", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	slug: varchar("slug", { length: 50 }).notNull().unique(),
	description: text("description"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
	id: serial("id").primaryKey(),
	ownerId: integer("owner_id")
		.notNull()
		.references(() => users.id),
	name: varchar("name", { length: 255 }).notNull(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	description: text("description"),
	locked: boolean("locked").notNull().default(false),
	categoryId: integer("category_id")
		.notNull()
		.references(() => categories.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const images = pgTable("images", {
	id: serial("id").primaryKey(),
	productId: integer("product_id")
		.notNull()
		.references(() => products.id),
	url: text("url").notNull(),
	isPrimary: boolean("is_primary").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tags = pgTable("tags", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	slug: varchar("slug", { length: 50 }).notNull().unique(),
});

export const productTags = pgTable(
	"product_tags",
	{
		productId: integer("product_id")
			.notNull()
			.references(() => products.id),
		tagId: integer("tag_id")
			.notNull()
			.references(() => tags.id),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.productId, table.tagId] }),
		};
	},
);

export const files = pgTable("files", {
	id: serial("id").primaryKey(),
	productId: integer("product_id")
		.notNull()
		.references(() => products.id),

	name: varchar("name", { length: 255 }).notNull(),

	extension: varchar("extension", { length: 10 }).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull().unique(),
	fileSize: integer("file_size").notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	url: text("url").notNull(),
	fileType: varchar("file_type", { length: 20 }).notNull(),
	// image
	width: integer("width"),
	height: integer("height"),
	// // video
	// duration: integer("duration"),
	// codec: varchar("codec", { length: 50 }),
	// framerate: numeric("frame_rate"),
	// resolution: varchar("resolution", { length: 50 }),
	// // audio
	// duration: integer("duration"),
	// bitrate: integer("bitrate"),
	// samplerate: integer("sample_rate"),
	// channels: integer("channels"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const membership = pgTable("membership", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	licenseKey: varchar("license_key"),
	tier: varchar("tier", { length: 20 }).notNull().default("free"),
	expiresAt: timestamp("expires_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const waitlist = pgTable("waitlist", {
	email: varchar("email", { length: 512 }).primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id],
	}),
	owner: one(users, {
		fields: [products.ownerId],
		references: [users.id],
	}),
	images: many(images),
	files: many(files),
	tags: many(productTags),
}));

export const productImagesRelations = relations(images, ({ one }) => ({
	product: one(products, {
		fields: [images.productId],
		references: [products.id],
	}),
}));

export const filesRelations = relations(files, ({ one }) => ({
	product: one(products, {
		fields: [files.productId],
		references: [products.id],
	}),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	products: many(products),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	products: many(productTags),
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
	product: one(products, {
		fields: [productTags.productId],
		references: [products.id],
	}),
	tag: one(tags, {
		fields: [productTags.tagId],
		references: [tags.id],
	}),
}));

export const usersRelations = relations(users, ({ many }) => ({
	membership: many(membership),
	products: many(products),
}));

export const membershipRelations = relations(membership, ({ one }) => ({
	user: one(users, {
		fields: [membership.userId],
		references: [users.id],
	}),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type Membership = typeof membership.$inferSelect;
export type NewMembership = typeof membership.$inferInsert;
