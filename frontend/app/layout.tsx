import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { FloatingChatWidget } from "@/components/ui/floating-chat-widget-shadcnui";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"),
  title: {
    default: "AssetFlow ERP",
    template: "%s | AssetFlow ERP",
  },
  description:
    "A modern Enterprise Resource Planning platform for inventory, finance, procurement, HR, and business operations.",
  applicationName: "AssetFlow ERP",
  keywords: [
    "ERP",
    "Enterprise",
    "Inventory",
    "Finance",
    "Dashboard",
    "Management",
  ],
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full scroll-smooth antialiased",
        geist.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
        <FloatingChatWidget />
      </body>
    </html>
  );
}