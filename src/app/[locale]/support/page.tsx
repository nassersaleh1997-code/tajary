import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Plus } from "lucide-react";
import { CreateTicketForm } from "@/components/support/CreateTicketForm";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ar/auth/login");

  const isStaff = isAdmin(user.role);

  const tickets = await prisma.supportTicket.findMany({
    where: isStaff ? undefined : { userId: user.id },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container-custom py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مركز الدعم</h1>
          <p className="text-sm text-muted-foreground">
            {isStaff ? "كل التذاكر" : "تذاكر الدعم الخاصة بك"}
          </p>
        </div>
      </div>

      {!isStaff && (
        <div className="mb-8">
          <CreateTicketForm />
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="rounded-2xl border bg-white py-16 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">لا توجد تذاكر بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/ar/support/${t.id}`}
              className="flex items-center justify-between rounded-2xl border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div>
                <p className="font-medium">{t.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {isStaff && `${t.user.name} • `}
                  {t.type} • {t._count.messages} رسالة • {formatDate(t.createdAt)}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  t.status === "OPEN"
                    ? "bg-primary/10 text-primary"
                    : t.status === "RESOLVED" || t.status === "CLOSED"
                    ? "bg-muted text-muted-foreground"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {t.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
