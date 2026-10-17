"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteAddress } from "@/actions/addresses";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteAddressButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!confirm("حذف هذا العنوان؟")) return;
    setLoading(true);
    await deleteAddress(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handle} disabled={loading} className="text-destructive">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      <span className="mr-1">حذف</span>
    </Button>
  );
}
