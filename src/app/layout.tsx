import type { Metadata } from "next";
import { DM_Sans, Funnel_Display } from "next/font/google";
import Script from "next/script"; // Wajib untuk Next.js
import { Toaster } from "react-hot-toast";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} ${funnelDisplay.variable}`}>
      <body className="font-sans text-white antialiased relative min-h-screen">
        
        {/* PEMANGGIL TOAST GLOBAL */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
          }} 
        />
        
        {/* WADAH ASLI GOOGLE (DISEMBUNYIKAN) */}
        <div id="google_translate_element" className="hidden"></div>
        <Script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`function googleTranslateElementInit() {
              new google.translate.TranslateElement({ pageLanguage: 'id', autoDisplay: false }, 'google_translate_element');
          }`}
        </Script>

        {/* BACKGROUND LAYER BAWAH STATIS (Fixed & Z-Index paling bawah) */}
        {/* Catatan: Ganti URL bg-image dengan foto kampus/elemen grafis yang kamu mau */}
        <div className="fixed inset-0 z-[-2] bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070')] bg-cover bg-center"></div>
        <div className="fixed inset-0 z-[-1] bg-blue-marine/85 backdrop-blur-sm"></div>

        {/* KONTEN WEB DINAMIS (Bisa di-scroll di atas background) */}
        {children}
      </body>
    </html>
  );
}