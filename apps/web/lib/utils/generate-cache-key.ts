export function generateSearchCacheKey(search: Record<string, any>): string {
	return Object.values(search)
		.map((value) => {
			if (!value) return "";

			if (Array.isArray(value)) {
				return value
					.map((item) =>
						typeof item === "object"
							? Object.values(item).join(":")
							: String(item),
					)
					.join(",");
			}

			return String(value);
		})
		.filter(Boolean)
		.join("_");
}
