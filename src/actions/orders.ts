"use server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";

interface CreateOrderItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  image?: string | null;
  storeId: string;
  vendorId: string;
}

interface CreateOrderInput {
  items: CreateOrderItem[];
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingNotes?: string;
  paymentMethod: "COD" | "CARD" | "WALLET" | "BANK_TRANSFER";
  shippingMethod: "VENDOR_DELIVERY" | "PLATFORM_DELIVERY" | "EXTERNAL_COURIER" | "PICKUP";
  shippingAmount: number;
  couponCode?: string | null;
  discountAmount?: number;
}

export async function createOrder(input: CreateOrderInput) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  if (!input.items.length) {
    return { success: false, error: "السلة فارغة" };
  }

  try {
    // Validate stock
    for (const item of input.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return { success: false, error: `المنتج غير موجود: ${item.productName}` };
      }
      if (!product.allowBackorder && product.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `الكمية غير متوفرة للمنتج: ${item.productName}`,
        };
      }
    }

    const subtotal = input.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
    const discountAmount = input.discountAmount || 0;
    const totalAmount = subtotal - discountAmount + input.shippingAmount;

    // Group by vendor for sub-orders
    const byVendor: Record<string, CreateOrderItem[]> = {};
    for (const item of input.items) {
      if (!byVendor[item.vendorId]) byVendor[item.vendorId] = [];
      byVendor[item.vendorId].push(item);
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user.id,
          status: "PENDING",
          paymentStatus: input.paymentMethod === "COD" ? "PENDING" : "PENDING",
          paymentMethod: input.paymentMethod,
          shippingMethod: input.shippingMethod,
          shippingName: input.shippingName,
          shippingPhone: input.shippingPhone,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingNotes: input.shippingNotes,
          subtotal,
          discountAmount,
          shippingAmount: input.shippingAmount,
          taxAmount: 0,
          totalAmount,
          couponCode: input.couponCode,
          platformFee: 0, // calculated per sub-order
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: "PENDING",
          note: "تم إنشاء الطلب",
          changedBy: user.id,
        },
      });

      let totalPlatformFee = 0;

      for (const [vendorId, vendorItems] of Object.entries(byVendor)) {
        const vendor = await tx.vendor.findUnique({ where: { id: vendorId } });
        const vendorSubtotal = vendorItems.reduce(
          (s, i) => s + i.unitPrice * i.quantity,
          0
        );
        const commissionRate = vendor?.commissionRate ?? 10;
        const commissionAmount = (vendorSubtotal * commissionRate) / 100;
        totalPlatformFee += commissionAmount;

        const subOrder = await tx.subOrder.create({
          data: {
            orderId: newOrder.id,
            vendorId,
            storeId: vendorItems[0]?.storeId,
            status: "PENDING",
            subtotal: vendorSubtotal,
            shippingAmount: 0, // can be split later
            commissionAmount,
            vendorAmount: vendorSubtotal - commissionAmount,
          },
        });

        for (const item of vendorItems) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              subOrderId: subOrder.id,
              productId: item.productId,
              variantId: item.variantId || null,
              productName: item.productName,
              variantName: item.variantName,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
              image: item.image,
            },
          });

          // Decrease stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { decrement: item.quantity },
              soldCount: { increment: item.quantity },
            },
          });

          // Inventory log
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: -item.quantity,
              type: "sale",
              reason: `Order ${newOrder.orderNumber}`,
              referenceId: newOrder.id,
              userId: user.id,
            },
          });
        }
      }

      // Update platform fee on order
      await tx.order.update({
        where: { id: newOrder.id },
        data: { platformFee: totalPlatformFee },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: totalAmount,
          method: input.paymentMethod,
          status: "PENDING",
        },
      });

      // Increment coupon usage
      if (input.couponCode) {
        await tx.coupon.updateMany({
          where: { code: input.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    revalidatePath("/ar/account/orders");
    revalidatePath("/ar/vendor");
    revalidatePath("/ar/admin");

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  } catch (err) {
    console.error("Create order error:", err);
    return { success: false, error: "حدث خطأ أثناء إنشاء الطلب" };
  }
}
