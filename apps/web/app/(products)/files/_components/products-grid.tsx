"use client";

import { memo, useCallback, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import type { Product } from "@apiaas/db/schema";
import { useRouter } from "next/navigation";
import { ProductActionButtons } from "./product-action-buttons";

// Props interface with clear typing - O(1)
interface ProductsGridProps {
  products: ProductWithRelations[];
}

// Type definition for product with loaded relations - O(1)
type ProductWithRelations = Product & {
  images: { url: string }[];
  files: unknown[];
  category: { slug: string };
};

// Memoized product card component to prevent unnecessary re-renders - O(1) per card
const ProductCard = memo(({ 
  product, 
  onDelete 
}: { 
  product: ProductWithRelations; 
  onDelete: (id: string) => void;
}) => {
  const productId = String(product.id);
  
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="aspect-square bg-muted relative">
        {product.images?.length > 0 ? (
          <div className="w-full h-full relative overflow-hidden">
            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icons.Inventory className="h-16 w-16 text-muted-foreground opacity-30" />
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg truncate" title={product.name}>
          {product.name}
        </CardTitle>
        <CardDescription>
          {formatDistanceToNow(new Date(product.createdAt), {
            addSuffix: true,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 pt-0 flex-grow">
        <div className="text-xs text-muted-foreground mt-auto">
          <p className="flex items-center gap-1">
            <Icons.Description className="h-3 w-3" />
            <span>{product.files?.length || 0} Files</span>
          </p>
        </div>
      </CardContent>
      <div className="px-6 pb-4 pt-0">
        <ProductActionButtons 
          product={{
            id: productId,
            name: product.name,
            slug: product.slug
          }}
          onDeleteSuccess={() => onDelete(productId)}
        />
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export function ProductsGrid({ products: initialProducts }: ProductsGridProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>(initialProducts);
  const router = useRouter();
  
  // Early return if no products - O(1)
  if (products.length === 0) {
    return null;
  }
  
  // Memoized callback for deletion - O(1)
  const handleProductDeleted = useCallback((productId: string) => {
    // Filter operation - O(n) where n is number of products
    setProducts((prevProducts) => 
      prevProducts.filter((product) => String(product.id) !== productId)
    );
    
    // Refresh the page data
    router.refresh();
  }, [router]);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {/* Map operation - O(n) where n is number of products */}
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onDelete={handleProductDeleted} 
        />
      ))}
    </div>
  );
} 