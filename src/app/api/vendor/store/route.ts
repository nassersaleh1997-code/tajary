import { NextResponse } from "next/server";
import { getCurrentUser, isVendor } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isVendor(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: user.id },
    include: { store: true },
  });

  return NextResponse.json({
    store: vendor?.store || null,
    vendor: vendor
      ? { id: vendor.id, businessName: vendor.businessName, status: vendor.status }
      : null,
  });
}
