import Link from "next/link";

interface AuthFooterProps {
	text: string;
	linkText: string;
	linkHref: string;
	queryParams?: Record<string, string>;
}

export function AuthFooter({ text, linkText, linkHref, queryParams }: AuthFooterProps) {
	const queryString = queryParams
		? Object.entries(queryParams)
				.filter(([_, value]) => value)
				.map(([key, value]) => `${key}=${value}`)
				.join("&")
		: "";

	const href = queryString ? `${linkHref}?${queryString}` : linkHref;

	return (
		<div className="mt-6 text-center text-sm text-muted-foreground">
			{text}{" "}
			<Link href={href} className="font-medium text-primary hover:text-primary/90">
				{linkText}
			</Link>
		</div>
	);
}
