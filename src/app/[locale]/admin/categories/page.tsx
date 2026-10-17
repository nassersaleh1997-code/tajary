import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) redirect("/ar/auth/login");

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      children: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container-custom py-8">
      <h1 className="mb-6 text-2xl font-bold">التصنيفات</h1>
      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-right font-medium">الاسم</th>
              <th className="px-4 py-3 text-right font-medium">Slug</th>
              <th className="px-4 py-3 text-right font-medium">المنتجات</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.nameAr}</td>
                <td className="px-4 py-3" dir="ltr">
                  {c.slug}
                </td>
                <td className="px-4 py-3">{c._count.products}</td>
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
        {categories.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            لا توجد تصنيفات — شغّل الـ seed
          </p>
        )}
      </div>
    </div>
  );
}
