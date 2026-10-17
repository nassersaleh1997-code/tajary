"use server";

import { getCurrentUser, isVendor } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { storeSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function updateStore(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !isVendor(user.role)) {
    return { success: false, error: "غير مصرح" };
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: user.id },
    include: { store: true },
  });
  if (!vendor) {
    return { success: false, error: "لم يتم العثور على حساب التاجر" };
  }

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    minOrderAmount: Number(formData.get("minOrderAmount") || 0),
  };

  const parsed = storeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "بيانات غير صالحة",
    };
  }

  const data = parsed.data;
  const isOpen = formData.get("isOpen") === "on";

  try {
    if (vendor.store) {
      await prisma.store.update({
        where: { id: vendor.store.id },
        data: {
          name: data.name,
          description: data.description,
          phone: data.phone,
          email: data.email || null,
          address: data.address,
          city: data.city,
          minOrderAmount: data.minOrderAmount,
          isOpen,
        },
      });
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { businessName: data.name, description: data.description },
      });
    } else {
      // Create store for first time
      let slug = slugify(data.name);
      const exists = await prisma.store.findUnique({ where: { slug } });
      if (exists) slug = `${slug}-${Date.now().toString(36)}`;

      await prisma.store.create({
        data: {
          vendorId: vendor.id,
          slug,
          name: data.name,
          description: data.description,
          phone: data.phone,
          email: data.email || null,
          address: data.address,
          city: data.city,
          minOrderAmount: data.minOrderAmount,
          isOpen,
          status: "PENDING",
        },
      });
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { businessName: data.name, description: data.description },
      });
    }

    revalidatePath("/ar/vendor");
    revalidatePath("/ar/vendor/store");
    if (vendor.store) {
      revalidatePath(`/ar/store/${vendor.store.slug}`);
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "حدث خطأ أثناء الحفظ" };
  }
}
