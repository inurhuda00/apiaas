"use cache";

import { getStaticContent } from "@/lib/utils/markdown";
import { StaticPage } from "@/components/static-page";

export default async function PrivacyPage() {
	const content = await getStaticContent("privacy");

	return (
		<StaticPage
			title={content.title}
			contentHtml={content.contentHtml}
			lastUpdated={content.lastUpdated}
			effectiveDate={content.effectiveDate}
		/>
	);
}
