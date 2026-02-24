import type { Metadata } from "next";
import { CompanyProvider } from '@/lib/company-context';
import "./globals.css";
import { TenantProvider } from "@/lib/providers/tenant-provider";
import ChatWidget from '@/components/chat-widget';
import CartDrawer from '@/components/cart-drawer';

export const metadata: Metadata = {
  title: "WoulfAI - AI Employees That Actually Work",
  description: "Deploy intelligent AI agents for warehouse management, sales, finance, marketing, and customer support. Automate your operations 24/7.",
  keywords: "AI agents, warehouse management, WMS, sales automation, CFO automation, marketing AI, customer support AI",
  openGraph: {
    title: "WoulfAI - AI Employees That Actually Work",
    description: "Deploy intelligent AI agents that handle your operations 24/7.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var h = window.location.hash;
            if (h && h.indexOf('type=recovery') !== -1 && window.location.pathname !== '/reset-password') {
              window.location.replace('/reset-password' + h);
            }
          })();
        `}} />
      </head>
      <body suppressHydrationWarning className="bg-[#0a0a0f] text-white antialiased">
        <TenantProvider><CompanyProvider>{children}</CompanyProvider></TenantProvider>
        <CartDrawer />
        <ChatWidget />
      </body>
    </html>
  );
}