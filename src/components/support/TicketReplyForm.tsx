"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { replyToTicket } from "@/actions/support";
import { Loader2 } from "lucide-react";

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    const result = await replyToTicket(ticketId, message);
    setLoading(false);
    if (result.success) {
      setMessage("");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        placeholder="اكتب ردك..."
        required
      />
      <Button type="submit" disabled={loading || !message.trim()}>
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        إرسال الرد
      </Button>
    </form>
  );
}
