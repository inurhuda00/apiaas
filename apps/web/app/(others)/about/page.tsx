"use cache";

import { getStaticContent } from "@/lib/utils/markdown";
import { StaticPage } from "@/components/static-page";

export default async function AboutPage() {
	const content = await getStaticContent("about");

	return <StaticPage title={content.title} contentHtml={content.contentHtml} lastUpdated={content.lastUpdated} />;
}
