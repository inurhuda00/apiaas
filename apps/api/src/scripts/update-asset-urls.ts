/**
 * Migration script to update hardcoded URLs to use environment variable based URLs
 *
 * Usage:
 * 1. Set the OLD_DOMAIN and NEW_DOMAIN variables
 * 2. Run with: npx tsx src/scripts/update-asset-urls.ts
 */

import { database } from "@apiaas/db";
import { images, files } from "@apiaas/db/schema";
import { like, sql } from "drizzle-orm";

// Configuration
const OLD_DOMAIN = "assets.mondive.xyz";
const NEW_DOMAIN = process.env.ASSET_DOMAIN || "assets.mondive.xyz";
const DRY_RUN = process.env.DRY_RUN === "true"; // Set to true to see changes without applying them

async function main() {
	// Skip if domains are the same
	if (OLD_DOMAIN === NEW_DOMAIN) {
		console.log("Old and new domains are the same, no changes needed.");
		return;
	}

	console.log(`Updating asset URLs from ${OLD_DOMAIN} to ${NEW_DOMAIN}`);
	if (DRY_RUN) {
		console.log("DRY RUN: Changes will not be applied");
	}

	const dbUrl = process.env.DATABASE_URL;
	if (!dbUrl) {
		console.error("DATABASE_URL environment variable is not set");
		return;
	}

	const db = database(dbUrl);

	// Update image URLs
	try {
		const imageMatches = await db.query.images.findMany({
			where: like(images.url, `%${OLD_DOMAIN}%`),
		});

		console.log(`Found ${imageMatches.length} images with URLs containing ${OLD_DOMAIN}`);

		if (!DRY_RUN && imageMatches.length > 0) {
			const updated = await db.execute(
				sql`UPDATE images SET url = REPLACE(url, ${`https://${OLD_DOMAIN}`}, ${`https://${NEW_DOMAIN}`}) WHERE url LIKE ${`%${OLD_DOMAIN}%`}`,
			);
			console.log(`Updated ${updated.count} image URLs`);
		} else if (imageMatches.length > 0) {
			console.log("Example changes (not applied):");
			for (const img of imageMatches.slice(0, 5)) {
				console.log(` - ${img.url} -> ${img.url.replace(`https://${OLD_DOMAIN}`, `https://${NEW_DOMAIN}`)}`);
			}
		}
	} catch (error) {
		console.error("Error updating image URLs:", error);
	}

	// Update file URLs
	try {
		const fileMatches = await db.query.files.findMany({
			where: like(files.url, `%${OLD_DOMAIN}%`),
		});

		console.log(`Found ${fileMatches.length} files with URLs containing ${OLD_DOMAIN}`);

		if (!DRY_RUN && fileMatches.length > 0) {
			const updated = await db.execute(
				sql`UPDATE files SET url = REPLACE(url, ${`https://${OLD_DOMAIN}`}, ${`https://${NEW_DOMAIN}`}) WHERE url LIKE ${`%${OLD_DOMAIN}%`}`,
			);
			console.log(`Updated ${updated.count} file URLs`);
		} else if (fileMatches.length > 0) {
			console.log("Example changes (not applied):");
			for (const file of fileMatches.slice(0, 5)) {
				console.log(` - ${file.url} -> ${file.url.replace(`https://${OLD_DOMAIN}`, `https://${NEW_DOMAIN}`)}`);
			}
		}
	} catch (error) {
		console.error("Error updating file URLs:", error);
	}

	console.log("URL update completed");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Migration failed:", error);
		process.exit(1);
	});
