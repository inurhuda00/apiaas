import { type Editor, BubbleMenu as TiptapBubbleMenu } from "@tiptap/react";
import { useState } from "react";
import type { Props as TippyOptions } from "tippy.js";
import { Icons } from "@/components/ui/icons";
import { AIMenu } from "../ai";
import { AskAI } from "../ai/ask-ai";
import { BubbleMenuItem } from "./bubble-item";
import { LinkItem } from "./link-item";

export function BubbleMenu({
	editor,
	tippyOptions,
}: {
	editor: Editor;
	tippyOptions?: TippyOptions;
}) {
	const [showAI, setShowAI] = useState(false);
	const [openLink, setOpenLink] = useState(false);

	if (!editor) {
		return null;
	}

	return (
		<div>
			<TiptapBubbleMenu editor={editor} tippyOptions={tippyOptions}>
				<div className="flex w-fit max-w-[90vw] overflow-hidden  border border-border bg-background text-mono font-regular">
					{showAI ? (
						<AIMenu onOpenChange={setShowAI} editor={editor} />
					) : (
						<>
							<AskAI onSelect={() => setShowAI(true)} />

							<BubbleMenuItem
								editor={editor}
								action={() => editor.chain().focus().toggleBold().run()}
								isActive={editor.isActive("bold")}
							>
								<Icons.Bold className="size-4" />
								<span className="sr-only">Bold</span>
							</BubbleMenuItem>

							<BubbleMenuItem
								editor={editor}
								action={() => editor.chain().focus().toggleItalic().run()}
								isActive={editor.isActive("italic")}
							>
								<Icons.Italic className="size-4" />
								<span className="sr-only">Italic</span>
							</BubbleMenuItem>

							<BubbleMenuItem
								editor={editor}
								action={() => editor.chain().focus().toggleStrike().run()}
								isActive={editor.isActive("strike")}
							>
								<Icons.Strikethrough className="size-4" />
								<span className="sr-only">Strike</span>
							</BubbleMenuItem>

							<LinkItem editor={editor} open={openLink} setOpen={setOpenLink} />
						</>
					)}
				</div>
			</TiptapBubbleMenu>
		</div>
	);
}
