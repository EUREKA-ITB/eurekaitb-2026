import { db } from "@/db";
import { sideEventBlocks } from "@/db/schema";
import { asc } from "drizzle-orm";
import ClientUI from "./ClientUI";
import { Info } from "lucide-react";

export const revalidate = 0;

export default async function AdminSideEventPage() {
  const blocks = await db.select().from(sideEventBlocks).orderBy(asc(sideEventBlocks.orderIndex));

  return (
    <div className="min-h-screen bg-blue-marine text-white pt-28 pb-20 px-4 sm:px-6 relative overflow-x-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sunlight-orange/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-sunlight-orange/30 bg-sunlight-orange/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-sunlight-orange mb-4">
            Command Center
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">
            Side Event Configuration
          </h1>
          <p className="text-silver-shine text-sm sm:text-base max-w-2xl leading-relaxed">
            Manage your dynamic Linktree-style portal here. You can construct the page using multiple block types including standard links, embedded videos, images, and text content. Changes are pushed globally in real-time.
          </p>

          {/* BANNER CATATAN PENTING UNTUK ADMIN */}
          <div className="mt-6 flex gap-4 items-start bg-blue-500/10 border border-blue-500/20 p-4 sm:p-5 rounded-2xl max-w-3xl backdrop-blur-sm">
            <Info className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-blue-400 text-sm mb-1">Penting: Aturan Upload Gambar & Ikon</h3>
              <p className="text-silver-shine text-sm leading-relaxed">
                Jika gambar yang di-upload melalui Google Drive tidak muncul di halaman side-event, anda bisa <i>upload</i> file Anda ke <i>hosting</i> gambar gratis seperti <a href="https://postimages.org/" target="_blank" rel="noreferrer" className="text-white font-semibold hover:text-sunlight-orange transition-colors underline decoration-white/30 underline-offset-2">Postimages</a> atau <a href="https://imgbb.com/" target="_blank" rel="noreferrer" className="text-white font-semibold hover:text-sunlight-orange transition-colors underline decoration-white/30 underline-offset-2">Imgbb</a>. Kemudian salin <strong>Direct Link</strong> (yang berakhiran <code>.png</code> / <code>.jpg</code> / <code>.webp</code>) dan tempel URL tersebut ke form di bawah.
                Pastikan gambar yang diunggah berukuran maksimal 2MB agar tidak memperlambat halaman saat loading.
              </p>
            </div>
          </div>
          
        </div>

        <ClientUI initialBlocks={blocks} />
      </div>
    </div>
  );
}