import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ar/auth/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          images: { take: 1 },
          store: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = favorites
    .filter((f) => f.product.status === "ACTIVE")
    .map((f) => f.product);

  return (
    <div className="container-custom py-8">
      <h1 className="mb-6 text-2xl font-bold">المفضلة</h1>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium">لا توجد منتجات في المفضلة</p>
          <p className="mb-6 text-sm text-muted-foreground">
            أضف منتجات تعجبك لتجدها هنا لاحقًا
          </p>
          <Link href="/ar/search">
            <Button>تصفح المنتجات</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
