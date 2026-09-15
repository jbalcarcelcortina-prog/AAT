import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { t } from "@/lib/strings";
import { Providers } from "./providers";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${t.brand.name} — ${t.brand.tagline}`,
    template: `%s · ${t.brand.name}`,
  },
  description: t.landing.subhead,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
