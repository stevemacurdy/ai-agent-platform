import type { Metadata } from "next";
import { CompanyProvider } from '@/lib/company-context';
import "./globals.css";
import { TenantProvider } from "@/lib/providers/tenant-provider";
import ChatWidget from '@/components/chat-widget';
import { JSON_LD } from '@/lib/seo';
import CartDrawer from '@/components/cart-drawer';

export const metadata: Metadata = {
  title: "WoulfAI - AI Employees That Actually Work",
  description: "Hire intelligent AI employees for warehouse management, sales, finance, marketing, and customer support. Your AI workforce operates 24/7.",
  keywords: "AI employees, warehouse management, WMS, sales automation, CFO automation, marketing AI, customer support AI, AI workforce",
  openGraph: {
    title: "WoulfAI - AI Employees That Actually Work",
    description: "Hire intelligent AI employees that handle your operations 24/7.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        {/* ── Global Fonts (loaded once, inherited everywhere) ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap"
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B2A4A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WoulfAI" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var h = window.location.hash;
            if (h && h.indexOf('type=recovery') !== -1 && window.location.pathname !== '/reset-password') {
              window.location.replace('/reset-password' + h);
            }
          })();
        `}} />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#F4F5F7] text-[#1A1A2E] antialiased"
        style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        <TenantProvider><CompanyProvider>{children}</CompanyProvider></TenantProvider>
        <CartDrawer />
        <ChatWidget />
        <script dangerouslySetInnerHTML={{ __html: `if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js")})}` }} />
      </body>
    </html>
  );
}
