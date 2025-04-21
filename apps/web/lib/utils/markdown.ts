import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content/static");

interface StaticContentData {
	title: string;
	contentHtml: string;
	lastUpdated?: string;
	effectiveDate?: string;
	version?: string;
	[key: string]: string | undefined;
}

export async function getStaticContent(filename: string): Promise<StaticContentData> {
	// Read markdown file
	const fullPath = path.join(contentDirectory, `${filename}.md`);
	const fileContents = fs.readFileSync(fullPath, "utf8");

	// Use gray-matter to parse the metadata section
	const matterResult = matter(fileContents);

	// Use remark to convert markdown into HTML
	const processedContent = await remark().use(html).process(matterResult.content);

	const contentHtml = processedContent.toString();

	// Return the combined data
	return {
		title: matterResult.data.title || filename,
		contentHtml,
		...matterResult.data,
	};
}
