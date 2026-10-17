import { redirect } from "next/navigation";
import { getCurrentUser, isVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/vendor/OrderStatusUpdater";

export const dynamic = "force-dynamic";

export default async function VendorOrdersPage() {
  const user = await getCurrentUser();
  if (!user || !isVendor(user.role)) redirect("/ar/auth/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: user.id },
  });
  if (!vendor) redirect("/ar/vendor");

  const subOrders = await prisma.subOrder.findMany({
    where: { vendorId: vendor.id },
    include: {
      order: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">طلبات المتجر</h1>
        <p className="text-sm text-muted-foreground">
          {subOrders.length} طلب
        </p>
      </div>

      {subOrders.length === 0 ? (
        <div className="rounded-2xl border bg-white py-16 text-center">
          <p className="text-muted-foreground">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subOrders.map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl border bg-white p-5"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{sub.order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(sub.createdAt)} • {sub.order.user.name}
                    {sub.order.user.phone && ` • ${sub.order.user.phone}`}
                  </p>
                  <p className="mt-1 text-sm">
                    {sub.order.shippingAddress}، {sub.order.shippingCity}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary">
                    {formatPrice(sub.subtotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    عمولة: {formatPrice(sub.commissionAmount)} | صافي:{" "}
                    {formatPrice(sub.vendorAmount)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4 space-y-2 border-t border-b py-3">
                {sub.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                    </div>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Status + Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    sub.status === "DELIVERED"
                      ? "bg-success/10 text-success"
                      : sub.status === "CANCELLED"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {sub.status}
                </span>
                <OrderStatusUpdater
                  subOrderId={sub.id}
                  orderId={sub.orderId}
                  currentStatus={sub.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
