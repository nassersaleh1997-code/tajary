"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "vendor" ? "VENDOR" : "CUSTOMER";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "VENDOR">(defaultRole as any);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    const result = await registerUser(formData);

    if (result.success) {
      router.push("/ar/auth/login?registered=1");
    } else {
      setError(result.error || "حدث خطأ");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
          <p className="mt-2 text-muted-foreground">
            انضم إلى منصة تجاري
          </p>
        </div>

        {/* Role selector */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
              role === "CUSTOMER"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            عميل
          </button>
          <button
            type="button"
            onClick={() => setRole("VENDOR")}
            className={`rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
              role === "VENDOR"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            تاجر
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">الاسم</label>
            <input
              name="name"
              required
              minLength={2}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="الاسم الكامل"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              البريد الإلكتروني
            </label>
            <input
              name="email"
              type="email"
              required
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="name@example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              رقم الهاتف (اختياري)
            </label>
            <input
              name="phone"
              type="tel"
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="01xxxxxxxxx"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              كلمة المرور
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="8 أحرف على الأقل"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              تأكيد كلمة المرور
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="أعد كتابة كلمة المرور"
              dir="ltr"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {role === "VENDOR" ? "إنشاء حساب تاجر" : "إنشاء حساب"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/ar/auth/login"
            className="font-medium text-primary hover:underline"
          >
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
