import { db } from ".";
import { users, categories, products, images, tags, productTags } from "@apiaas/db/schema";
import { hashPassword } from "@/lib/auth/session";

async function seed() {
	console.log("Starting seed process...");

	// Create admin user
	const email = "admin@mail.com";
	const password = "password";
	const passwordHash = await hashPassword(password);

	const [admin] = await db
		.insert(users)
		.values([
			{
				email: email,
				password: passwordHash,
				role: "admin",
			},
		])
		.returning();
	console.log("Admin user created.");

	// Create categories
	const categoryData = [
		{
			name: "JoyDoodle",
			slug: "joydoodle",
			description: "Cartoon-style illustrations and doodles",
		},
		{
			name: "3DX",
			slug: "3dx",
			description: "3D rendered objects and illustrations",
		},
	];

	await db.insert(categories).values(categoryData);
	console.log("Categories created.");

	// Get category IDs
	const categoryEntries = await db.select().from(categories);
	const categoryMap = new Map(categoryEntries.map((cat: typeof categories.$inferSelect) => [cat.slug, cat.id]));

	// Create tags
	const tagNames = [
		"animal",
		"cute",
		"cartoon",
		"cat",
		"leopard",
		"wildlife",
		"mascot",
		"wolf",
		"food",
		"fast food",
		"fries",
		"bunny",
		"rabbit",
		"skull",
		"cyberpunk",
		"futuristic",
		"illustration",
		"gaming",
		"controller",
		"3d",
		"device",
		"plant",
		"nature",
		"succulent",
		"bathroom",
		"household",
		"toilet",
		"app",
		"icon",
		"launcher",
		"space",
		"helmet",
		"astronaut",
		"gem",
		"jewel",
		"crystal",
	];

	const uniqueTags = [...new Set(tagNames)];
	const tagData = uniqueTags.map((name) => ({
		name,
		slug: name.toLowerCase().replace(/\s+/g, "-"),
	}));

	await db.insert(tags).values(tagData);
	console.log("Tags created.");

	// Get tag IDs
	const tagEntries = await db.select().from(tags);
	const tagMap = new Map(tagEntries.map((tag: typeof tags.$inferSelect) => [tag.name, tag.id]));

	// Product data
	const productData = [
		{
			slug: "cat-with-tongue-out-0xiw3",
			name: "Cat With Tongue Out",
			description: "A cute cartoon cat with its tongue sticking out, perfect for playful designs.",
			locked: false,
			categoryId: categoryMap.get("joydoodle"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/3353646943/3433720918.jpeg",
			formats: ["SVG", "PNG", "JPG"],
			tags: ["animal", "cute", "cartoon", "cat"],
		},
		{
			slug: "cartoon-leopard-with-open-mouth-0xw73",
			name: "Cartoon Leopard with Open Mouth",
			description: "A colorful cartoon leopard with an open mouth, great for children's content.",
			locked: true,
			categoryId: categoryMap.get("joydoodle"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/666015935/1738262000.jpeg",
			formats: ["SVG", "PNG", "JPG"],
			tags: ["animal", "cartoon", "leopard", "wildlife"],
		},
		{
			slug: "snarling-wolf-head-0xn7j",
			name: "Snarling Wolf Head",
			description: "An expressive snarling wolf head illustration, perfect for mascots or branding.",
			locked: true,
			categoryId: categoryMap.get("joydoodle"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/2312771386/2115228857.jpeg",
			formats: ["SVG", "PNG", "JPG"],
			tags: ["animal", "mascot", "wolf", "wildlife"],
		},
		{
			slug: "fast-food-french-fries-0xb8z",
			name: "Fast Food French Fries",
			description: "A cartoon illustration of french fries in a red container.",
			locked: false,
			categoryId: categoryMap.get("joydoodle"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/252539575/49373354.jpeg",
			formats: ["SVG", "PNG", "JPG"],
			tags: ["food", "fast food", "cartoon", "fries"],
		},
		{
			slug: "quirky-striped-bunny-0xqb3",
			name: "Quirky Striped Bunny",
			description: "A cute purple bunny with striped pattern, perfect for children's content.",
			locked: true,
			categoryId: categoryMap.get("joydoodle"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/344762432/3910008834.jpeg",
			formats: ["SVG", "PNG", "JPG"],
			tags: ["animal", "cute", "cartoon", "bunny", "rabbit"],
		},
		{
			slug: "cyberpunk-skull-illustration-0xa1b",
			name: "Cyberpunk Skull Illustration",
			description: "A colorful cyberpunk style skull illustration with orange tones.",
			locked: true,
			categoryId: categoryMap.get("joydoodle"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/2916682705/1667610726.jpeg",
			formats: ["SVG", "PNG", "JPG"],
			tags: ["skull", "cyberpunk", "futuristic", "illustration"],
		},
		{
			slug: "vibrant-3d-game-controller-0xwq0",
			name: "Vibrant 3D Game Controller",
			description: "A colorful 3D game controller, perfect for gaming content and interfaces.",
			locked: true,
			categoryId: categoryMap.get("3dx"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/741817012/1763205055.jpeg",
			formats: ["PNG"],
			tags: ["gaming", "controller", "3d", "device"],
		},
		{
			slug: "colorful-3d-succulent-0xx2b",
			name: "Colorful 3D Succulent",
			description: "A vibrant 3D succulent plant, ideal for nature-themed designs and decorative elements.",
			locked: true,
			categoryId: categoryMap.get("3dx"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/1603392950/3716903485.jpeg",
			formats: ["PNG"],
			tags: ["plant", "nature", "3d", "succulent"],
		},
		{
			slug: "playful-3d-toilet-icon-0x0uk",
			name: "Playful 3D Toilet Icon",
			description: "A cute 3D toilet illustration, perfect for bathroom signage or household-related content.",
			locked: true,
			categoryId: categoryMap.get("3dx"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/751485461/873174672.jpeg",
			formats: ["PNG"],
			tags: ["bathroom", "household", "3d", "toilet"],
		},
		{
			slug: "launcher-icon-0xjf4",
			name: "Launcher Icon",
			description: "A colorful 3D app launcher icon with a modern design.",
			locked: false,
			categoryId: categoryMap.get("3dx"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/2285067093/1821043205.jpeg",
			formats: ["PNG"],
			tags: ["app", "icon", "3d", "launcher"],
		},
		{
			slug: "3d-space-helmet-0xqg0",
			name: "3D Space Helmet",
			description: "A realistic 3D space helmet model with reflective visor.",
			locked: true,
			categoryId: categoryMap.get("3dx"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/1752674098/2864438112.jpeg",
			formats: ["PNG"],
			tags: ["space", "helmet", "3d", "astronaut"],
		},
		{
			slug: "stunning-red-gemstone-0xck5",
			name: "Stunning Red Gemstone",
			description: "A beautiful 3D rendering of a red gemstone with realistic light reflections.",
			locked: true,
			categoryId: categoryMap.get("3dx"),
			ownerId: admin.id,
			imageUrl: "https://ext.same-assets.com/1616318090/2477763592.jpeg",
			formats: ["PNG"],
			tags: ["gem", "jewel", "3d", "crystal"],
		},
	];

	// Insert products and related data
	for (const item of productData) {
		// Insert product
		const [productResult] = await db
			.insert(products)
			.values({
				name: item.name,
				slug: item.slug,
				description: item.description,
				locked: item.locked,
				categoryId: item.categoryId as number,
				ownerId: admin.id,
			})
			.returning({ id: products.id });

		const productId = productResult.id;

		// Insert primary image
		await db.insert(images).values({
			productId,
			url: item.imageUrl,
			sort: 0,
		});

		for (const tagName of item.tags) {
			const tagId = tagMap.get(tagName);
			if (tagId) {
				await db.insert(productTags).values({
					productId,
					tagId,
				});
			}
		}
	}

	console.log("Products with images, formats, and tags created.");
}

seed()
	.catch((error) => {
		console.error("Seed process failed:", error);
		process.exit(1);
	})
	.finally(() => {
		console.log("Seed process finished. Exiting...");
		process.exit(0);
	});
