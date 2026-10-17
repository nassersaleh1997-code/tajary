"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, User, Menu, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "next-auth/react";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { data: session } = useSession();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/ar/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Top bar */}
      <div className="border-b bg-primary text-primary-foreground">
        <div className="container-custom flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span>مرحباً بك في منصة تجاري</span>
          </div>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <span>مرحباً، {session.user.name}</span>
                {(session.user as any).role === "VENDOR" && (
                  <Link href="/ar/vendor" className="hover:underline">
                    لوحة التاجر
                  </Link>
                )}
                {((session.user as any).role === "ADMIN" ||
                  (session.user as any).role === "STAFF") && (
                  <Link href="/ar/admin" className="hover:underline">
                    لوحة الإدارة
                  </Link>
                )}
                <Link href="/ar/account" className="hover:underline">
                  حسابي
                </Link>
              </>
            ) : (
              <>
                <Link href="/ar/auth/login" className="hover:underline">
                  تسجيل الدخول
                </Link>
                <span>|</span>
                <Link href="/ar/auth/register" className="hover:underline">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/ar" className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white">
              ت
            </div>
            <span className="hidden text-xl font-bold text-primary sm:inline">
              تجاري
            </span>
          </Link>

          {/* Location */}
          <button className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted md:flex">
            <MapPin className="h-4 w-4" />
            <span>اختر الموقع</span>
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex flex-1 items-center">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="ابحث عن منتجات، متاجر، علامات تجارية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-muted/50 pr-10 pl-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/ar/account/favorites">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/ar/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/ar/account">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Categories nav */}
        <nav className="hidden h-11 items-center gap-6 overflow-x-auto border-t text-sm md:flex">
          <Link
            href="/ar/search?category=electronics"
            className="whitespace-nowrap text-muted-foreground hover:text-primary"
          >
            إلكترونيات
          </Link>
          <Link
            href="/ar/search?category=fashion"
            className="whitespace-nowrap text-muted-foreground hover:text-primary"
          >
            أزياء
          </Link>
          <Link
            href="/ar/search?category=home"
            className="whitespace-nowrap text-muted-foreground hover:text-primary"
          >
            منزل ومطبخ
          </Link>
          <Link
            href="/ar/search?category=beauty"
            className="whitespace-nowrap text-muted-foreground hover:text-primary"
          >
            جمال وعناية
          </Link>
          <Link
            href="/ar/search?category=grocery"
            className="whitespace-nowrap text-muted-foreground hover:text-primary"
          >
            بقالة
          </Link>
          <Link
            href="/ar/search?category=sports"
            className="whitespace-nowrap text-muted-foreground hover:text-primary"
          >
            رياضة
          </Link>
          <Link
            href="/ar/stores"
            className="whitespace-nowrap font-medium text-primary"
          >
            كل المتاجر
          </Link>
        </nav>
      </div>
    </header>
  );
}
