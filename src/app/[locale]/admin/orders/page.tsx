import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) redirect("/ar/auth/login");

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      subOrders: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="container-custom py-8">
      <h1 className="mb-6 text-2xl font-bold">كل الطلبات</h1>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">لا توجد طلبات</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {o.user.name} • {formatDate(o.createdAt)} •{" "}
                    {o.items.length} منتج • {o.subOrders.length} متجر
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary">
                    {formatPrice(o.totalAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    عمولة: {formatPrice(o.platformFee)}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {o.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
