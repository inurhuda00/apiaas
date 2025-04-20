"use client";

import { useActionState, useEffect } from "react";
import { deleteProduct } from "@/actions/products";
import { Icons } from "../ui/icons";
import { SubmitButton } from "../ui/submit-button";
import Form from "next/form";
import type { ActionState } from "@/actions/middleware";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
interface Props {
	id: string;
	onOpenChange: (open: boolean) => void;
	isOpen: boolean;
	defaultValue?: string;
}

export function DeleteProductModal({ id, onOpenChange, isOpen, defaultValue }: Props) {
	const router = useRouter();
	const [state, formAction, pending] = useActionState<ActionState, FormData>(deleteProduct, {});

	useEffect(() => {
		if (state.success) {
			router.refresh();
			onOpenChange(false);
		}
	}, [state.success, onOpenChange, router]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[440px]">
				<div className="p-6">
					<DialogHeader className="mb-4">
						<DialogTitle className="text-xl">Delete Product</DialogTitle>
						<DialogDescription className="text-base mt-2">
							Are you sure you want to delete this product? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>

					<Form action={formAction} className="mt-6">
						<input type="hidden" name="productId" value={id} />

						{state.error && (
							<div className="text-sm text-red-500 font-medium mb-4 p-3 bg-red-50 rounded-md">{state.error}</div>
						)}

						<div className="flex justify-end gap-3 mt-8">
							<Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="min-w-[100px]">
								Cancel
							</Button>
							<SubmitButton
								variant="destructive"
								pending={pending}
								icon={<Icons.Delete className="h-4 w-4 mr-2" />}
								className="min-w-[140px]"
							>
								Delete Product
							</SubmitButton>
						</div>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
