import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Star, Truck, Shield, Headphones } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [deals, bestSellers, categories, stores] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        compareAtPrice: { not: null },
      },
      include: {
        images: { take: 1 },
        store: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { soldCount: "desc" },
      take: 5,
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { take: 1 },
        store: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { soldCount: "desc" },
      take: 5,
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    prisma.store.findMany({
      where: { status: "ACTIVE", vendor: { isVerified: true } },
      take: 4,
      orderBy: { rating: "desc" },
    }),
  ]);

  const categoryEmojis: Record<string, string> = {
    electronics: "📱",
    fashion: "👕",
    home: "🏠",
    beauty: "✨",
    grocery: "🛒",
    sports: "⚽",
  };

  const categoryColors: Record<string, string> = {
    electronics: "bg-blue-50",
    fashion: "bg-pink-50",
    home: "bg-amber-50",
    beauty: "bg-purple-50",
    grocery: "bg-green-50",
    sports: "bg-orange-50",
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-l from-primary/90 to-primary py-16 text-white md:py-24">
        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">
              تسوق من آلاف المتاجر
              <br />
              في مكان واحد
            </h1>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              اكتشف أفضل العروض والمنتجات من تجار موثوقين. توصيل سريع ودفع آمن.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/ar/search">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  تصفح المنتجات
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/ar/auth/register?role=vendor">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  سجل كتاجر
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </section>

      {/* Features */}
      <section className="border-b bg-white py-8">
        <div className="container-custom grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: Truck, title: "توصيل سريع", desc: "خلال 24-48 ساعة" },
            { icon: Shield, title: "دفع آمن", desc: "حماية كاملة لبياناتك" },
            { icon: Star, title: "منتجات موثوقة", desc: "تجار معتمدون" },
            { icon: Headphones, title: "دعم 24/7", desc: "نحن هنا لمساعدتك" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container-custom">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">التصنيفات الرئيسية</h2>
            <Link
              href="/ar/search"
              className="text-sm font-medium text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.length > 0
              ? categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/ar/search?category=${cat.slug}`}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-6 transition-all hover:shadow-md ${
                      categoryColors[cat.slug] || "bg-muted/50"
                    }`}
                  >
                    <span className="text-3xl">
                      {categoryEmojis[cat.slug] || "📦"}
                    </span>
                    <span className="text-sm font-medium">{cat.nameAr}</span>
                  </Link>
                ))
              : [
                  { name: "إلكترونيات", emoji: "📱", color: "bg-blue-50", slug: "electronics" },
                  { name: "أزياء", emoji: "👕", color: "bg-pink-50", slug: "fashion" },
                  { name: "منزل", emoji: "🏠", color: "bg-amber-50", slug: "home" },
                  { name: "جمال", emoji: "✨", color: "bg-purple-50", slug: "beauty" },
                  { name: "بقالة", emoji: "🛒", color: "bg-green-50", slug: "grocery" },
                  { name: "رياضة", emoji: "⚽", color: "bg-orange-50", slug: "sports" },
                ].map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/ar/search?category=${cat.slug}`}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-6 transition-all hover:shadow-md ${cat.color}`}
                  >
                    <span className="text-3xl">{cat.emoji}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Deals */}
      <section className="bg-muted/30 py-12">
        <div className="container-custom">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">عروض اليوم</h2>
            <Link
              href="/ar/search?sort=price_asc"
              className="text-sm font-medium text-primary hover:underline"
            >
              كل العروض
            </Link>
          </div>
          {deals.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              لا توجد عروض حاليًا — أضف منتجات بخصم لعرضها هنا
            </p>
          )}
        </div>
      </section>

      {/* Best sellers */}
      <section className="py-12">
        <div className="container-custom">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">الأكثر مبيعًا</h2>
            <Link
              href="/ar/search?sort=bestselling"
              className="text-sm font-medium text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              لا توجد منتجات بعد — شغّل الـ seed أو أضف منتجات من لوحة التاجر
            </p>
          )}
        </div>
      </section>

      {/* Verified stores */}
      {stores.length > 0 && (
        <section className="bg-muted/30 py-12">
          <div className="container-custom">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">متاجر موثقة</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stores.map((s) => (
                <Link
                  key={s.id}
                  href={`/ar/store/${s.slug}`}
                  className="flex flex-col items-center gap-2 rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                    {s.name.charAt(0)}
                  </div>
                  <p className="font-medium text-center">{s.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {s.rating.toFixed(1)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-16 text-white">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold">هل أنت تاجر؟</h2>
          <p className="mb-8 text-lg text-white/90">
            انضم إلى آلاف التجار وابدأ البيع على منصة تجاري اليوم
          </p>
          <Link href="/ar/auth/register?role=vendor">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              ابدأ البيع مجانًا
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
