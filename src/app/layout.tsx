import type { Metadata, Viewport } from "next";
import { uiHand, uiSans, uiSerif } from "@/lib/fonts";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Dearly — Put your thoughts on paper", template: "%s · Dearly" },
  description:
    "Write beautiful handwritten-style letters on digital stationery, then send them in an envelope that opens with a tap.",
  applicationName: "Dearly",
  // iOS home-screen app: name under the icon, full-screen launch, light status bar.
  appleWebApp: { capable: true, title: "Dearly", statusBarStyle: "default" },
  openGraph: {
    title: "Dearly — Some things are better written",
    description: "Handwritten-style letters on beautiful digital paper, delivered in an envelope that opens with a tap.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ECEBE7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${uiSans.variable} ${uiSerif.variable} ${uiHand.variable}`}>
      <body className="min-h-dvh antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
