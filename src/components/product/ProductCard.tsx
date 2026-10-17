"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

interface ProductCardProps {
  product: {
    id: string;
    nameAr: string;
    slug: string;
    basePrice: number;
    compareAtPrice?: number | null;
    rating: number;
    reviewCount: number;
    stockQuantity: number;
    images?: { url: string; isPrimary?: boolean }[];
    store?: { id: string; name: string; slug: string };
    vendorId: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const image =
    product.images?.find((i) => i.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder-product.png";

  const { percentage } = calculateDiscount(
    product.basePrice,
    product.compareAtPrice
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockQuantity <= 0) return;

    addItem({
      productId: product.id,
      name: product.nameAr,
      image,
      price: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      stock: product.stockQuantity,
      storeId: product.store?.id || "",
      storeName: product.store?.name || "",
      vendorId: product.vendorId,
    });
  };

  return (
    <Link
      href={`/ar/product/${product.slug}`}
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.nameAr}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {percentage > 0 && (
          <span className="absolute top-2 right-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-white">
            -{percentage}%
          </span>
        )}
        <button
          className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            // TODO: toggle favorite
          }}
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        {product.store && (
          <p className="mb-1 truncate text-xs text-muted-foreground">
            {product.store.name}
          </p>
        )}
        <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-snug">
          {product.nameAr}
        </h3>

        <div className="mb-2 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-primary">
              {formatPrice(product.basePrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
              <span className="mr-1 text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 shrink-0"
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {product.stockQuantity <= 0 && (
          <p className="mt-1 text-xs text-destructive">نفد من المخزون</p>
        )}
      </div>
    </Link>
  );
}
