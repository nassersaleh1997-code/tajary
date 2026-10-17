"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function validateCoupon(code: string, subtotal: number) {
  if (!code?.trim()) {
    return { success: false, error: "أدخل كود الخصم" };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return { success: false, error: "كود الخصم غير صالح" };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { success: false, error: "كود الخصم لم يبدأ بعد" };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { success: false, error: "كود الخصم منتهي الصلاحية" };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { success: false, error: "تم استنفاد مرات استخدام هذا الكود" };
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      success: false,
      error: `الحد الأدنى للطلب ${coupon.minOrderAmount} ج.م`,
    };
  }

  // Per-user limit check
  const user = await getCurrentUser();
  if (user && coupon.perUserLimit) {
    const usedByUser = await prisma.order.count({
      where: {
        userId: user.id,
        couponCode: coupon.code,
        status: { not: "CANCELLED" },
      },
    });
    if (usedByUser >= coupon.perUserLimit) {
      return { success: false, error: "لقد استخدمت هذا الكود من قبل" };
    }
  }

  let discountAmount = 0;
  if (coupon.type === "PERCENTAGE") {
    discountAmount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else if (coupon.type === "FIXED_AMOUNT") {
    discountAmount = Math.min(coupon.value, subtotal);
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    success: true,
    discountAmount,
    couponCode: coupon.code,
    type: coupon.type,
    value: coupon.value,
  };
}
