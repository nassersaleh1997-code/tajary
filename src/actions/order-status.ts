"use server";

import { getCurrentUser, isVendor, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

const VENDOR_ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["SHIPPED"],
  SHIPPED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  subOrderId?: string
) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "يجب تسجيل الدخول" };
  }

  try {
    if (subOrderId) {
      // Vendor updating their sub-order
      if (!isVendor(user.role) && !isAdmin(user.role)) {
        return { success: false, error: "غير مصرح" };
      }

      const subOrder = await prisma.subOrder.findUnique({
        where: { id: subOrderId },
        include: {
          vendor: true,
          order: true,
        },
      });

      if (!subOrder) {
        return { success: false, error: "الطلب الفرعي غير موجود" };
      }

      if (isVendor(user.role) && !isAdmin(user.role)) {
        const vendor = await prisma.vendor.findUnique({
          where: { userId: user.id },
        });
        if (!vendor || subOrder.vendorId !== vendor.id) {
          return { success: false, error: "غير مصرح بتعديل هذا الطلب" };
        }
      }

      const allowed = VENDOR_ALLOWED_TRANSITIONS[subOrder.status] || [];
      if (!allowed.includes(newStatus) && !isAdmin(user.role)) {
        return {
          success: false,
          error: `لا يمكن الانتقال من ${subOrder.status} إلى ${newStatus}`,
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.subOrder.update({
          where: { id: subOrderId },
          data: { status: newStatus },
        });

        // Also update main order status if all sub-orders share same status
        // or advance main order based on this change
        await tx.orderStatusHistory.create({
          data: {
            orderId: subOrder.orderId,
            status: newStatus,
            note: note || `تم تحديث حالة الطلب الفرعي إلى ${newStatus}`,
            changedBy: user.id,
          },
        });

        // If delivered/cancelled, sync main order when appropriate
        if (["DELIVERED", "CANCELLED", "REFUNDED"].includes(newStatus)) {
          const allSubs = await tx.subOrder.findMany({
            where: { orderId: subOrder.orderId },
          });
          const allSame = allSubs.every(
            (s) => s.id === subOrderId || s.status === newStatus
          );
          if (allSame) {
            await tx.order.update({
              where: { id: subOrder.orderId },
              data: {
                status: newStatus,
                ...(newStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
                ...(newStatus === "CANCELLED" ? { cancelledAt: new Date() } : {}),
              },
            });
          }
        } else {
          // Advance main order status
          await tx.order.update({
            where: { id: subOrder.orderId },
            data: { status: newStatus },
          });
        }

        // Restore stock on cancel
        if (newStatus === "CANCELLED") {
          const items = await tx.orderItem.findMany({
            where: { subOrderId },
          });
          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: { increment: item.quantity },
                soldCount: { decrement: item.quantity },
              },
            });
            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                type: "cancel",
                reason: `إلغاء الطلب ${subOrder.order.orderNumber}`,
                referenceId: subOrder.orderId,
                userId: user.id,
              },
            });
          }
        }
      });
    } else {
      // Admin updating main order
      if (!isAdmin(user.role)) {
        return { success: false, error: "غير مصرح" };
      }

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return { success: false, error: "الطلب غير موجود" };
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            ...(newStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
            ...(newStatus === "CANCELLED" ? { cancelledAt: new Date() } : {}),
          },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            status: newStatus,
            note: note || `تم التحديث بواسطة الإدارة`,
            changedBy: user.id,
          },
        });
        // Sync all sub-orders
        await tx.subOrder.updateMany({
          where: { orderId },
          data: { status: newStatus },
        });
      });
    }

    revalidatePath("/ar/vendor/orders");
    revalidatePath("/ar/admin");
    revalidatePath("/ar/account/orders");

    return { success: true };
  } catch (err) {
    console.error("Update order status error:", err);
    return { success: false, error: "حدث خطأ أثناء تحديث الحالة" };
  }
}
