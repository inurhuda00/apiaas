import { signOut } from "@/actions/auth";
import { useActionState } from "react";
import { Icons } from "./ui/icons";
import { SubmitButton } from "./ui/submit-button";
import Form from "next/form";

export function LogoutForm() {
	const [_state, formAction, pending] = useActionState(signOut, {
		onSubmit: () => {},
	});
	return (
	<Form prefetch={false} action={formAction}>
			<SubmitButton
				variant="ghost"
				className="flex w-full items-center"
				pending={pending}
				icon={<Icons.ExitToApp className="size-4" />}
			>
				Logout
			</SubmitButton>
		</Form>
	);
}
