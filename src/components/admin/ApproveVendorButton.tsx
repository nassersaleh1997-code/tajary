"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateVendorStatus } from "@/actions/admin";
import { Loader2 } from "lucide-react";

export function ApproveVendorButton({
  vendorId,
  action = "approve",
}: {
  vendorId: string;
  action?: "approve" | "suspend" | "activate";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const status =
      action === "suspend"
        ? "SUSPENDED"
        : action === "activate"
        ? "ACTIVE"
        : "ACTIVE";
    const result = await updateVendorStatus(vendorId, status as any);
    setLoading(false);
    if (result.success) router.refresh();
    else alert(result.error);
  }

  const label =
    action === "suspend"
      ? "إيقاف"
      : action === "activate"
      ? "تفعيل"
      : "موافقة";

  return (
    <Button
      size="sm"
      variant={action === "suspend" ? "destructive" : "default"}
      onClick={handleClick}
      disabled={loading}
    >
      {loading && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
      {label}
    </Button>
  );
}
