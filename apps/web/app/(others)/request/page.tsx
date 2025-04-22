import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { RequestForm } from "./_components/request-form";

export const metadata = {
	title: "Request Assets & Themes",
	description: "Submit your request for new assets and themes. We'll deliver them to you.",
};

export default function RequestPage() {
	return (
		<div className="py-12 md:py-16">
			<MaxWidthWrapper>
				<div className="max-w-3xl mx-auto">
					<div className="mb-8 space-y-2">
						<h1 className="text-3xl md:text-4xl font-bold">You request new assets & themes, we deliver.</h1>
						<p className="text-muted-foreground text-lg">Fill out the form below to request new assets or themes.</p>
					</div>
					<RequestForm />
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
