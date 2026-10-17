import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const categorySlug = params.category;
  const sort = params.sort || "newest";

  const where: any = {
    status: "ACTIVE",
  };

  if (q) {
    where.OR = [
      { nameAr: { contains: q } },
      { nameEn: { contains: q } },
      { shortDescAr: { contains: q } },
      { brand: { contains: q } },
      { sku: { contains: q } },
    ];
  }

  if (categorySlug) {
    const cat = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (cat) where.categoryId = cat.id;
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { basePrice: "asc" };
  if (sort === "price_desc") orderBy = { basePrice: "desc" };
  if (sort === "bestselling") orderBy = { soldCount: "desc" };
  if (sort === "rating") orderBy = { rating: "desc" };

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      store: { select: { id: true, name: true, slug: true } },
    },
    orderBy,
    take: 48,
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {q ? `نتائج البحث عن "${q}"` : "كل المنتجات"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {products.length} منتج
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filters sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">التصنيفات</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/ar/search"
                  className={!categorySlug ? "font-medium text-primary" : "text-muted-foreground hover:text-primary"}
                >
                  الكل
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/ar/search?category=${c.slug}`}
                    className={
                      categorySlug === c.slug
                        ? "font-medium text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }
                  >
                    {c.nameAr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">الترتيب</h3>
            <ul className="space-y-2 text-sm">
              {[
                { value: "newest", label: "الأحدث" },
                { value: "bestselling", label: "الأكثر مبيعًا" },
                { value: "rating", label: "الأعلى تقييمًا" },
                { value: "price_asc", label: "السعر: من الأقل" },
                { value: "price_desc", label: "السعر: من الأعلى" },
              ].map((s) => (
                <li key={s.value}>
                  <Link
                    href={`/ar/search?${new URLSearchParams({
                      ...(q ? { q } : {}),
                      ...(categorySlug ? { category: categorySlug } : {}),
                      sort: s.value,
                    })}`}
                    className={
                      sort === s.value
                        ? "font-medium text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products grid */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium">لا توجد منتجات</p>
              <p className="mt-1 text-sm text-muted-foreground">
                جرب كلمات بحث مختلفة أو تصفح التصنيفات
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
