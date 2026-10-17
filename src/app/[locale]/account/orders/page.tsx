import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; order?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/ar/auth/login");

  const params = await searchParams;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-custom py-8">
      <h1 className="mb-6 text-2xl font-bold">طلباتي</h1>

      {params.success && (
        <div className="mb-6 rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-success">
          تم إنشاء طلبك بنجاح
          {params.order && (
            <span className="font-medium"> — رقم الطلب: {params.order}</span>
          )}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-muted-foreground">لا توجد طلبات بعد</p>
          <Link href="/ar/search">
            <Button>تسوق الآن</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border bg-white p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-left">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {order.status}
                  </span>
                  <p className="mt-1 font-bold text-primary">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mb-3 space-y-1 text-sm">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{order.items.length - 3} منتجات أخرى
                  </p>
                )}
              </div>

              {/* Timeline */}
              {order.statusHistory.length > 0 && (
                <div className="border-t pt-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    تتبع الطلب
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.statusHistory.map((h, i) => (
                      <span
                        key={h.id}
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          i === order.statusHistory.length - 1
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {h.status}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
