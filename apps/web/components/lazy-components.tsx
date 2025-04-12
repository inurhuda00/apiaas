import dynamic from "next/dynamic";
import { ProductCardSkeleton } from "./skeletons/product-grid-skeleton";
import {
	DataControlsSkeleton,
	PaginateSkeleton,
} from "./skeletons/data-controls-skeleton";

export const DynamicProductCard = dynamic(
	() =>
		import("@/components/product-card").then((mod) => ({
			default: mod.ProductCard,
		})),
	{ loading: () => <ProductCardSkeleton /> },
);

export const DynamicDataControls = dynamic(
	() =>
		import("@/components/data-controls").then((mod) => ({
			default: mod.DataControls,
		})),
	{ loading: () => <DataControlsSkeleton /> },
);

export const DynamicPaginate = dynamic(
	() =>
		import("@/components/data-controls").then((mod) => ({
			default: mod.Paginate,
		})),
	{ loading: () => <PaginateSkeleton /> },
);
