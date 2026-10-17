import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Package } from "lucide-react";
import { DeleteProductButton } from "@/components/vendor/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function VendorProductsPage() {
  const user = await getCurrentUser();
  if (!user || !isVendor(user.role)) redirect("/ar/auth/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: user.id },
  });
  if (!vendor) redirect("/ar/vendor");

  const products = await prisma.product.findMany({
    where: {
      vendorId: vendor.id,
      status: { not: "ARCHIVED" },
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container-custom py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} منتج
          </p>
        </div>
        <Link href="/ar/vendor/products/new">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة منتج
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-20 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold">لا توجد منتجات بعد</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            ابدأ بإضافة أول منتج لمتجرك
          </p>
          <Link href="/ar/vendor/products/new">
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">المنتج</th>
                  <th className="px-4 py-3 text-right font-medium">السعر</th>
                  <th className="px-4 py-3 text-right font-medium">المخزون</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {p.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0].url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{p.nameAr}</p>
                          {p.sku && (
                            <p className="text-xs text-muted-foreground" dir="ltr">
                              {p.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatPrice(p.basePrice)}</p>
                      {p.compareAtPrice && p.compareAtPrice > p.basePrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(p.compareAtPrice)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.stockQuantity <= p.lowStockThreshold
                            ? "font-medium text-warning"
                            : ""
                        }
                      >
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "ACTIVE"
                            ? "bg-success/10 text-success"
                            : p.status === "DRAFT"
                            ? "bg-muted text-muted-foreground"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {p.status === "ACTIVE"
                          ? "نشط"
                          : p.status === "DRAFT"
                          ? "مسودة"
                          : p.status === "OUT_OF_STOCK"
                          ? "نفد"
                          : p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/ar/vendor/products/${p.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteProductButton productId={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
