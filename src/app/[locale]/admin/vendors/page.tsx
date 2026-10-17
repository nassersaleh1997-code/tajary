import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApproveVendorButton } from "@/components/admin/ApproveVendorButton";

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) redirect("/ar/auth/login");

  const params = await searchParams;
  const statusFilter = params.status;

  const vendors = await prisma.vendor.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    include: {
      user: { select: { name: true, email: true, phone: true } },
      store: true,
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-custom py-8">
      <h1 className="mb-6 text-2xl font-bold">إدارة التجار</h1>

      <div className="mb-4 flex gap-2 text-sm">
        <a
          href="/ar/admin/vendors"
          className={`rounded-full px-3 py-1 ${!statusFilter ? "bg-primary text-white" : "bg-muted"}`}
        >
          الكل
        </a>
        <a
          href="/ar/admin/vendors?status=PENDING"
          className={`rounded-full px-3 py-1 ${statusFilter === "PENDING" ? "bg-primary text-white" : "bg-muted"}`}
        >
          قيد الانتظار
        </a>
        <a
          href="/ar/admin/vendors?status=ACTIVE"
          className={`rounded-full px-3 py-1 ${statusFilter === "ACTIVE" ? "bg-primary text-white" : "bg-muted"}`}
        >
          نشط
        </a>
        <a
          href="/ar/admin/vendors?status=SUSPENDED"
          className={`rounded-full px-3 py-1 ${statusFilter === "SUSPENDED" ? "bg-primary text-white" : "bg-muted"}`}
        >
          موقوف
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-right font-medium">التاجر</th>
              <th className="px-4 py-3 text-right font-medium">المتجر</th>
              <th className="px-4 py-3 text-right font-medium">المنتجات</th>
              <th className="px-4 py-3 text-right font-medium">العمولة</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vendors.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{v.user.name}</p>
                  <p className="text-xs text-muted-foreground">{v.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  {v.store?.name || v.businessName}
                </td>
                <td className="px-4 py-3">{v._count.products}</td>
                <td className="px-4 py-3">{v.commissionRate}%</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      v.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : v.status === "PENDING"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {v.status === "PENDING" && (
                    <ApproveVendorButton vendorId={v.id} />
                  )}
                  {v.status === "ACTIVE" && (
                    <ApproveVendorButton vendorId={v.id} action="suspend" />
                  )}
                  {v.status === "SUSPENDED" && (
                    <ApproveVendorButton vendorId={v.id} action="activate" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">لا يوجد تجار</p>
        )}
      </div>
    </div>
  );
}
