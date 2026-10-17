import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
                ت
              </div>
              <span className="text-lg font-bold">تجاري</span>
            </div>
            <p className="text-sm text-muted-foreground">
              منصة التجارة الإلكترونية متعددة التجار. تسوق بأمان وسهولة من آلاف
              المتاجر.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">تسوق</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/ar/search" className="hover:text-primary">
                  كل المنتجات
                </Link>
              </li>
              <li>
                <Link href="/ar/stores" className="hover:text-primary">
                  المتاجر
                </Link>
              </li>
              <li>
                <Link href="/ar/offers" className="hover:text-primary">
                  العروض
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">حسابي</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/ar/account" className="hover:text-primary">
                  حسابي
                </Link>
              </li>
              <li>
                <Link href="/ar/account/orders" className="hover:text-primary">
                  طلباتي
                </Link>
              </li>
              <li>
                <Link
                  href="/ar/account/favorites"
                  className="hover:text-primary"
                >
                  المفضلة
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">للتجار</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/ar/auth/register?role=vendor" className="hover:text-primary">
                  سجل كتاجر
                </Link>
              </li>
              <li>
                <Link href="/ar/vendor" className="hover:text-primary">
                  لوحة التاجر
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">الدعم</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/ar/support" className="hover:text-primary">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href="/ar/terms" className="hover:text-primary">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link href="/ar/privacy" className="hover:text-primary">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} تجاري. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            <span>الدفع عند الاستلام</span>
            <span>•</span>
            <span>شحن سريع</span>
            <span>•</span>
            <span>ضمان الجودة</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
