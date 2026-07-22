import Link from "next/link";
import { ExternalLink, Mail, ArrowLeft } from "lucide-react"; 

// ==========================================
// ⚙️ PENGATURAN LINK SIDE EVENT (EDIT DI SINI SAJA!)
// ==========================================
const LINK_DATA = [
  {
    title: "Pendaftaran Mini Competition",
    url: "https://forms.gle/...",
    isPrimary: true, // Ubah ke true kalau mau tombolnya warna oren menyala
  },
  {
    title: "Guidebook Mini Competition",
    url: "https://bit.ly/GuidebookMiniCompe",
    isPrimary: true,
  },
  {
    title: "Narahubung (WhatsApp)",
    url: "https://wa.me/628...",
    isPrimary: false, // Dibuat false agar ada hierarki visual
  },
  // Tinggal copy-paste blok di atas kalau mau nambah link baru!
];

export default function SideEventPage() {
  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans flex flex-col items-center pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sunlight-orange/20 blur-[120px] rounded-full z-0"></div>
      
      <div className="w-full max-w-lg z-10 flex flex-col items-center">
        
        {/* Navigasi Back */}
        <Link href="/" className="self-start inline-flex items-center text-silver-shine hover:text-white transition-colors text-sm font-semibold mb-8">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Beranda
        </Link>

        {/* Profile Section */}
        <div className="w-24 h-24 bg-white/5 border border-white/20 rounded-full flex items-center justify-center mb-6 shadow-xl backdrop-blur-md">
           <span className="font-display font-bold text-2xl text-sunlight-orange">E26</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-2 tracking-widest text-center">SIDE EVENT</h1>
        <p className="text-silver-shine text-sm mb-10 text-center max-w-xs">
          EUREKA! ITB 2026 Mini Competition. Dari rasa ingin tahu menjadi dampak nyata.
        </p>

        {/* Links Section (Otomatis menyesuaikan data di atas) */}
        <div className="w-full flex flex-col gap-4 mb-12">
          {LINK_DATA.map((link, index) => (
            <a 
              key={index}
              href={link.url} 
              target="_blank" 
              rel="noreferrer" 
              className={`w-full group p-4 rounded-2xl flex items-center justify-between transition-all backdrop-blur-md overflow-hidden relative ${
                link.isPrimary 
                ? "bg-white/5 border border-white/20 hover:border-sunlight-orange/50 hover:shadow-[0_0_20px_rgba(255,183,3,0.15)]" 
                : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              {link.isPrimary && (
                <div className="absolute inset-0 bg-gradient-to-r from-sunlight-orange/0 via-sunlight-orange/5 to-sunlight-orange/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              )}
              <span className={`text-sm sm:text-base ${link.isPrimary ? "font-bold text-white" : "font-semibold text-silver-shine group-hover:text-white"}`}>
                {link.title}
              </span>
              <ExternalLink size={18} className={link.isPrimary ? "text-sunlight-orange group-hover:scale-110 transition-transform" : "text-white/40 group-hover:text-white"} />
            </a>
          ))}
        </div>

        {/* Social Media Footer */}
        <div className="flex gap-6 items-center">
          {/* Ikon Instagram Murni */}
          <a href="https://instagram.com/eurekaitb" target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/10 hover:text-sunlight-orange transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          {/* Ikon LinkedIn Murni */}
          <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 hover:text-sunlight-orange transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a href="mailto:officialeurekaitb@gmail.com" className="p-3 bg-white/5 rounded-full hover:bg-white/10 hover:text-sunlight-orange transition-colors">
            <Mail size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}