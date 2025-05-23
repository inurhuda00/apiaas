"use client";

import { motion } from "motion/react";
import type { Editor } from "@tiptap/react";
import { useClickAway } from "@uidotdev/usehooks";
import { useEffect, useRef, useState } from "react";
import { Icons } from "@/components/ui/icons";
import { BubbleMenuButton } from "../bubble-menu/bubble-menu-button";
import { generateEditorContent } from "./example";

const selectors = [
	{
		name: "Grammar",
		icon: Icons.Spellcheck,
		instructions: "Fix grammar: Rectify any grammatical errors while preserving the original meaning.",
	},
	{
		name: "Improve",
		icon: Icons.WrapText,
		instructions: "Improve text: Refine the text to improve clarity and professionalism.",
	},
	{
		name: "Condense",
		icon: Icons.Condense,
		instructions:
			"Condense text: Remove any unnecessary text and only keep the invoice-related content and make it more concise.",
	},
];

interface AIMenuProps {
	editor: Editor;
	onOpenChange: (open: boolean) => void;
}

function formatEditorContent(content: string): string {
	return content.replace(/\n/g, "<br />");
}

export function AIMenu({ onOpenChange, editor }: AIMenuProps) {
	const [isTypingPrompt, setIsTypingPrompt] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const ref = useClickAway<HTMLDivElement>(() => {
		onOpenChange(false);
		setIsTypingPrompt(false);
	});

	useEffect(() => {
		if (isTypingPrompt) {
			inputRef.current?.focus();
		}
	}, [isTypingPrompt]);

	const handleGenerate = async (instructions: string) => {
		const selectedText = editor?.state.doc.textBetween(editor?.state.selection?.from, editor?.state.selection?.to, "");

		if (!selectedText) {
			return;
		}

		try {
			const { output } = await generateEditorContent({
				input: selectedText,
				context: instructions,
			});

			editor?.commands.insertContent(formatEditorContent(output));
		} catch (error) {
			console.error("Error generating content:", error);
		} finally {
			onOpenChange(false);
		}
	};

	return (
		<div ref={ref} className="flex whitespace-nowrap divide-x">
			<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
				{isTypingPrompt ? (
					<div className="relative">
						<input
							ref={inputRef}
							placeholder="Type your prompt…"
							onBlur={() => setIsTypingPrompt(false)}
							className="w-[280px] text-[11px] border-none px-4 h-8 bg-background focus:outline-none"
							onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
								if (e.key === "Enter") {
									e.preventDefault();
									onOpenChange(false);
									handleGenerate(`Custom prompt: ${e.currentTarget.value}`);
								}
							}}
						/>
						<kbd className="pointer-events-none h-5 select-none items-center gap-1 px-1.5 font-mono text-[13px] font-medium absolute right-2 top-1/2 -translate-y-1/2">
							<span>↵</span>
						</kbd>
					</div>
				) : (
					<BubbleMenuButton action={() => setIsTypingPrompt(true)} isActive={false}>
						<div className="flex items-center space-x-1">
							<Icons.AIOutline className="size-3" />
							<span className="text-[11px] font-mono">Ask AI</span>
						</div>
					</BubbleMenuButton>
				)}
			</motion.div>

			{!isTypingPrompt &&
				selectors.map((selector, index) => (
					<motion.div
						key={selector.name}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2, delay: (index + 1) * 0.05 }}
					>
						<BubbleMenuButton action={() => handleGenerate(selector.instructions)} isActive={false}>
							<div className="flex items-center space-x-1">
								<selector.icon className="size-3" />
								<span>{selector.name}</span>
							</div>
						</BubbleMenuButton>
					</motion.div>
				))}
		</div>
	);
}
