import Link from "next/link";
import { ExternalLink, Mail } from "lucide-react"; 
import { db } from "@/db"; 
import { sideEventBlocks } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const revalidate = 0; 

// FUNGSI AJAIB BUAT NGAKALIN LINK GOOGLE DRIVE (VERSI UPDATE!)
const getDirectImageUrl = (url: string | null) => {
  if (!url) return "";
  
  const gDriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch[1]}`;
  }
  
  return url; 
};

export default async function SideEventPage() {
  const blocks = await db
    .select()
    .from(sideEventBlocks)
    .where(eq(sideEventBlocks.isActive, true))
    .orderBy(asc(sideEventBlocks.orderIndex));

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans flex flex-col items-center pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sunlight-orange/20 blur-[120px] rounded-full z-0"></div>
      
      <div className="w-full max-w-xl z-10 flex flex-col items-center">
        
        {/* Tombol Kembali ke Beranda Sudah Dihapus */}

        <div className="w-24 h-24 bg-white/5 border border-white/20 rounded-full flex items-center justify-center mb-6 shadow-xl backdrop-blur-md">
           <span className="font-display font-bold text-2xl text-sunlight-orange">E26</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-2 tracking-widest text-center uppercase">Side Event</h1>
        <p className="text-silver-shine text-sm mb-10 text-center max-w-sm leading-relaxed">
          EUREKA! ITB 2026 Mini Competition. Dari rasa ingin tahu menjadi dampak nyata.
        </p>

        <div className="w-full flex flex-col gap-4 mb-12">
          {blocks.length === 0 ? (
            <div className="text-center text-silver-shine text-sm p-4 bg-white/5 rounded-2xl border border-white/10">
              Belum ada konten yang ditambahkan.
            </div>
          ) : (
            blocks.map((block) => {
              
              if (block.type === "text") {
                return (
                  <div key={block.id} className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-md my-2">
                    <p className="text-silver-shine text-sm leading-relaxed">{block.title}</p>
                  </div>
                );
              }

              if (block.type === "image") {
                return (
                  <div key={block.id} className="w-full rounded-2xl overflow-hidden border border-white/10 my-2 bg-black/20 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getDirectImageUrl(block.url)} alt={block.title || "EUREKA Image"} className="w-full h-auto object-cover" />
                  </div>
                );
              }

              if (block.type === "video") {
                const embedUrl = block.url ? block.url.replace("watch?v=", "embed/") : "";
                return (
                  <div key={block.id} className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black my-2 aspect-video relative group cursor-pointer">
                    <iframe 
                      src={embedUrl} 
                      title={block.title || "Video Player"}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                );
              }

              return (
                <a 
                  key={block.id}
                  href={block.url || "#"} 
                  target="_blank" 
                  rel="noreferrer" 
                  className={`w-full group p-4 rounded-2xl flex items-center justify-between transition-all backdrop-blur-md overflow-hidden relative min-h-[64px] ${
                    block.isPrimary 
                    ? "bg-white/5 border border-white/20 hover:border-sunlight-orange/50 hover:shadow-[0_0_20px_rgba(255,183,3,0.15)]" 
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {block.isPrimary && (
                    <div className="absolute inset-0 bg-gradient-to-r from-sunlight-orange/0 via-sunlight-orange/5 to-sunlight-orange/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}
                  
                  <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1 pr-4">
                    {block.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getDirectImageUrl(block.iconUrl)} alt="Icon" className="w-6 h-6 object-contain shrink-0" />
                    ) : (
                      block.isPrimary ? null : <div className="w-2 shrink-0"></div> 
                    )}
                    <span className={`text-sm sm:text-base truncate ${block.isPrimary ? "font-bold text-white" : "font-semibold text-silver-shine group-hover:text-white"}`}>
                      {block.title}
                    </span>
                  </div>

                  <ExternalLink size={18} className={`shrink-0 relative z-10 ${block.isPrimary ? "text-sunlight-orange group-hover:scale-110 transition-transform" : "text-white/40 group-hover:text-white"}`} />
                </a>
              );
            })
          )}
        </div>

        {/* Social Media Footer */}
        <div className="flex gap-6 items-center">
          <a href="https://instagram.com/eurekaitb" target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/10 hover:text-sunlight-orange transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
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