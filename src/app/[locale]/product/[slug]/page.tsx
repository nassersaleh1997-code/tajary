import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { ProductActions } from "@/components/product/ProductActions";
import { Star } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: { store: true, images: { take: 1 } },
  });
  if (!product) return { title: "منتج غير موجود" };

  return {
    title: product.nameAr,
    description: product.shortDescAr || product.descriptionAr || undefined,
    openGraph: {
      title: product.nameAr,
      description: product.shortDescAr || undefined,
      images: product.images[0]?.url ? [product.images[0].url] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      store: true,
      vendor: true,
      category: true,
      variants: { where: { isActive: true } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const { percentage } = calculateDiscount(
    product.basePrice,
    product.compareAtPrice
  );

  // Similar products
  const similar = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      images: { take: 1 },
      store: { select: { id: true, name: true, slug: true } },
    },
    take: 4,
  });

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/ar" className="hover:text-primary">
          الرئيسية
        </Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link
              href={`/ar/search?category=${product.category.slug}`}
              className="hover:text-primary"
            >
              {product.category.nameAr}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-foreground">{product.nameAr}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                product.images.find((i) => i.isPrimary)?.url ||
                product.images[0]?.url ||
                "/placeholder-product.png"
              }
              alt={product.nameAr}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.store && (
            <Link
              href={`/ar/store/${product.store.slug}`}
              className="mb-2 inline-block text-sm text-primary hover:underline"
            >
              {product.store.name}
              {product.vendor.isVerified && (
                <span className="mr-1 text-xs text-success">✓ موثق</span>
              )}
            </Link>
          )}

          <h1 className="mb-3 text-2xl font-bold leading-tight md:text-3xl">
            {product.nameAr}
          </h1>

          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount} تقييم)
            </span>
            <span className="text-sm text-muted-foreground">
              • {product.soldCount} مبيعات
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.basePrice)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.basePrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-sm font-bold text-destructive">
                      خصم {percentage}%
                    </span>
                  </>
                )}
            </div>
          </div>

          {product.shortDescAr && (
            <p className="mb-6 text-muted-foreground">{product.shortDescAr}</p>
          )}

          <div className="mb-4 text-sm">
            {product.stockQuantity > 0 ? (
              <span className="text-success">
                متوفر ({product.stockQuantity} قطعة)
              </span>
            ) : (
              <span className="text-destructive">نفد من المخزون</span>
            )}
          </div>

          <ProductActions product={product} />

          {/* Extra info */}
          <div className="mt-8 space-y-3 border-t pt-6 text-sm">
            {product.brand && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">العلامة التجارية:</span>
                <span className="font-medium">{product.brand}</span>
              </div>
            )}
            {product.sku && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-medium" dir="ltr">
                  {product.sku}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-muted-foreground">الشحن:</span>
              <span>توصيل خلال 1-3 أيام عمل</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">الإرجاع:</span>
              <span>خلال 14 يومًا</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.descriptionAr && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">وصف المنتج</h2>
          <div className="prose max-w-none rounded-2xl border bg-white p-6 text-sm leading-relaxed">
            {product.descriptionAr}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold">
          التقييمات ({product.reviewCount})
        </h2>
        {product.reviews.length === 0 ? (
          <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{review.user.name}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {similar.map((p) => (
              <Link
                key={p.id}
                href={`/ar/product/${p.slug}`}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md"
              >
                <div className="aspect-square bg-muted">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0].url}
                      alt={p.nameAr}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium">{p.nameAr}</p>
                  <p className="mt-1 font-bold text-primary">
                    {formatPrice(p.basePrice)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
