import { cn } from "@/lib/utils/cn";
import { Button, type ButtonProps } from "./button";
import { Icons } from "./icons";

export function SubmitButton({
	children,
	pending,
	icon,
	...props
}: {
	children: React.ReactNode;
	pending: boolean;
	icon?: React.ReactNode;
} & ButtonProps) {
	return (
		<Button
			type="submit"
			disabled={pending}
			{...props}
			className={cn(props.className, "relative")}
		>
			{icon && (
				<span className={cn("mr-2", { "opacity-0": pending })}>{icon}</span>
			)}
			<span className={cn({ "opacity-0": pending })}>{children}</span>

			{pending && (
				<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					<Icons.Spinner className="h-4 w-4 animate-spin" />
				</span>
			)}
		</Button>
	);
}
