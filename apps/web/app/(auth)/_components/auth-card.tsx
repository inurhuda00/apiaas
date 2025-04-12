import { forwardRef } from "react";

interface AuthCardProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	className?: string;
}

export const AuthCard = forwardRef<HTMLDivElement, AuthCardProps>(
	({ title, subtitle, children, className = "" }, ref) => {
		return (
			<div ref={ref} className={className}>
				<div className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight text-gray-900">
						{title}
					</h1>
					{subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
				</div>
				{children}
			</div>
		);
	},
);

AuthCard.displayName = "AuthCard";
