"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAddress } from "@/actions/addresses";
import { Loader2 } from "lucide-react";

export function AddressForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await createAddress(new FormData(e.currentTarget));
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error || "حدث خطأ");
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>إضافة عنوان جديد</Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">التسمية</label>
          <Input name="label" required placeholder="المنزل / العمل" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">الاسم</label>
          <Input name="name" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">الهاتف</label>
          <Input name="phone" required dir="ltr" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">المدينة</label>
          <Input name="city" required />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">العنوان</label>
          <Input name="address" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">الحي</label>
          <Input name="district" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" className="accent-primary" />
            عنوان افتراضي
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          حفظ
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
