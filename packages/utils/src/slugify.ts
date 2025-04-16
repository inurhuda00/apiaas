export function slugify(text: string) {
	return text
		.toString()
		.normalize("NFD") // Normalize to decomposed form for handling accents
		.replace(/\p{Diacritic}/gu, "") // Remove diacritics/accents
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9 ]/g, "") // Remove non-alphanumeric chars
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
		.replace(/^-+/, "") // Trim hyphens from start
		.replace(/-+$/, ""); // Trim hyphens from end
}
