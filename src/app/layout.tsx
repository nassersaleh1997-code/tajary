import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "تجاري | منصة التجارة الإلكترونية",
    template: "%s | تجاري",
  },
  description:
    "منصة تجارة إلكترونية متعددة التجار - اكتشف آلاف المنتجات من أفضل المتاجر",
  keywords: ["تجارة إلكترونية", "متجر", "تسوق", "منتجات", "marketplace"],
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "تجاري",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "تجاري",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
