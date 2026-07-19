"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Trophy, Users, FileText } from "lucide-react";

// Karena ini Client Component (butuh state untuk tab PDF), kita unwrap Promise via hook `use` bawaan React.
export default function CompetitionDetailPage({ params }: { params: Promise<{ kategori: string }> }) {
  const resolvedParams = use(params);
  const formatName = resolvedParams.kategori.replace(/_/g, " ").toUpperCase();
  
  // LOGIKA MULTI-DOKUMEN
  // Setiap lomba bisa punya array dokumen yang berbeda-beda
  const getDocuments = (kategori: string) => {
    if (kategori === "physics_olympiad") {
      return [
        { id: "guidebook", title: "Guidebook Olimpiade", url: `/guidebooks/${kategori}.pdf` },
        { id: "silabus", title: "Silabus & Kisi-Kisi", url: `/guidebooks/silabus_${kategori}.pdf` },
      ];
    }
    // SPC & ICC mungkin cuma butuh 1 atau 2 dokumen
    return [
      { id: "guidebook", title: "Guidebook Resmi", url: `/guidebooks/${kategori}.pdf` },
      { id: "format_laporan", title: "Format Laporan", url: `/guidebooks/format_laporan_${kategori}.pdf` },
    ];
  };

  const documents = getDocuments(resolvedParams.kategori);
  
  // State untuk melacak PDF mana yang sedang aktif dilihat
  const [activePdfIndex, setActivePdfIndex] = useState(0);
  const activeDoc = documents[activePdfIndex];

  // Konten dinamis deskripsi lomba
  const getCompeInfo = (kategori: string) => {
    if (kategori === "physics_olympiad") return { type: "Individu", desc: "Kompetisi fisika tingkat nasional. Babak semifinal akan berupa ujian tertulis yang disubmit via web." };
    if (kategori === "science_project") return { type: "Kelompok (Maks 3 Orang)", desc: "Ajang inovasi merancang proyek sains tepat guna untuk menyelesaikan masalah lingkungan." };
    return { type: "Kelompok (Maks 3 Orang)", desc: "Tantangan analisis kasus industri nyata untuk mahasiswa S1 di seluruh Indonesia." };
  };
  const info = getCompeInfo(resolvedParams.kategori);

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans overflow-x-hidden pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6 w-full flex flex-col gap-10">
        
        {/* Navigasi */}
        <Link href="/#lomba" className="inline-flex items-center text-silver-shine hover:text-white transition-colors w-max text-sm font-semibold">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Daftar Lomba
        </Link>

        {/* Hero Section */}
        <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-sunlight-orange/20 blur-3xl rounded-full z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-sunlight-orange mb-4">
                <Trophy size={14} /> EUREKA 2026 COMPETITION
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">{formatName}</h1>
              <p className="text-silver-shine text-base md:text-lg leading-relaxed">{info.desc}</p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                <span className="text-xs text-silver-shine uppercase tracking-wider block mb-1">Kategori Peserta</span>
                <span className="font-bold flex items-center gap-2 text-sm"><Users size={16} className="text-sunlight-orange"/> {info.type}</span>
              </div>
              
              {/* Pesan Penting Submission (Berubah jadi Link) */}
              <Link 
                href={`/dashboard/register-lomba?lomba=${resolvedParams.kategori}`}
                className="block bg-sunlight-orange/10 hover:bg-sunlight-orange/20 p-4 rounded-xl border border-sunlight-orange/30 transition-colors group cursor-pointer"
              >
                <span className="text-xs text-sunlight-orange uppercase tracking-wider block mb-1">Daftar Kompetisi Ini</span>
                <span className="font-semibold text-sm text-white group-hover:underline flex items-center gap-2">
                  Halaman Pendaftaran ➔
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section PDF Viewer Interaktif */}
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-3">
            <BookOpen className="text-sunlight-orange" /> Dokumen & Panduan Lomba
          </h2>
          
          {/* TAB NAVIGASI MULTI-DOKUMEN */}
          <div className="flex flex-wrap gap-2 mb-2">
            {documents.map((doc, index) => (
              <button
                key={doc.id}
                onClick={() => setActivePdfIndex(index)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activePdfIndex === index 
                  ? "bg-sunlight-orange text-blue-marine" 
                  : "bg-white/5 border border-white/10 text-silver-shine hover:bg-white/10 hover:text-white"
                }`}
              >
                <FileText size={16} /> {doc.title}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <a href={activeDoc.url} download className="text-sunlight-orange text-sm font-bold hover:underline">
              ↓ Unduh {activeDoc.title}
            </a>
          </div>

          {/* Frame PDF (Responsive: Muncul di Desktop, Tombol di Mobile) */}
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative h-[300px] md:h-[800px] flex flex-col items-center justify-center">
            
            {/* 1. Tampilan Desktop & Tablet (iframe) */}
            <iframe 
              key={activeDoc.url}
              src={`${activeDoc.url}#toolbar=0`} 
              className="hidden md:block w-full h-full absolute inset-0"
              title={activeDoc.title}
            />

            {/* 2. Tampilan Mobile / Safari (Fallback UI) */}
            <div className="md:hidden flex flex-col items-center justify-center p-8 text-center h-full">
              <FileText size={48} className="text-sunlight-orange mb-4 opacity-50" />
              <h3 className="font-bold text-lg mb-2">Pratinjau Dokumen</h3>
              <p className="text-silver-shine text-sm mb-6">Perangkat mobile atau browser ini tidak mendukung pratinjau PDF langsung.</p>
              <a 
                href={activeDoc.url} 
                target="_blank" 
                rel="noreferrer"
                className="bg-sunlight-orange text-blue-marine font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition-colors"
              >
                Buka / Unduh {activeDoc.title}
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}