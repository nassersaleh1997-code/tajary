import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { Star, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store) return { title: "متجر غير موجود" };
  return {
    title: store.name,
    description: store.description || undefined,
    openGraph: {
      title: store.name,
      description: store.description || undefined,
      images: store.logo ? [store.logo] : [],
    },
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      vendor: true,
      products: {
        where: { status: "ACTIVE" },
        include: {
          images: { take: 1 },
          store: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 48,
      },
    },
  });

  if (!store || store.status !== "ACTIVE") {
    notFound();
  }

  return (
    <div>
      {/* Cover */}
      <div className="h-40 bg-gradient-to-l from-primary/80 to-primary md:h-56" />

      <div className="container-custom">
        {/* Store header */}
        <div className="-mt-12 mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-white text-3xl font-bold text-primary shadow-lg">
            {store.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logo}
                alt={store.name}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              store.name.charAt(0)
            )}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{store.name}</h1>
              {store.vendor.isVerified && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  ✓ متجر موثق
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  store.isOpen
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {store.isOpen ? "مفتوح" : "مغلق"}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {store.rating.toFixed(1)} ({store.reviewCount})
              </span>
              {store.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {store.city}
                </span>
              )}
              {store.phone && (
                <span className="flex items-center gap-1" dir="ltr">
                  <Phone className="h-4 w-4" />
                  {store.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {store.description && (
          <p className="mb-8 max-w-2xl text-muted-foreground">
            {store.description}
          </p>
        )}

        {/* Products */}
        <h2 className="mb-4 text-xl font-bold">
          منتجات المتجر ({store.products.length})
        </h2>
        {store.products.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            لا توجد منتجات حاليًا
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {store.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
