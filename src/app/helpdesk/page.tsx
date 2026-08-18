"use client";

import { Headphones, Mail, ShieldCheck, Clock3, MessageSquareWarning, MessageCircle, Bug } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import EmailHelpButton from "@/components/EmailHelpButton";
import FaqRating from "@/components/FaqRating";
import Link from "next/link";

export default function HelpdeskPage() {
  const whatsappNumberGen = process.env.NEXT_PUBLIC_HELPDESK_WHATSAPP ?? "6283148657849";
  const whatsappTemplateGen = encodeURIComponent(
    "Halo tim helpdesk EUREKA 2026, ada yang ingin saya tanyakan terkait Eureka! ITB 2026 ini. [Jelaskan keperluan Anda]"
  );

  const whatsappNumberCompe = process.env.NEXT_PUBLIC_HELPDESK_WHATSAPP ?? "62895324405010";
  const whatsappTemplateCompe = encodeURIComponent(
    "Halo tim helpdesk EUREKA 2026, ada yang ingin saya tanyakan terkait [sebutkan jenis kompetisi yang ingin ditanyakan]."
  );

  const whatsappNumberTech = process.env.NEXT_PUBLIC_HELPDESK_WHATSAPP ?? "6285139556416";
  const whatsappTemplateTech = encodeURIComponent(
    "Halo tim helpdesk EUREKA 2026, saya mengalami kendala teknis [sebutkan kendala teknis yang dialami]. Mohon bantuannya."
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-28 pb-20 text-white selection:bg-sunlight-orange selection:text-blue-marine overflow-x-hidden">
      <div className="mx-auto max-w-5xl w-full">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sunlight-orange/10 text-sunlight-orange mb-6 shadow-[0_0_30px_rgba(255,184,0,0.2)]">
            <Headphones size={32} />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Support Center</h1>
          <p className="text-silver-shine text-sm sm:text-base max-w-2xl mx-auto">
            Tim Support EUREKA ITB 2026 siap membantu kamu. Silakan pilih kategori bantuan yang sesuai agar kami bisa merespons dengan cepat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          
          {/* QUICK ACTION / WHATSAPP */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-md w-full flex flex-col justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-white flex items-center gap-2 mb-2">
                <MessageSquareWarning className="text-sunlight-orange" size={24} /> Butuh bantuan cepat?
              </h3>
              <p className="text-sm leading-relaxed text-silver-shine mb-6">
                Jika Anda mengalami masalah saat upload bukti pembayaran, mengubah data tim, atau mengakses dashboard, hubungi support kami langsung via WhatsApp.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/${whatsappNumberGen}?text=${whatsappTemplateGen}`}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-xl border border-sunlight-orange/40 bg-sunlight-orange px-4 py-3.5 text-sm font-bold text-blue-marine hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> General (Umum)
              </a>
              <a
                href={`https://wa.me/${whatsappNumberCompe}?text=${whatsappTemplateCompe}`}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-xl border border-sunlight-orange/40 bg-sunlight-orange/10 px-4 py-3.5 text-sm font-bold text-sunlight-orange hover:bg-sunlight-orange/20 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> Kompetisi & Panduan
              </a>
              <a
                href={`https://wa.me/${whatsappNumberTech}?text=${whatsappTemplateTech}`}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Bug size={18} /> Kendala Teknis / Error
              </a>
            </div>
          </div>

          {/* OFFICIAL CHANNELS */}
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-black/20 p-8 shadow-xl backdrop-blur-md w-full flex flex-col justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white mb-6">Kontak Resmi & Info</h2>
              
              <div className="space-y-4 text-sm w-full">
                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-black/30 p-4 w-full hover:border-white/20 transition-colors">
                  <Mail className="mt-0.5 text-sunlight-orange shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white mb-1">Email Resmi</p>
                    <div className="flex items-center justify-between gap-2">
                      <a href="mailto:officialeurekaitb@gmail.com" target="_blank" rel="noreferrer" className="text-silver-shine hover:text-white break-all text-xs sm:text-sm">
                        officialeurekaitb@gmail.com
                      </a>
                      <CopyButton text="officialeurekaitb@gmail.com" ariaLabel="Copy email" className="shrink-0 text-silver-shine hover:text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-black/30 p-4 w-full hover:border-white/20 transition-colors">
                  <ShieldCheck className="mt-0.5 text-sunlight-orange shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white mb-1">Instagram Resmi</p>
                    <div className="flex items-center justify-between gap-2">
                      <a href="https://instagram.com/eurekaitb" target="_blank" rel="noreferrer" className="text-silver-shine hover:text-white break-all text-xs sm:text-sm">
                        @eurekaitb
                      </a>
                      <CopyButton text="@eurekaitb" ariaLabel="Copy instagram handle" className="shrink-0 text-silver-shine hover:text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-black/30 p-4 w-full">
                  <Clock3 className="mt-0.5 text-sunlight-orange shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-white mb-1">Jam Operasional CS</p>
                    <p className="text-silver-shine text-xs sm:text-sm">Senin–Jumat, 08.00–17.00 WIB</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
               <EmailHelpButton />
            </div>
          </div>

        </div>

        {/* FEEDBACK SECTION */}
        <div className="max-w-2xl mx-auto">
          <FaqRating />
        </div>

      </div>
    </div>
  );
}