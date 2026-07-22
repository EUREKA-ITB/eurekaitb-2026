import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Competitions", href: "/#lomba" },
  { label: "FAQ", href: "/faq" },
  { label: "Side Event", href: "/side-event" },
];

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.78L23.2 22h-6.4l-5-6.56L5.9 22H2.8l7.3-8.35L.8 2h6.55l4.52 5.94L18.9 2Zm-1.12 18h1.72L6.42 3.94H4.58L17.78 20Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 6.5A2.44 2.44 0 1 1 2.05 6.5a2.44 2.44 0 0 1 4.89 0ZM2.45 8.95h4.95V22H2.45V8.95Zm7.63 0h4.74v1.78h.07c.66-1.25 2.27-2.57 4.67-2.57 5 0 5.92 3.29 5.92 7.57V22h-4.96v-5.49c0-1.31-.03-3-1.83-3-1.84 0-2.12 1.44-2.12 2.9V22h-4.94V8.95Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.8 2c.5 2.7 2.3 4.4 4.9 4.7v3a8 8 0 0 1-4.7-1.5v6.6a6.7 6.7 0 1 1-6.7-6.7c.3 0 .6 0 .8.1v3.3a3.3 3.3 0 1 0 2.6 3.2V2h3.1Z" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer id="kontak" className="mt-20 border-t border-white/10 bg-[#030613]/95 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
          
          {/* Kolom 1: Branding & Deskripsi */}
          <div>
            <p className="font-display text-3xl font-bold tracking-widest">
              EUREKA! <span className="text-sunlight-orange">ITB 2026</span>
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-silver-shine">
              Official website of EUREKA! ITB 2026. Portal peserta, kompetisi, guidebook, dan informasi utama disusun dalam satu alur yang rapi.
            </p>
          </div>

          {/* Kolom 2: Quick Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-silver-shine">Quick Links</p>
            <div className="mt-4 flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-sunlight-orange/40 hover:bg-white/10">
                  <span>{link.label}</span>
                  <ArrowUpRight size={16} className="text-sunlight-orange" />
                </Link>
              ))}
            </div>
          </div>

          {/* Kolom 3: Contact & Ikon Sosial Media (Ala MCF) */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-silver-shine">Contact</p>
            <div className="mt-4 space-y-4 text-sm text-silver-shine">
              <div>
                <p className="font-semibold text-white">Email</p>
                <a href="mailto:officialeurekaitb@gmail.com" className="hover:text-sunlight-orange transition-colors">officialeurekaitb@gmail.com</a>
              </div>
              <div>
                <p className="font-semibold text-white">Address</p>
                <p className="leading-7">ITB Kampus Ganesha, Jl. Ganesa No. 10, Coblong, Kota Bandung, Jawa Barat 40132</p>
              </div>
              
              {/* Bagian Sosmed Murni Ikon Clickable */}
              <div className="pt-2">
                <p className="font-semibold text-white mb-3">Social Media</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://instagram.com/eurekaitb" target="_blank" rel="noreferrer" aria-label="Instagram EUREKA ITB" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-sunlight-orange/50 hover:bg-sunlight-orange/10 hover:text-sunlight-orange">
                    <InstagramIcon />
                  </a>
                  <a href="mailto:officialeurekaitb@gmail.com" aria-label="Email EUREKA ITB" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-sunlight-orange/50 hover:bg-sunlight-orange/10 hover:text-sunlight-orange">
                    <Mail size={16} />
                  </a>
                  <a href="#" aria-label="X EUREKA ITB" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-sunlight-orange/50 hover:bg-sunlight-orange/10 hover:text-sunlight-orange">
                    <XIcon />
                  </a>
                  <a href="#" aria-label="LinkedIn EUREKA ITB" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-sunlight-orange/50 hover:bg-sunlight-orange/10 hover:text-sunlight-orange">
                    <LinkedinIcon />
                  </a>
                  <a href="#" aria-label="TikTok EUREKA ITB" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-sunlight-orange/50 hover:bg-sunlight-orange/10 hover:text-sunlight-orange">
                    <TikTokIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-silver-shine sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-sunlight-orange" />
            <span>Built for EUREKA! ITB 2026</span>
          </div>
          <p>© 2026 EUREKA! ITB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}