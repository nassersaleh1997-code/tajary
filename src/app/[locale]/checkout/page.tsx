"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { createOrder } from "@/actions/orders";
import { validateCoupon } from "@/actions/coupons";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart, couponCode } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD" | "WALLET">("COD");
  const [shippingMethod, setShippingMethod] = useState("VENDOR_DELIVERY");

  const subtotal = getSubtotal();
  const shipping = shippingMethod === "PICKUP" ? 0 : 30;
  const total = Math.max(0, subtotal - discount + shipping);

  useEffect(() => {
    if (couponCode && subtotal > 0) {
      validateCoupon(couponCode, subtotal).then((r) => {
        if (r.success) setDiscount(r.discountAmount || 0);
        else setDiscount(0);
      });
    }
  }, [couponCode, subtotal]);

  if (items.length === 0) {
    return (
      <div className="container-custom py-24 text-center">
        <h1 className="text-xl font-bold">السلة فارغة</h1>
        <Button className="mt-4" onClick={() => router.push("/ar")}>
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      const result = await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.price,
          productName: item.name,
          sku: item.sku,
          image: item.image,
          storeId: item.storeId,
          vendorId: item.vendorId,
        })),
        shippingName: address.name,
        shippingPhone: address.phone,
        shippingAddress: address.address,
        shippingCity: address.city,
        shippingNotes: address.notes,
        paymentMethod,
        shippingMethod: shippingMethod as any,
        shippingAmount: shipping,
        couponCode: couponCode || null,
        discountAmount: discount,
      });

      if (result.success) {
        clearCart();
        router.push(`/ar/account/orders?success=1&order=${result.orderNumber}`);
      } else {
        alert(result.error || "حدث خطأ");
      }
    } catch {
      alert("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-custom py-8">
      <h1 className="mb-8 text-2xl font-bold">إتمام الطلب</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-white">
                1
              </span>
              عنوان التوصيل
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">الاسم</label>
                <Input
                  value={address.name}
                  onChange={(e) =>
                    setAddress({ ...address, name: e.target.value })
                  }
                  placeholder="الاسم الكامل"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">رقم الهاتف</label>
                <Input
                  value={address.phone}
                  onChange={(e) =>
                    setAddress({ ...address, phone: e.target.value })
                  }
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm">العنوان التفصيلي</label>
                <Input
                  value={address.address}
                  onChange={(e) =>
                    setAddress({ ...address, address: e.target.value })
                  }
                  placeholder="الشارع، المبنى، الشقة..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">المدينة</label>
                <Input
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  placeholder="القاهرة"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">ملاحظات (اختياري)</label>
                <Input
                  value={address.notes}
                  onChange={(e) =>
                    setAddress({ ...address, notes: e.target.value })
                  }
                  placeholder="ملاحظات للتوصيل"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping */}
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-white">
                2
              </span>
              طريقة التوصيل
            </h2>
            <div className="space-y-3">
              {[
                { id: "VENDOR_DELIVERY", label: "توصيل بواسطة المتجر", price: 30 },
                { id: "PICKUP", label: "استلام من المتجر", price: 0 },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 ${
                    shippingMethod === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === m.id}
                      onChange={() => setShippingMethod(m.id)}
                      className="accent-primary"
                    />
                    <span className="font-medium">{m.label}</span>
                  </div>
                  <span className="text-sm">
                    {m.price === 0 ? "مجاني" : formatPrice(m.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Payment */}
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-white">
                3
              </span>
              طريقة الدفع
            </h2>
            <div className="space-y-3">
              {[
                { id: "COD", label: "الدفع عند الاستلام" },
                { id: "CARD", label: "بطاقة ائتمان / خصم (قريبًا)" },
                { id: "WALLET", label: "محفظة إلكترونية (قريبًا)" },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 ${
                    paymentMethod === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  } ${m.id !== "COD" ? "opacity-60" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id as any)}
                    disabled={m.id !== "COD"}
                    className="accent-primary"
                  />
                  <span className="font-medium">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-24 rounded-2xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">ملخص الطلب</h2>
            <div className="mb-4 max-h-48 space-y-2 overflow-y-auto text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="line-clamp-1">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>الخصم {couponCode && `(${couponCode})`}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">الشحن</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={
                loading ||
                !address.name ||
                !address.phone ||
                !address.address ||
                !address.city
              }
            >
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تأكيد الطلب
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
