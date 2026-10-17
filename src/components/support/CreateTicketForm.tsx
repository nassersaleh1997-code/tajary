"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTicket } from "@/actions/support";
import { Loader2 } from "lucide-react";

export function CreateTicketForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createTicket(formData);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.push(`/ar/support/${result.ticketId}`);
      router.refresh();
    } else {
      setError(result.error || "حدث خطأ");
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        فتح تذكرة جديدة
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border bg-white p-6"
    >
      <h2 className="text-lg font-semibold">تذكرة دعم جديدة</h2>
      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">الموضوع</label>
        <Input name="subject" required placeholder="ملخص المشكلة" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">نوع المشكلة</label>
        <select
          name="type"
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="order">مشكلة في طلب</option>
          <option value="product">مشكلة في منتج</option>
          <option value="payment">مشكلة في الدفع</option>
          <option value="other">أخرى</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">رقم الطلب (اختياري)</label>
        <Input name="orderId" placeholder="إن وجد" dir="ltr" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">الرسالة</label>
        <textarea
          name="message"
          required
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="اشرح المشكلة بالتفصيل..."
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          إرسال
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
