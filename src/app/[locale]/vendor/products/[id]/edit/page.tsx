import { redirect, notFound } from "next/navigation";
import { getCurrentUser, isVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditProductForm } from "@/components/vendor/EditProductForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !isVendor(user.role)) redirect("/ar/auth/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: user.id },
  });
  if (!vendor) redirect("/ar/vendor");

  const product = await prisma.product.findFirst({
    where: { id, vendorId: vendor.id },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (!product) notFound();

  return (
    <div className="container-custom max-w-3xl py-8">
      <EditProductForm product={product} />
    </div>
  );
}
