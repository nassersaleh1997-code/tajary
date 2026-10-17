"use server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(productId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "يجب تسجيل الدخول", requiresAuth: true };
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId: user.id, productId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      revalidatePath("/ar/account/favorites");
      return { success: true, favorited: false };
    }

    await prisma.favorite.create({
      data: { userId: user.id, productId },
    });
    revalidatePath("/ar/account/favorites");
    return { success: true, favorited: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "حدث خطأ" };
  }
}

export async function getFavoriteIds() {
  const user = await getCurrentUser();
  if (!user) return [];
  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });
  return favs.map((f) => f.productId);
}
