"use server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addressSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createAddress(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "يجب تسجيل الدخول" };

  const raw = {
    label: formData.get("label") as string,
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    district: (formData.get("district") as string) || undefined,
    isDefault: formData.get("isDefault") === "on",
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "بيانات غير صالحة" };
  }

  try {
    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    await prisma.address.create({
      data: {
        userId: user.id,
        ...parsed.data,
      },
    });

    revalidatePath("/ar/account/addresses");
    revalidatePath("/ar/checkout");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "حدث خطأ" };
  }
}

export async function deleteAddress(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "يجب تسجيل الدخول" };

  await prisma.address.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/ar/account/addresses");
  return { success: true };
}
