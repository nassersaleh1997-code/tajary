import { redirect, notFound } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { TicketReplyForm } from "@/components/support/TicketReplyForm";
import { TicketStatusButtons } from "@/components/support/TicketStatusButtons";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/ar/auth/login");

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
      order: { select: { orderNumber: true } },
    },
  });

  if (!ticket) notFound();

  const isStaff = isAdmin(user.role);
  if (!isStaff && ticket.userId !== user.id) {
    redirect("/ar/support");
  }

  return (
    <div className="container-custom max-w-3xl py-8">
      <Link
        href="/ar/support"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للدعم
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground">
            {ticket.user.name} • {ticket.type}
            {ticket.order && ` • طلب ${ticket.order.orderNumber}`}
            {" • "}
            {formatDate(ticket.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {ticket.status}
          </span>
          {isStaff && <TicketStatusButtons ticketId={ticket.id} />}
        </div>
      </div>

      <div className="mb-6 space-y-3">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl p-4 ${
              m.isStaff
                ? "bg-primary/5 border border-primary/20 mr-8"
                : "bg-muted/50 ml-8"
            }`}
          >
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">
                {m.isStaff ? "فريق الدعم" : ticket.user.name}
              </span>
              <span>{formatDate(m.createdAt)}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
      </div>

      {ticket.status !== "CLOSED" && (
        <TicketReplyForm ticketId={ticket.id} />
      )}
    </div>
  );
}
