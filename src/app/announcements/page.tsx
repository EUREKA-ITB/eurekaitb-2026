import { db } from "@/db";
import { announcements } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Megaphone, Calendar, ArrowLeft } from "lucide-react";

export default async function PublicAnnouncementsPage() {
  const allAnnouncements = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full pt-16 sm:pt-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 w-full box-border gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-silver-shine hover:text-white transition-colors text-sm font-semibold mb-3">
              <ArrowLeft size={16} /> Kembali ke Beranda
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Megaphone className="text-sunlight-orange" size={28} /> Pengumuman Resmi EUREKA 2026
            </h1>
          </div>
        </header>

        <div className="space-y-6">
          {allAnnouncements.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-silver-shine">
              Belum ada pengumuman resmi saat ini.
            </div>
          ) : (
            allAnnouncements.map((item) => (
              <div 
                key={item.id} 
                className={`border rounded-2xl p-6 backdrop-blur-sm transition-all ${
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

                <h2 className="font-display text-xl font-bold text-white mb-3">
                  {item.title}
                </h2>
                
                <div className="text-sm text-silver-shine leading-relaxed whitespace-pre-wrap">
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