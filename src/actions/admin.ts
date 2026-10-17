"use server";

import { getCurrentUser, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateVendorStatus(
  vendorId: string,
  status: "ACTIVE" | "SUSPENDED" | "PENDING" | "CLOSED"
) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) {
    return { success: false, error: "غير مصرح" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vendor.update({
        where: { id: vendorId },
        data: {
          status,
          isVerified: status === "ACTIVE",
        },
      });
      const store = await tx.store.findUnique({ where: { vendorId } });
      if (store) {
        await tx.store.update({
          where: { id: store.id },
          data: {
            status: status === "ACTIVE" ? "ACTIVE" : status === "SUSPENDED" ? "SUSPENDED" : store.status,
          },
        });
      }
    });

    revalidatePath("/ar/admin/vendors");
    revalidatePath("/ar/admin");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "حدث خطأ" };
  }
}
