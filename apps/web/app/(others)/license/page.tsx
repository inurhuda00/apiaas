"use cache";

import { getStaticContent } from "@/lib/utils/markdown";
import { StaticPage } from "@/components/static-page";

export default async function LicensePage() {
	const content = await getStaticContent("license");

	return (
		<StaticPage
			title={content.title}
			contentHtml={content.contentHtml}
			lastUpdated={content.lastUpdated}
			version={content.version}
		/>
	);
}
