# تجاري — منصة Marketplace متعددة التجار (Production-Ready)

منصة تجارة إلكترونية احترافية كاملة — Multi-Vendor Marketplace.

## التشغيل السريع

```bash
cd tajary
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

افتح: http://localhost:3000 → يحوّل إلى /ar

## حسابات الاختبار

| الدور    | البريد                 | كلمة المرور  |
|----------|------------------------|--------------|
| Admin    | admin@tajary.com       | password123  |
| Customer | customer@tajary.com    | password123  |
| Vendor 1 | vendor1@tajary.com     | password123  |
| Vendor 2 | vendor2@tajary.com     | password123  |

كوبون: WELCOME10 (خصم 10%)

## الوظائف المنفذة

### العملاء
- تسجيل / دخول
- الرئيسية + تصنيفات + عروض + الأكثر مبيعًا
- بحث + فلاتر + ترتيب
- صفحة منتج (معرض، SEO، Open Graph)
- صفحة متجر مستقلة
- سلة متعددة التجار + كوبونات
- Checkout كامل
- طلب حقيقي + Sub-Orders + عمولة + مخزون
- طلباتي + Timeline
- المفضلة + عناوين + دعم

### التجار
- لوحة تحكم + منتجات (CRUD + رفع صور)
- إعدادات المتجر
- طلبات + تحديث الحالة + استرجاع مخزون

### الإدارة
- إحصائيات + تجار + طلبات + تصنيفات + كوبونات + إعدادات + دعم

### البنية
- Schema كامل + Auth + Payments Architecture
- رفع ملفات + PWA + Sitemap + SEO

## التقنيات
Next.js 15 + TypeScript + Prisma + NextAuth + Zustand + Tailwind + Zod

بُني كمنتج تجاري حقيقي.
