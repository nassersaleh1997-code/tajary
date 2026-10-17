"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateTicketStatus } from "@/actions/support";
import { Loader2 } from "lucide-react";

export function TicketStatusButtons({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle(status: "RESOLVED" | "CLOSED" | "IN_PROGRESS") {
    setLoading(true);
    await updateTicketStatus(ticketId, status);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" disabled={loading} onClick={() => handle("RESOLVED")}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "حلّت"}
      </Button>
      <Button size="sm" variant="outline" disabled={loading} onClick={() => handle("CLOSED")}>
        إغلاق
      </Button>
    </div>
  );
}
