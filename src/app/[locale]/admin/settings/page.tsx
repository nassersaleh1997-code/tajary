import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) redirect("/ar/auth/login");

  const settings = await prisma.setting.findMany({
    orderBy: { group: "asc" },
  });

  const grouped: Record<string, typeof settings> = {};
  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = [];
    grouped[s.group].push(s);
  }

  return (
    <div className="container-custom py-8">
      <h1 className="mb-6 text-2xl font-bold">إعدادات المنصة</h1>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-muted-foreground">لا توجد إعدادات — شغّل الـ seed</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="rounded-2xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold capitalize">{group}</h2>
              <div className="space-y-3">
                {items.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">{s.key}</span>
                    <span className="font-medium" dir="ltr">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-sm">
        <p className="font-medium text-primary">ملاحظة</p>
        <p className="mt-1 text-muted-foreground">
          لتغيير الإعدادات حاليًا عدّل جدول Setting أو الـ seed. واجهة التعديل
          المباشر يمكن إضافتها بسهولة عبر Server Action.
        </p>
      </div>
    </div>
  );
}
