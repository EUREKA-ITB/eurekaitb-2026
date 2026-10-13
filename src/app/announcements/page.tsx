import { db } from "@/db";
import { announcements } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Megaphone, Calendar, ArrowLeft, FileText, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicAnnouncementsPage() {
  const allAnnouncements = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden w-full">
      <div className="max-w-4xl mx-auto w-full pt-16 sm:pt-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 w-full box-border gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-silver-shine hover:text-white transition-colors text-sm font-semibold mb-3">
              <ArrowLeft size={16} /> Kembali ke Beranda
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Megaphone className="text-sunlight-orange shrink-0" size={28} /> Pengumuman Resmi EUREKA 2026
            </h1>
          </div>
        </header>

        {/* Kotak Khusus PDF Viewer Pengumuman Semifinal */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl w-full box-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sunlight-orange/20 text-sunlight-orange rounded-2xl border border-sunlight-orange/30">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">PENGUMUMAN SEMIFINAL PHYSICS OLYMPIAD</h2>
                <p className="text-xs text-silver-shine">Pratinjau langsung atau unduh dokumen PDF di bawah ini.</p>
              </div>
            </div>
            <a 
              href="/po/pengumuman-semifinal.pdf" 
              download="Pengumuman-Semifinal-Eureka2026.pdf"
              className="inline-flex items-center justify-center gap-2 bg-sunlight-orange text-blue-marine px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-yellow-400 transition-all shadow-md w-full sm:w-auto shrink-0"
            >
              <Download size={16} /> Download PDF
            </a>
          </div>

          {/* Responsive PDF Embed Container */}
          <div className="w-full h-[500px] sm:h-[650px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden relative shadow-inner">
            <iframe 
              src="/po/pengumuman-semifinal.pdf" 
              title="Pengumuman Semifinal PDF"
              className="w-full h-full border-0"
            />
          </div>
        </div>

        {/* Daftar Pengumuman dari Database */}
        <div className="space-y-6 w-full">
          {allAnnouncements.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-silver-shine">
              Belum ada pengumuman resmi lainnya saat ini.
            </div>
          ) : (
            allAnnouncements.map((item) => (
              <div 
                key={item.id} 
                className={`border rounded-2xl p-6 backdrop-blur-sm transition-all w-full box-border ${
                  item.isPinned 
                    ? "bg-gradient-to-r from-sunlight-orange/10 to-transparent border-sunlight-orange/50 shadow-[0_0_20px_rgba(255,183,3,0.1)]" 
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    item.category === "urgent" 
                      ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                      : item.category === "competition" 
                      ? "bg-sunlight-orange/20 text-sunlight-orange border border-sunlight-orange/30" 
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-silver-shine">
                    <Calendar size={14} />
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                
                <div className="text-sm text-silver-shine leading-relaxed whitespace-pre-wrap break-words">
                  {item.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}