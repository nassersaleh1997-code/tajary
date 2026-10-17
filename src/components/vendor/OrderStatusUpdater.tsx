"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/actions/order-status";
import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

const NEXT_ACTIONS: Record<string, { status: OrderStatus; label: string }[]> = {
  PENDING: [
    { status: "CONFIRMED", label: "تأكيد الطلب" },
    { status: "CANCELLED", label: "رفض / إلغاء" },
  ],
  CONFIRMED: [
    { status: "PREPARING", label: "بدء التجهيز" },
    { status: "CANCELLED", label: "إلغاء" },
  ],
  PREPARING: [
    { status: "READY", label: "جاهز للشحن" },
  ],
  READY: [
    { status: "SHIPPED", label: "تم الشحن" },
  ],
  SHIPPED: [
    { status: "OUT_FOR_DELIVERY", label: "خرج للتوصيل" },
  ],
  OUT_FOR_DELIVERY: [
    { status: "DELIVERED", label: "تم التسليم" },
  ],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: [],
  REFUNDED: [],
};

export function OrderStatusUpdater({
  subOrderId,
  orderId,
  currentStatus,
}: {
  subOrderId: string;
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const actions = NEXT_ACTIONS[currentStatus] || [];

  if (actions.length === 0) return null;

  async function handleUpdate(status: OrderStatus, label: string) {
    if (status === "CANCELLED" && !confirm("هل أنت متأكد من إلغاء الطلب؟")) {
      return;
    }
    setLoading(status);
    const result = await updateOrderStatus(orderId, status, label, subOrderId);
    setLoading(null);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          size="sm"
          variant={action.status === "CANCELLED" ? "destructive" : "default"}
          disabled={!!loading}
          onClick={() => handleUpdate(action.status, action.label)}
        >
          {loading === action.status && (
            <Loader2 className="ml-1 h-3 w-3 animate-spin" />
          )}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
