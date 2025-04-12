import { MaxWidthWrapper } from "@/components/max-width-wrapper";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{
		checkoutId: string;
	}>;
}) {
	// Checkout has been confirmed
	// Now, make sure to capture the Checkout.updated webhook event to update the order status in your system

	const { checkoutId } = await searchParams;

	return (
		<MaxWidthWrapper>
			<div className="grid min-h-[calc(100dvh-24.625rem)]">
				<h1 className="text-2xl text-balance place-self-center">
					Thank you! Your checkout {checkoutId} is now being processed.
				</h1>
			</div>
		</MaxWidthWrapper>
	);
}
