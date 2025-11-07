import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import AuthGate from "@/components/auth-gate";
import { Toaster } from "@/components/ui/sonner";
import SiteNotice from "@/components/SiteNotice";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "K2ON",
    template: "%s | K2ON",
  },
  description: "Plataforma K2ON",
};

// Força renderização dinâmica para garantir execução do middleware/proxy em todas as páginas.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthGate>
            <SiteNotice />
            {children}
          </AuthGate>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
