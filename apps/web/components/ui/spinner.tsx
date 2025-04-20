import type { CSSProperties } from "react";

const bars = Array(12).fill(0);

interface SpinnerProps {
	size?: number;
	className?: string;
}

export const Spinner = ({ size = 16, className = "" }: SpinnerProps) => {
	return (
		<div className={`loading-parent ${className}`}>
			<div
				className="loading-wrapper"
				data-visible
				// @ts-ignore
				style={{ "--spinner-size": `${size}px` } as CSSProperties}
			>
				<div className="spinner">
					{bars.map((_, i) => (
						<div className="loading-bar" key={`spinner-bar-${String(i)}`} />
					))}
				</div>
			</div>
		</div>
	);
};
