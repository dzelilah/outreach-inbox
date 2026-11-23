import type { Metadata } from "next";
import { Geist_Mono, Inter, Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Same pairing as moonrank.ai: Inter for text, Manrope for headings.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Outreach Inbox",
  description: "Review link-building opportunities and their outreach drafts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* The app has no dark mode, so the toasts stay light too. */}
        <Toaster theme="light" />
      </body>
    </html>
  );
}
