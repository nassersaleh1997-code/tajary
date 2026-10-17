"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProduct } from "@/actions/products";
import { Loader2, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  nameAr: string;
  nameEn: string | null;
  shortDescAr: string | null;
  descriptionAr: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  brand: string | null;
  sku: string | null;
  barcode: string | null;
  weight: number | null;
  status: string;
  images: { url: string }[];
}

export function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateProduct(product.id, formData);

    if (result.success) {
      router.push("/ar/vendor/products");
      router.refresh();
    } else {
      setError(result.error || "حدث خطأ");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/ar/vendor/products"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمنتجات
        </Link>
        <h1 className="text-2xl font-bold">تعديل المنتج</h1>
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
            <Input
              name="nameAr"
              required
              minLength={2}
              defaultValue={product.nameAr}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">وصف مختصر</label>
            <Input
              name="shortDescAr"
              defaultValue={product.shortDescAr || ""}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">الوصف الكامل</label>
            <textarea
              name="descriptionAr"
              rows={4}
              defaultValue={product.descriptionAr || ""}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
              defaultValue={product.basePrice}
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
              defaultValue={product.compareAtPrice || ""}
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
              defaultValue={product.stockQuantity}
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
              defaultValue={product.lowStockThreshold}
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">العلامة التجارية</label>
            <Input name="brand" defaultValue={product.brand || ""} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">SKU</label>
            <Input name="sku" defaultValue={product.sku || ""} dir="ltr" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Barcode</label>
            <Input name="barcode" defaultValue={product.barcode || ""} dir="ltr" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">الوزن (كجم)</label>
            <Input
              name="weight"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.weight || ""}
              dir="ltr"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">
              رابط صورة المنتج
            </label>
            <Input
              name="imageUrl"
              type="url"
              defaultValue={product.images[0]?.url || ""}
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">الحالة</label>
            <select
              name="status"
              defaultValue={product.status}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="DRAFT">مسودة</option>
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">غير نشط</option>
              <option value="OUT_OF_STOCK">نفد من المخزون</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allowBackorder"
                defaultChecked={product.allowBackorder}
                className="h-4 w-4 accent-primary"
              />
              السماح بالطلب عند نفاد المخزون
            </label>
          </div>
        </div>

        <div className="flex gap-3 border-t pt-6">
          <Button type="submit" disabled={loading} size="lg">
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ التعديلات
          </Button>
          <Link href="/ar/vendor/products">
            <Button type="button" variant="outline" size="lg">
              إلغاء
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
