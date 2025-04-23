"use client";

import { useState } from "react";

interface ExpandableDescriptionProps {
	description: string;
	shortDescription?: string;
	isAiGenerated?: boolean;
}

export function ExpandableDescription({
	description,
	shortDescription,
	isAiGenerated = false,
}: ExpandableDescriptionProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	// Default short description is the first sentence of the full description
	const shortText = shortDescription || `${description.split(".")[0]}.`;

	return (
		<div>
			{isExpanded ? (
				<>
					<div className="text-sm text-foreground space-y-3">
						{description.split("\n\n").map((paragraph) => (
							<p key={`paragraph-${paragraph.substring(0, 20).replace(/\s+/g, "-")}`} className="leading-relaxed">
								{paragraph}
							</p>
						))}
					</div>
					<div className="flex justify-between items-center mt-3">
						<button
							type="button"
							onClick={() => setIsExpanded(false)}
							className="text-xs text-muted-foreground hover:text-primary transition-colors"
						>
							Read less
						</button>
						{isAiGenerated && <span className="text-xs text-muted-foreground/70">[ AI-written ]</span>}
					</div>
				</>
			) : (
				<>
					<p className="text-sm text-foreground leading-relaxed">{shortText}</p>
					<button
						type="button"
						onClick={() => setIsExpanded(true)}
						className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1.5"
					>
						Read more
					</button>
				</>
			)}
		</div>
	);
}
