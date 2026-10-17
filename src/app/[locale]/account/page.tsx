import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Package, Heart, MapPin, User, Store, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ar/auth/login");

  const links = [
    { href: "/ar/account/orders", label: "طلباتي", icon: Package, desc: "تتبع طلباتك السابقة" },
    { href: "/ar/account/favorites", label: "المفضلة", icon: Heart, desc: "المنتجات المحفوظة" },
    { href: "/ar/account/addresses", label: "عناويني", icon: MapPin, desc: "إدارة عناوين التوصيل" },
    { href: "/ar/support", label: "الدعم", icon: User, desc: "تذاكر المساعدة" },
  ];

  if ((user as any).role === "VENDOR") {
    links.push({
      href: "/ar/vendor",
      label: "لوحة التاجر",
      icon: Store,
      desc: "إدارة متجرك ومنتجاتك",
    });
  }
  if ((user as any).role === "ADMIN" || (user as any).role === "STAFF") {
    links.push({
      href: "/ar/admin",
      label: "لوحة الإدارة",
      icon: Settings,
      desc: "إدارة المنصة",
    });
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {user.name?.charAt(0) || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {(user as any).role}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-start gap-4 rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <l.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{l.label}</h3>
              <p className="text-sm text-muted-foreground">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
