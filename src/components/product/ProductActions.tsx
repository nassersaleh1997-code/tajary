"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { Heart, Minus, Plus, ShoppingCart, Zap } from "lucide-react";

interface ProductActionsProps {
  product: {
    id: string;
    nameAr: string;
    basePrice: number;
    compareAtPrice?: number | null;
    stockQuantity: number;
    vendorId: string;
    store?: { id: string; name: string; slug: string } | null;
    images?: { url: string; isPrimary?: boolean }[];
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  const image =
    product.images?.find((i) => i.isPrimary)?.url ||
    product.images?.[0]?.url ||
    null;

  const maxQty = product.stockQuantity;

  function handleAddToCart() {
    if (maxQty <= 0) return;
    addItem({
      productId: product.id,
      name: product.nameAr,
      image,
      price: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      stock: maxQty,
      storeId: product.store?.id || "",
      storeName: product.store?.name || "",
      vendorId: product.vendorId,
      quantity: qty,
    });
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/ar/checkout");
  }

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">الكمية:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border"
            disabled={qty <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-medium">{qty}</span>
          <button
            onClick={() => setQty(Math.min(maxQty, qty + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border"
            disabled={qty >= maxQty}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={maxQty <= 0}
        >
          <ShoppingCart className="ml-2 h-5 w-5" />
          أضف إلى السلة
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="flex-1"
          onClick={handleBuyNow}
          disabled={maxQty <= 0}
        >
          <Zap className="ml-2 h-5 w-5" />
          اشترِ الآن
        </Button>
        <Button size="lg" variant="outline" className="sm:w-auto">
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
