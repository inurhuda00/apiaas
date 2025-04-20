"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { DeleteProductModal } from "@/components/modal/delete-product-modal";

interface ProductActionButtonsProps {
	product: {
		id: string;
		name: string;
		slug: string;
	};
	onDeleteSuccess?: () => void;
}

export function ProductActionButtons({ product, onDeleteSuccess }: ProductActionButtonsProps) {
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	return (
		<div className="flex items-center gap-2">
			<Link href={`/edit/${product.slug}`}>
				<Button variant="outline" size="sm" className="flex items-center">
					<Icons.Description className="h-4 w-4 mr-2" />
					Edit
				</Button>
			</Link>

			<Button variant="destructive" size="sm" className="flex items-center" onClick={() => setShowDeleteModal(true)}>
				<Icons.Delete className="h-4 w-4 mr-2" />
				Delete
			</Button>

			<DeleteProductModal id={product.id} isOpen={showDeleteModal} onOpenChange={setShowDeleteModal} />
		</div>
	);
}
