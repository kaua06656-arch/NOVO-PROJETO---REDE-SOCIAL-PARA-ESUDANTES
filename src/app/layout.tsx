import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://novo-projeto-rede-social-para-esuda.vercel.app"),
  title: "RoomiePI - Conectando Estudantes",
  description: "Encontre o colega e o local ideal para morar de forma simples e segura.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RoomiePI",
  },
  openGraph: {
    title: "RoomiePI - Conectando Estudantes",
    description: "Encontre o colega e o local ideal para morar de forma simples e segura.",
    type: "website",
    locale: "pt_BR",
    siteName: "RoomiePI",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RoomiePI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoomiePI - Conectando Estudantes",
    description: "Encontre o colega e o local ideal para morar de forma simples e segura.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg"
        >
          Pular para o conteúdo
        </a>
        <main id="main-content">
          {children}
        </main>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
