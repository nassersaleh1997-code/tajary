"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStore } from "@/actions/store";
import { Loader2 } from "lucide-react";

export default function VendorStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    fetch("/api/vendor/store")
      .then((r) => r.json())
      .then((data) => {
        setStore(data.store);
        setFetched(true);
      })
      .catch(() => setFetched(true));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateStore(formData);

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(result.error || "حدث خطأ");
    }
  }

  if (!fetched) {
    return (
      <div className="container-custom py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-custom max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">إعدادات المتجر</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border bg-white p-6"
      >
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
            تم حفظ الإعدادات بنجاح
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            اسم المتجر <span className="text-destructive">*</span>
          </label>
          <Input
            name="name"
            required
            defaultValue={store?.name || ""}
            placeholder="اسم المتجر"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">نبذة عن المتجر</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={store?.description || ""}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="وصف قصير عن نشاطك التجاري"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">رقم الهاتف</label>
            <Input
              name="phone"
              defaultValue={store?.phone || ""}
              dir="ltr"
              placeholder="01xxxxxxxxx"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">البريد</label>
            <Input
              name="email"
              type="email"
              defaultValue={store?.email || ""}
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">العنوان</label>
          <Input name="address" defaultValue={store?.address || ""} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">المدينة</label>
            <Input name="city" defaultValue={store?.city || ""} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              الحد الأدنى للطلب
            </label>
            <Input
              name="minOrderAmount"
              type="number"
              min="0"
              defaultValue={store?.minOrderAmount || 0}
              dir="ltr"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isOpen"
            defaultChecked={store?.isOpen !== false}
            className="h-4 w-4 accent-primary"
          />
          المتجر مفتوح لاستقبال الطلبات
        </label>

        <Button type="submit" disabled={loading} size="lg">
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          حفظ الإعدادات
        </Button>
      </form>
    </div>
  );
}
