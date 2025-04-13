import { cn } from "@/lib/utils/cn";

interface MaxWidthWrapperProps {
	className?: string;
	children: React.ReactNode;
}

export function MaxWidthWrapper({ className, children }: MaxWidthWrapperProps) {
	return (
		<section
			className={cn(
				"mx-auto w-full max-w-screen-xl px-2.5 md:px-32",
				className,
			)}
		>
			{children}
		</section>
	);
}
