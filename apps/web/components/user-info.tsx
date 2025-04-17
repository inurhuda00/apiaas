import Link from "next/link";
import type { User } from "@apiaas/db/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/actions/auth";
import { Icons } from "@/components/ui/icons";
import { LogoutForm } from "./form-logout";

interface UserInfoProps {
	user: Pick<User, "id" | "name" | "email" | "role">;
}

export function UserInfo({ user }: UserInfoProps) {
	return (
		<div className="flex items-center gap-4">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-8 w-8 ">
						<Avatar className="h-8 w-8">
							<AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<div className="flex items-center justify-start gap-2 p-2">
						<div className="flex flex-col space-y-1 leading-none">
							{user.name && <p className="font-medium">{user.name}</p>}
							{user.email && <p className="w-[200px] truncate text-sm text-gray-500">{user.email}</p>}
						</div>
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href="/overview">
							<Icons.Overview className="mr-2 size-4" />
							Overview
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/settings/general">
							<Icons.Settings className="mr-2 size-4" />
							Settings
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<LogoutForm />
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
