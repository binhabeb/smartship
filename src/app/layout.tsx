import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartShip | منصة الشحن الذكي - بن حبيب للتجارة والاستيراد",
  description: "SmartShip هي منصتك الذكية لإدارة الشحنات والاستيراد من الصين إلى اليمن. تتبع لحظي، فواتير إلكترونية، ودعم عبر الواتساب.",
  keywords: "استيراد من الصين, شحن تجاري, شركة بن حبيب للتجارة, تخليص جمركي, شحن إلى اليمن, SmartShip",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
