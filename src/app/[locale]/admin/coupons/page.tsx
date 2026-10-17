import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) redirect("/ar/auth/login");

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-custom py-8">
      <h1 className="mb-6 text-2xl font-bold">الكوبونات والعروض</h1>
      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-right font-medium">الكود</th>
              <th className="px-4 py-3 text-right font-medium">النوع</th>
              <th className="px-4 py-3 text-right font-medium">القيمة</th>
              <th className="px-4 py-3 text-right font-medium">الاستخدام</th>
              <th className="px-4 py-3 text-right font-medium">ينتهي</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono font-medium" dir="ltr">
                  {c.code}
                </td>
                <td className="px-4 py-3">{c.type}</td>
                <td className="px-4 py-3">
                  {c.type === "PERCENTAGE" ? `${c.value}%` : c.value}
                </td>
                <td className="px-4 py-3">
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  {c.expiresAt ? formatDate(c.expiresAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.isActive
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.isActive ? "نشط" : "معطل"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">لا توجد كوبونات</p>
        )}
      </div>
    </div>
  );
}
