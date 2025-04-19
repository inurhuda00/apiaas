ALTER TABLE "images" ADD COLUMN "sort" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN "is_primary";