ALTER TABLE "products" ALTER COLUMN "locked" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_id" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_id_unique" UNIQUE("product_id");