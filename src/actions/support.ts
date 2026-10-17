"use server";

import { getCurrentUser, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "يجب تسجيل الدخول" };

  const subject = formData.get("subject") as string;
  const type = (formData.get("type") as string) || "other";
  const message = formData.get("message") as string;
  const orderId = (formData.get("orderId") as string) || null;

  if (!subject?.trim() || !message?.trim()) {
    return { success: false, error: "الموضوع والرسالة مطلوبان" };
  }

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: subject.trim(),
        type,
        orderId: orderId || null,
        status: "OPEN",
        messages: {
          create: {
            senderId: user.id,
            message: message.trim(),
            isStaff: false,
          },
        },
      },
    });

    revalidatePath("/ar/support");
    revalidatePath("/ar/account");
    return { success: true, ticketId: ticket.id };
  } catch (err) {
    console.error(err);
    return { success: false, error: "حدث خطأ" };
  }
}

export async function replyToTicket(ticketId: string, message: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "يجب تسجيل الدخول" };

  if (!message?.trim()) {
    return { success: false, error: "الرسالة فارغة" };
  }

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) return { success: false, error: "التذكرة غير موجودة" };

    const isStaff = isAdmin(user.role);
    if (!isStaff && ticket.userId !== user.id) {
      return { success: false, error: "غير مصرح" };
    }

    await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: user.id,
        message: message.trim(),
        isStaff,
      },
    });

    if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "IN_PROGRESS" },
      });
    } else if (ticket.status === "OPEN" && isStaff) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "IN_PROGRESS" },
      });
    }

    revalidatePath(`/ar/support/${ticketId}`);
    revalidatePath("/ar/support");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "حدث خطأ" };
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) {
    return { success: false, error: "غير مصرح" };
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      closedAt: status === "CLOSED" || status === "RESOLVED" ? new Date() : null,
    },
  });

  revalidatePath("/ar/support");
  revalidatePath(`/ar/support/${ticketId}`);
  return { success: true };
}
