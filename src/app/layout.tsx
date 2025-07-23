import type { Metadata, Viewport } from "next/types";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Navigation } from "@/components/ui/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Shelivery - Group Shopping for Dormitories",
  description:
    "Share delivery costs and coordinate group orders with your dormmates",
  keywords: [
    "group shopping",
    "delivery sharing",
    "dormitory",
    "cost savings",
    "student",
  ],
  authors: [{ name: "Shelivery Team" }],
  creator: "Shelivery",
  publisher: "Shelivery",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://shelivery.app"
  ),
  openGraph: {
    title: "Shelivery - Group Shopping for Dormitories",
    description:
      "Share delivery costs and coordinate group orders with your dormmates",
    type: "website",
    locale: "en_US",
    siteName: "Shelivery",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shelivery - Group Shopping for Dormitories",
    description:
      "Share delivery costs and coordinate group orders with your dormmates",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/shelivery-logo2.png",
    shortcut: "/icons/shelivery-logo2.png",
    apple: "/icons/shelivery-logo2.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shelivery",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#245b7b" },
    { media: "(prefers-color-scheme: dark)", color: "#245b7b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shelivery" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${inter.className} antialiased min-h-screen bg-background font-sans`}
      >
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
        
      </body>
    </html>
  );
}
