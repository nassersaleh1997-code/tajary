import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) {
    redirect("/ar/auth/login");
  }

  const [
    customersCount,
    vendorsCount,
    storesCount,
    productsCount,
    ordersCount,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.vendor.count(),
    prisma.store.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID" },
    }),
  ]);

  const pendingVendors = await prisma.vendor.count({
    where: { status: "PENDING" },
  });

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="container-custom py-8">
      <h1 className="mb-8 text-2xl font-bold">لوحة تحكم المدير</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "العملاء", value: customersCount, icon: Users },
          { label: "التجار", value: vendorsCount, icon: Store },
          { label: "المتاجر", value: storesCount, icon: Store },
          { label: "المنتجات", value: productsCount, icon: Package },
          { label: "الطلبات", value: ordersCount, icon: ShoppingBag },
          {
            label: "المبيعات",
            value: formatPrice(totalRevenue._sum.totalAmount || 0),
            icon: DollarSign,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <s.icon className="h-4 w-4" />
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {pendingVendors > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <AlertCircle className="h-5 w-5 text-warning" />
          <span className="text-sm">
            يوجد {pendingVendors} تاجر في انتظار الموافقة
          </span>
          <Link
            href="/ar/admin/vendors?status=PENDING"
            className="mr-auto text-sm font-medium text-primary hover:underline"
          >
            مراجعة
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/ar/admin/users", label: "المستخدمين", desc: "إدارة العملاء والموظفين" },
          { href: "/ar/admin/vendors", label: "التجار", desc: "الموافقة وإدارة التجار" },
          { href: "/ar/admin/products", label: "المنتجات", desc: "مراقبة المنتجات" },
          { href: "/ar/admin/orders", label: "الطلبات", desc: "كل طلبات المنصة" },
          { href: "/ar/admin/categories", label: "التصنيفات", desc: "إدارة التصنيفات والخصائص" },
          { href: "/ar/admin/coupons", label: "الكوبونات", desc: "العروض والخصومات" },
          { href: "/ar/admin/settings", label: "الإعدادات", desc: "إعدادات المنصة" },
          { href: "/ar/admin/reports", label: "التقارير", desc: "إحصائيات وتحليلات" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <h3 className="font-semibold">{l.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border bg-white">
        <div className="border-b p-4">
          <h2 className="font-semibold">أحدث الطلبات</h2>
        </div>
        <div className="divide-y">
          {recentOrders.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">
              لا توجد طلبات بعد
            </p>
          ) : (
            recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-4 text-sm"
              >
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-muted-foreground">{o.user.name}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium">{formatPrice(o.totalAmount)}</p>
                  <p className="text-muted-foreground">{o.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
