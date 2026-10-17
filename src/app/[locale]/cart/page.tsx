"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { validateCoupon } from "@/actions/coupons";
import { Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getItemsByStore,
    clearCart,
    couponCode,
    setCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const grouped = getItemsByStore();
  const shippingEstimate = items.length > 0 ? 30 : 0;
  const total = Math.max(0, subtotal - discount + shippingEstimate);

  async function applyCoupon() {
    setCouponError("");
    setCouponLoading(true);
    const result = await validateCoupon(couponInput, subtotal);
    setCouponLoading(false);
    if (result.success) {
      setDiscount(result.discountAmount || 0);
      setCoupon(result.couponCode || null);
    } else {
      setDiscount(0);
      setCoupon(null);
      setCouponError(result.error || "كود غير صالح");
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-custom flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">السلة فارغة</h1>
        <p className="mb-6 text-muted-foreground">
          لم تضف أي منتجات بعد. ابدأ التسوق الآن!
        </p>
        <Link href="/ar/search">
          <Button size="lg">تصفح المنتجات</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">سلة التسوق ({items.length})</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          إفراغ السلة
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(grouped).map(([storeId, storeItems]) => (
            <div key={storeId} className="rounded-2xl border bg-white p-4">
              <h3 className="mb-4 font-semibold text-primary">
                {storeItems[0]?.storeName || "متجر"}
              </h3>
              <div className="space-y-4">
                {storeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/ar/product/${item.productId}`}
                          className="line-clamp-2 text-sm font-medium hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm font-bold text-primary">
                        {formatPrice(item.price)}
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">ملخص الطلب</h2>

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="كود الخصم"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="h-10"
                  dir="ltr"
                />
                <Button
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={couponLoading || !couponInput}
                  className="shrink-0"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {couponError && (
                <p className="mt-1 text-xs text-destructive">{couponError}</p>
              )}
              {discount > 0 && (
                <p className="mt-1 text-xs text-success">
                  تم تطبيق الخصم: {formatPrice(discount)}
                </p>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>الخصم</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">الشحن (تقديري)</span>
                <span>{formatPrice(shippingEstimate)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/ar/checkout" className="mt-6 block">
              <Button className="w-full" size="lg">
                إتمام الشراء
              </Button>
            </Link>
            <Link href="/ar/search" className="mt-3 block">
              <Button variant="outline" className="w-full">
                متابعة التسوق
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
