import Image from "next/image";
import Link from "next/link";

interface AssetCardProps {
	id: number;
	imageUrl: string;
	title: string;
	category: string;
	locked: boolean;
	slug: string;
}

const AssetCard: React.FC<AssetCardProps> = ({ imageUrl, title, category, locked, slug }) => {
	return (
		<div className="group relative overflow-hidden border border-border bg-card rounded-lg transition-all hover:shadow-md">
			<Link href={`/${category}/${slug}`}>
				<div className="relative aspect-square w-full">
					<Image
						src={imageUrl}
						alt={title}
						fill
						className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
					/>
				</div>
			</Link>

			{locked && (
				<div className="absolute top-4 right-4">
					<span className="bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded">PRO</span>
				</div>
			)}

			<div className="flex items-center justify-between p-4 border-t border-border">
				<div className="w-full">
					<h3 className="font-medium text-card-foreground text-sm truncate whitespace-nowrap">{title}</h3>
				</div>
			</div>
		</div>
	);
};

export default AssetCard;
