import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { DM_Sans, Funnel_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const funnelDisplay = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel-display",
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EUREKA! ITB 2026",
  description: "Official Website of EUREKA! ITB 2026",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="id" className={`${dmSans.variable} ${funnelDisplay.variable}`}>
      <body suppressHydrationWarning className="font-sans text-white antialiased relative min-h-screen bg-blue-marine">
        
        {/* PEMANGGIL TOAST GLOBAL */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
          }} 
        />
        
        <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(255,184,0,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_30%),linear-gradient(180deg,_#050A1F,_#03060F)]"></div>
        <div className="fixed inset-0 -z-10 opacity-25 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.09%22%3E%3Ccircle cx=%223%22 cy=%223%22 r=%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>

        <Navbar session={session} />
        <main className="relative z-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}