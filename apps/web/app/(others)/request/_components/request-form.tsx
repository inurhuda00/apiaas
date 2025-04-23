"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { Icons } from "@/components/ui/icons";
import { submitAssetRequest } from "@/actions/request";
import { DynamicFileUploader } from "@/components/lazy-components";
import Form from "next/form";

type ActionState = {
	error?: string;
	success?: string;
};

export function RequestForm() {
	const [state, formAction, pending] = useActionState<ActionState, FormData>(submitAssetRequest, {
		error: "",
		success: "",
	});

	if (state.success) {
		return (
			<Card className="border-border bg-background">
				<CardContent className="pt-6 px-6 pb-8 space-y-4">
					<div className="rounded-full bg-green-100 dark:bg-green-900/30 w-12 h-12 flex items-center justify-center mx-auto mb-2">
						<Icons.Check className="h-6 w-6 text-green-600 dark:text-green-400" />
					</div>
					<h2 className="text-xl font-semibold text-center">Request Submitted!</h2>
					<p className="text-center text-muted-foreground">
						Thank you for your request. We'll review it and get back to you soon.
					</p>
					<div className="pt-4">
						<button
							type="button"
							onClick={() => window.location.reload()}
							className="w-full text-primary hover:text-primary/90 text-sm font-medium"
						>
							Submit another request
						</button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-border bg-background">
			<CardContent className="pt-6 px-6 pb-8">
				<Form className="space-y-4" action={formAction}>
					<div>
						<Label htmlFor="email" className="mb-1.5 block">
							Your Email <span className="text-destructive">*</span>
						</Label>
						<Input id="email" name="email" type="email" placeholder="your@email.com" required />
					</div>

					<div>
						<Label htmlFor="description" className="mb-1.5 block">
							Describe asset <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="description"
							name="description"
							placeholder="Describe the asset or theme you're looking for in detail..."
							className="min-h-[120px]"
							required
						/>
					</div>

					<div>
						<Label htmlFor="attachment" className="mb-1.5 block">
							Attachments (Optional)
						</Label>
						<DynamicFileUploader
							name="attachment[]"
							accept={{ "image/*": [], "application/pdf": [] }}
							maxSize={5 * 1024 * 1024}
							maxFiles={5}
							multiple={false}
						/>
						<p className="text-xs text-muted-foreground mt-1">Upload a reference image or document (max 5MB)</p>
					</div>

					{state.error && <p className="text-destructive text-sm font-medium">{state.error}</p>}

					<div className="pt-2">
						<SubmitButton
							pending={pending}
							icon={<Icons.ArrowOutward className="h-4 w-4" />}
							className="w-full md:w-auto"
						>
							Send Request
						</SubmitButton>
						<p className="text-xs text-muted-foreground mt-2">
							With <span className="font-medium text-foreground">Plus</span> license, your request will have priority
							and when completed it will be available only to plus users.
						</p>
					</div>
				</Form>
			</CardContent>
		</Card>
	);
}
