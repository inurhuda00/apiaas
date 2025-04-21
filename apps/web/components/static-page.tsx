import { MaxWidthWrapper } from "@/components/max-width-wrapper";

interface StaticPageProps {
	title: string;
	contentHtml: string;
	lastUpdated?: string;
	effectiveDate?: string;
	version?: string;
	children?: React.ReactNode;
}

export function StaticPage({ title, contentHtml, lastUpdated, effectiveDate, version, children }: StaticPageProps) {
	return (
		<div className="flex-grow py-12">
			<MaxWidthWrapper className="max-w-4xl">
				<h1 className="text-3xl font-bold mb-8">{title}</h1>

				<div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: contentHtml }} />

				{children}

				<div className="mt-8 space-y-1 text-sm text-muted-foreground">
					{lastUpdated && <div>Last Updated: {lastUpdated}</div>}
					{effectiveDate && <div>Effective Date: {effectiveDate}</div>}
					{version && <div>Version: {version}</div>}
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
