import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  preload: true
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Martin Mukoya | Business Systems Developer",
    template: "%s | Martin Mukoya"
  },
  description:
    "A practical business-systems developer helping businesses increase bookings, automate work, and turn visitors into clients.",
  openGraph: {
    title: "Martin Mukoya | Business Systems Developer",
    description:
      "Portfolio and lead-generation platform for practical websites, booking systems, ecommerce, and AI automations.",
    url: "/",
    siteName: "Martin Mukoya",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
