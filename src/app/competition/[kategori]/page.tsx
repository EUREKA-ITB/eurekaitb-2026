"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Trophy, Users, FileText, Calendar, Medal, HelpCircle, ChevronRight } from "lucide-react";

export default function CompetitionDetailPage({ params }: { params: Promise<{ kategori: string }> }) {
  const resolvedParams = use(params);
  const formatName = resolvedParams.kategori.replace(/_/g, " ").toUpperCase();
  
  // 1. DATA DOKUMEN
  const getDocuments = (kategori: string) => {
    if (kategori === "physics_olympiad") {
      return [
        { id: "guidebook", title: "Guidebook Olimpiade", url: `/guidebooks/${kategori}.pdf` },
        { id: "silabus", title: "Silabus & Kisi-Kisi", url: `/guidebooks/silabus_${kategori}.pdf` },
      ];
    }
    return [
      { id: "guidebook", title: "Guidebook Resmi", url: `/guidebooks/${kategori}.pdf` },
      { id: "format_laporan", title: "Format Laporan", url: `/guidebooks/format_laporan_${kategori}.pdf` },
    ];
  };

  const documents = getDocuments(resolvedParams.kategori);
  const [activePdfIndex, setActivePdfIndex] = useState(0);
  const activeDoc = documents[activePdfIndex];

  // 2. DATA INFO LOMBA
  const getCompeInfo = (kategori: string) => {
    if (kategori === "physics_olympiad") return { type: "Individu", desc: "ITB Physics Olympiad EUREKA 2026 adalah kompetisi olimpiade fisika tingkat nasional bagi pelajar SMA/Sederajat, dirancang untuk mengasah kemampuan individu memecahkan soal fisika tingkat lanjut secara logis, kreatif, dan sistematis." };
    if (kategori === "science_project") return { type: "Kelompok (Maks 3 Orang)", desc: "Science Project EUREKA 2026 adalah kompetisi inovasi sains tingkat nasional bagi pelajar SMA/Sederajat. Tantang tim kamu untuk merancang proyek sains tepat guna yang solutif untuk menyelesaikan masalah di lingkungan sekitar." };
    return { type: "Kelompok (Maks 3 Orang)", desc: "Industrial Case Competition EUREKA 2026 adalah ajang studi kasus industri nyata bagi mahasiswa S1 di seluruh Indonesia. Uji kemampuan analisis dan strategi tim kamu dalam memecahkan masalah industri modern." };
  };
  const info = getCompeInfo(resolvedParams.kategori);

  // 3. DATA TIMELINE
  const getTimeline = (kategori: string) => {
    return [
      { date: "12 Nov - 10 Feb", title: "Registrasi & Pendaftaran", desc: "Pendaftaran peserta dan verifikasi berkas secara online." },
      { date: "14 Feb 2026", title: "Tahap Penyisihan", desc: "Babak penyisihan dilaksanakan serentak secara daring." },
      { date: "28 Feb 2026", title: "Pengumuman Semifinalis", desc: "Pengumuman peserta yang lolos ke babak semifinal." },
      { date: "2 - 4 Mei 2026", title: "Tahap Final di ITB", desc: "Babak puncak dilaksanakan secara luring di Kampus ITB." },
    ];
  };
  const timelineData = getTimeline(resolvedParams.kategori);

  // 4. DATA FAQ KHUSUS LOMBA 
  const getFaq = (kategori: string) => {
    return [
      { q: `Apakah diperbolehkan mendaftar ${formatName} dan cabang lomba lain sekaligus?`, a: "Boleh, asalkan jadwal tahapan lomba tidak bentrok satu sama lain." },
      { q: "Apakah peserta yang lolos ke babak semifinal wajib hadir langsung di ITB?", a: "Ya, untuk babak semifinal dan final diwajibkan hadir secara luring di Kampus ITB Ganesha." },
      { q: "Bagaimana jika ada anggota tim yang mendadak berhalangan ikut final?", a: "Pergantian anggota maksimal dilakukan H-7 sebelum tahap final dengan menyertakan surat keterangan resmi." },
    ];
  };
  const faqData = getFaq(resolvedParams.kategori);

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans overflow-x-hidden pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-16">
        
        {/* Navigasi Back */}
        <Link href="/#lomba" className="inline-flex items-center text-silver-shine hover:text-white transition-colors w-max text-sm font-semibold relative z-20">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Daftar Lomba
        </Link>

        {/* 1. HERO SECTION */}
        <section className="relative text-center flex flex-col items-center justify-center pt-8 pb-12">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-sunlight-orange/15 blur-[100px] rounded-full z-0 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-sunlight-orange/10 border border-sunlight-orange/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-sunlight-orange mb-6">
              <Trophy size={14} /> EUREKA 2026 COMPETITION
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              {formatName}
            </h1>
            
            <p className="text-silver-shine text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-10">
              {info.desc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <div className="bg-white/5 border border-white/10 px-6 py-3.5 rounded-full flex items-center gap-3 w-full sm:w-auto justify-center">
                <Users size={18} className="text-sunlight-orange" />
                <span className="text-sm font-bold">{info.type}</span>
              </div>
              <Link 
                href={`/dashboard/register-lomba?lomba=${resolvedParams.kategori}`}
                className="bg-sunlight-orange text-blue-marine px-8 py-3.5 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 w-full sm:w-auto shadow-[0_0_20px_rgba(255,184,0,0.3)]"
              >
                Daftar Kompetisi Ini <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* 2. PDF VIEWER SECTION */}
        <section className="relative z-10">
          <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-[2rem] backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold flex items-center gap-3 mb-2">
                  <BookOpen className="text-sunlight-orange" /> Dokumen & Panduan
                </h2>
                <p className="text-sm text-silver-shine">Baca atau unduh panduan resmi pelaksanaan kompetisi.</p>
              </div>
              
              {/* TAB NAVIGASI MULTI-DOKUMEN */}
              <div className="flex flex-wrap gap-2">
                {documents.map((doc, index) => (
                  <button
                    key={doc.id}
                    onClick={() => setActivePdfIndex(index)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activePdfIndex === index 
                      ? "bg-sunlight-orange text-blue-marine shadow-lg" 
                      : "bg-black/30 border border-white/10 text-silver-shine hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <FileText size={16} /> {doc.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame PDF dgn Object Fallback */}
            <div className="w-full bg-[#0a0f24] border border-white/10 rounded-2xl overflow-hidden relative h-[400px] md:h-[700px] flex flex-col items-center justify-center group">
              
              {/* Tampilan Desktop */}
              <object 
                data={`${activeDoc.url}#toolbar=0`} 
                type="application/pdf" 
                className="hidden md:block w-full h-full absolute inset-0 z-10"
              >
                {/* Fallback Inner HTML kl file PDF blm ada di folder public */}
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-black/40">
                  <FileText size={48} className="text-white/20 mb-4" />
                  <p className="text-white font-bold mb-2">Dokumen Belum Tersedia</p>
                  <p className="text-sm text-silver-shine">Pastikan file <b>{activeDoc.url}</b> sudah di-upload ke dalam folder project.</p>
                </div>
              </object>

              {/* Tampilan Mobile / Button Fallback */}
              <div className="md:hidden flex flex-col items-center justify-center p-8 text-center h-full relative z-20">
                <FileText size={48} className="text-sunlight-orange mb-4 opacity-50" />
                <h3 className="font-bold text-lg mb-2">Pratinjau Dokumen</h3>
                <p className="text-silver-shine text-sm mb-6">Perangkat mobile atau browser ini tidak mendukung pratinjau PDF langsung di dalam web.</p>
                <a 
                  href={activeDoc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-sunlight-orange text-blue-marine font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition-colors"
                >
                  Buka / Unduh {activeDoc.title}
                </a>
              </div>

              {/* Tombol Unduh (Desktop) */}
              <a href={activeDoc.url} download className="hidden md:flex absolute top-4 right-6 z-20 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-white text-xs font-bold items-center gap-2 transition-colors">
                Unduh PDF
              </a>
            </div>
          </div>
        </section>

        {/* 3. TIMELINE SECTION */}
        <section className="relative z-10 py-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <Calendar className="text-sunlight-orange" /> Timeline Kompetisi
            </h2>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-6 md:left-1/2 md:-ml-[1px] top-0 bottom-0 w-[2px] bg-white/10"></div>
            
            <div className="flex flex-col gap-8">
              {timelineData.map((item, index) => (
                <div key={index} className={`relative flex flex-col md:flex-row items-start md:items-center ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-blue-marine border-2 border-sunlight-orange -translate-x-[7px] mt-1.5 md:mt-0 z-10"></div>
                  
                  <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12 md:text-right"}`}>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm hover:border-sunlight-orange/30 transition-colors">
                      <span className="inline-block px-3 py-1 bg-sunlight-orange/10 text-sunlight-orange text-xs font-bold rounded-full mb-3">
                        {item.date}
                      </span>
                      <h3 className="font-display text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-silver-shine leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. HADIAH PEMENANG SECTION */}
        <section className="relative z-10 py-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
              <Medal className="text-sunlight-orange" /> Hadiah Pemenang
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-4xl mx-auto">
            {/* Juara 2 */}
            <div className="order-2 md:order-1 bg-white/5 border border-white/10 p-6 rounded-3xl text-center w-full md:w-1/3 hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 mx-auto bg-gray-300/20 rounded-full flex items-center justify-center text-2xl mb-4 border border-gray-400">🥈</div>
              <p className="text-xs uppercase tracking-widest text-silver-shine mb-1">2nd Winner</p>
              <h3 className="text-2xl font-bold text-white">Rp 2.000.000</h3>
            </div>
            
            {/* Juara 1 */}
            <div className="order-1 md:order-2 bg-gradient-to-b from-sunlight-orange/20 to-transparent border border-sunlight-orange/50 p-8 rounded-[2.5rem] text-center w-full md:w-1/3 shadow-[0_0_30px_rgba(255,184,0,0.15)] transform md:-translate-y-4">
              <div className="w-20 h-20 mx-auto bg-sunlight-orange/20 rounded-full flex items-center justify-center text-4xl mb-4 border border-sunlight-orange shadow-[0_0_15px_rgba(255,184,0,0.5)]">🏆</div>
              <p className="text-xs uppercase tracking-widest text-sunlight-orange font-bold mb-1">1st Winner</p>
              <h3 className="text-3xl font-bold text-white">Rp 3.000.000</h3>
            </div>

            {/* Juara 3 */}
            <div className="order-3 md:order-3 bg-white/5 border border-white/10 p-6 rounded-3xl text-center w-full md:w-1/3 hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 mx-auto bg-amber-700/30 rounded-full flex items-center justify-center text-2xl mb-4 border border-amber-800">🥉</div>
              <p className="text-xs uppercase tracking-widest text-silver-shine mb-1">3rd Winner</p>
              <h3 className="text-2xl font-bold text-white">Rp 1.000.000</h3>
            </div>
          </div>
          <p className="text-center text-xs text-silver-shine mt-8 max-w-2xl mx-auto">
            *Seluruh peserta yang mengikuti babak penyisihan akan menerima sertifikat elektronik, sementara peserta yang berhasil lolos ke babak final akan memperoleh sertifikat fisik.
          </p>
        </section>

        {/* 5. FAQ SECTION */}
        <section className="relative z-10 py-10 border-t border-white/10">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-1/3">
              <h2 className="font-display text-3xl font-bold flex items-center gap-3 mb-4">
                <HelpCircle className="text-sunlight-orange" /> FAQ
              </h2>
              <p className="text-sm text-silver-shine leading-relaxed">
                Berikut adalah kumpulan pertanyaan yang paling sering muncul terkait <b>{formatName}</b> untuk memudahkanmu memahami informasi kompetisi ini.
              </p>
            </div>
            <div className="md:w-2/3 flex flex-col gap-3">
              {faqData.map((item, index) => (
                <details key={index} className="group bg-black/20 border border-white/10 rounded-2xl p-5 hover:bg-white/5 transition-colors cursor-pointer">
                  <summary className="font-bold text-sm list-none flex justify-between items-center outline-none">
                    <span className="pr-6">{item.q}</span>
                    <ChevronRight size={16} className="text-sunlight-orange shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-4 text-sm text-silver-shine leading-relaxed border-t border-white/10 pt-4">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}