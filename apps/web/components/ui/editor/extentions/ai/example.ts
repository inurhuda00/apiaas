"use server";

import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

type Params = {
	input: string;
	context?: string;
};

export async function generateEditorContent({ input, context }: Params) {
	const response = await openai.chat.completions.create({
		model: "gpt-4",
		messages: [
			{
				role: "system",
				content: `
					You are an expert AI assistant specializing in content generation and improvement. Your task is to enhance or modify text based on specific instructions. Follow these guidelines:

					1. Language: Always respond in the same language as the input prompt.
					2. Conciseness: Keep responses brief and precise, with a maximum of 200 characters.

					Format your response as plain text, using '\n' for line breaks when necessary.
					Do not include any titles or headings in your response.
					Begin your response directly with the relevant text or information.
					${context}
				`,
			},
			{
				role: "user",
				content: input,
			},
		],
		temperature: 0.8,
		stream: true,
	});

	let content = "";
	for await (const chunk of response) {
		const delta = chunk.choices[0]?.delta?.content || "";
		content += delta;
	}

	return { output: content };
}
