import type { Metadata } from "next";
import "../globals.css";
import { Locale } from "@/lib/translations";

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'SmartShip | منصة الشحن الذكي - بن حبيب للتجارة والاستيراد' : 'SmartShip | Smart Shipping Platform - Bin Habeb Trading',
    description: isAr
      ? 'منصتك الذكية لإدارة الشحنات والاستيراد من الصين إلى اليمن. تتبع لحظي وفواتير إلكترونية.'
      : 'Your smart platform for managing shipments and importing from China to Yemen. Real-time tracking and electronic invoices.',
  };
}

export async function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const lang = locale === 'ar' ? 'ar' : 'en';

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#030A16" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="alternate" hrefLang="ar" href="/ar" />
        <link rel="alternate" hrefLang="en" href="/en" />
      </head>
      <body dir={dir}>{children}</body>
    </html>
  );
}
