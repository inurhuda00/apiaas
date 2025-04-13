import { signOut } from "@/actions/auth";
import { useActionState } from "react";
import { Icons } from "./ui/icons";
import { SubmitButton } from "./ui/submit-button";

export function LogoutForm() {
	const [_state, formAction, pending] = useActionState(signOut, {
		onSubmit: () => {},
	});
	return (
		<form action={formAction}>
			<SubmitButton
				variant="ghost"
				className="flex w-full items-center"
				pending={pending}
				icon={<Icons.ExitToApp className="size-4" />}
			>
				Logout
			</SubmitButton>
		</form>
	);
}
