"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

interface AssetDeleteButtonProps {
	assetId: number;
}

export function AssetDeleteButton({ assetId }: AssetDeleteButtonProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this asset?")) {
			return;
		}

		setIsDeleting(true);
		setError(null);
	};

	return (
		<Button variant="outline" size="sm" className="flex-1" onClick={handleDelete} disabled={isDeleting}>
			{isDeleting ? <Icons.Spinner className="h-4 w-4 animate-spin mr-2" /> : <Icons.Face className="h-4 w-4 mr-2" />}
			Delete
		</Button>
	);
}
