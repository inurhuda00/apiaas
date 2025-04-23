import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { RequestForm } from "./_components/request-form";

export const metadata = {
	title: "Request Assets & Themes",
	description: "Submit your request for new assets and themes. We'll deliver them to you.",
};

export default function RequestPage() {
	return (
		<div className="py-8 sm:py-10 md:py-12 lg:py-16">
			<MaxWidthWrapper>
				<div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
					<div className="mb-4 sm:mb-6 md:mb-8 space-y-2 sm:space-y-3 col-span-full md:col-span-5 lg:col-span-5">
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">You request new assets & themes, we deliver.</h1>
						<p className="text-muted-foreground text-base sm:text-lg">
							Fill out the form to request custom backgrounds or themes for your content.
						</p>
					</div>
					<div className="col-span-full md:col-span-7 lg:col-span-7">
						<RequestForm />
					</div>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
