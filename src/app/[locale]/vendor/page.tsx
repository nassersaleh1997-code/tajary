import { redirect } from "next/navigation";
import { getCurrentUser, isVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VendorDashboard() {
  const user = await getCurrentUser();
  if (!user || !isVendor(user.role)) {
    redirect("/ar/auth/login");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: user.id },
    include: {
      store: true,
      products: { select: { id: true, stockQuantity: true, lowStockThreshold: true, status: true } },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { order: true },
      },
    },
  });

  if (!vendor) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-xl font-bold">لم يتم إعداد حساب التاجر بعد</h1>
        <p className="mt-2 text-muted-foreground">
          يرجى انتظار موافقة الإدارة أو التواصل مع الدعم
        </p>
      </div>
    );
  }

  const totalProducts = vendor.products.length;
  const activeProducts = vendor.products.filter((p) => p.status === "ACTIVE").length;
  const lowStock = vendor.products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0
  ).length;
  const outOfStock = vendor.products.filter((p) => p.stockQuantity === 0).length;

  // Simple stats (in real app calculate from orders)
  const totalSales = vendor.totalSales;

  return (
    <div className="container-custom py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">لوحة تحكم التاجر</h1>
          <p className="text-muted-foreground">
            {vendor.store?.name || vendor.businessName}
          </p>
        </div>
        <Link href="/ar/vendor/products/new">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة منتج
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">إجمالي المبيعات</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(totalSales)}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="text-sm">المنتجات</span>
          </div>
          <p className="text-2xl font-bold">
            {activeProducts}
            <span className="text-sm font-normal text-muted-foreground">
              /{totalProducts}
            </span>
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-sm">الطلبات</span>
          </div>
          <p className="text-2xl font-bold">{vendor.orders.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">مخزون منخفض</span>
          </div>
          <p className="text-2xl font-bold text-warning">
            {lowStock + outOfStock}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/ar/vendor/products"
          className="rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md"
        >
          <Package className="mb-3 h-8 w-8 text-primary" />
          <h3 className="font-semibold">إدارة المنتجات</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            إضافة وتعديل المنتجات والمخزون
          </p>
        </Link>
        <Link
          href="/ar/vendor/orders"
          className="rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md"
        >
          <ShoppingBag className="mb-3 h-8 w-8 text-primary" />
          <h3 className="font-semibold">الطلبات</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            متابعة وتحديث حالة الطلبات
          </p>
        </Link>
        <Link
          href="/ar/vendor/store"
          className="rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md"
        >
          <TrendingUp className="mb-3 h-8 w-8 text-primary" />
          <h3 className="font-semibold">إعدادات المتجر</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            تعديل بيانات المتجر والمظهر
          </p>
        </Link>
      </div>
    </div>
  );
}
