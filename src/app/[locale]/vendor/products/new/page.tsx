"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { createProduct } from "@/actions/products";
import { Loader2, ArrowRight } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createProduct(formData);

    if (result.success) {
      router.push("/ar/vendor/products");
      router.refresh();
    } else {
      setError(result.error || "حدث خطأ");
      setLoading(false);
    }
  }

  return (
    <div className="container-custom max-w-3xl py-8">
      <div className="mb-6">
        <Link
          href="/ar/vendor/products"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمنتجات
        </Link>
        <h1 className="text-2xl font-bold">إضافة منتج جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">
              اسم المنتج <span className="text-destructive">*</span>
            </label>
            <Input name="nameAr" required minLength={2} placeholder="اسم المنتج بالعربية" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">وصف مختصر</label>
            <Input name="shortDescAr" placeholder="وصف قصير يظهر في البطاقة" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">الوصف الكامل</label>
            <textarea
              name="descriptionAr"
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="تفاصيل المنتج..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              السعر <span className="text-destructive">*</span>
            </label>
            <Input
              name="basePrice"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              السعر قبل الخصم
            </label>
            <Input
              name="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="اختياري"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              كمية المخزون <span className="text-destructive">*</span>
            </label>
            <Input
              name="stockQuantity"
              type="number"
              min="0"
              required
              defaultValue={0}
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              حد تنبيه المخزون
            </label>
            <Input
              name="lowStockThreshold"
              type="number"
              min="0"
              defaultValue={5}
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">العلامة التجارية</label>
            <Input name="brand" placeholder="Brand" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">SKU</label>
            <Input name="sku" placeholder="SKU-001" dir="ltr" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Barcode</label>
            <Input name="barcode" placeholder="اختياري" dir="ltr" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">الوزن (كجم)</label>
            <Input name="weight" type="number" step="0.01" min="0" dir="ltr" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">
              صورة المنتج
            </label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} name="imageUrl" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">الحالة</label>
            <select
              name="status"
              defaultValue="ACTIVE"
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="DRAFT">مسودة</option>
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">غير نشط</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allowBackorder"
                className="h-4 w-4 accent-primary"
              />
              السماح بالطلب عند نفاد المخزون (Backorder)
            </label>
          </div>
        </div>

        <div className="flex gap-3 border-t pt-6">
          <Button type="submit" disabled={loading} size="lg">
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ المنتج
          </Button>
          <Link href="/ar/vendor/products">
            <Button type="button" variant="outline" size="lg">
              إلغاء
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
