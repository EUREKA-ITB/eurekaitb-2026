import React from "react";

const timelineEvents = [
  {
    id: 1,
    date: "10 Agustus 2026",
    title: "Pendaftaran Buka",
    description:
      "Pembukaan pendaftaran gelombang pertama peserta EUREKA! ITB 2026.",
  },
  {
    id: 2,
    date: "25 Agustus 2026",
    title: "Babak Penyisihan",
    description: "Penyisihan tahap awal yang dilaksanakan secara daring.",
  },
  {
    id: 3,
    date: "15 September 2026",
    title: "Grand Final & Exhibition",
    description: "Puncak acara EUREKA! ITB 2026 dan pengumuman pemenang.",
  },
   {
    id: 3,
    date: "15 September 2026",
    title: "Grand Final & Exhibition",
    description: "Puncak acara EUREKA! ITB 2026 dan pengumuman pemenang.",
  },
   {
    id: 3,
    date: "15 September 2026",
    title: "Grand Final & Exhibition",
    description: "Puncak acara EUREKA! ITB 2026 dan pengumuman pemenang.",
  },
   {
    id: 3,
    date: "15 September 2026",
    title: "Grand Final & Exhibition",
    description: "Puncak acara EUREKA! ITB 2026 dan pengumuman pemenang.",
  },
];

export default function InteractiveTimeline() {
  return (
    <div className="w-full pt-8 pb-4">
      {/* Scrollbar disembunyikan menggunakan kelas hide-scrollbar &[&::-webkit-scrollbar]:hidden [scrollbar-width:none] */}
      <div className="flex flex-row gap-6 overflow-x-auto pt-6 pb-6 px-4 hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {timelineEvents.map((event) => (
          <div
            key={event.id}
            className="min-w-[280px] md:min-w-[320px] flex-1 shrink-0 flex flex-col"
          >
            {/* Tanggal & Titik Penanda */}
            <div className="relative flex items-center mb-4">
              {/* Garis Horizontal Menyambung */}
              <div className="absolute left-0 right-0 h-[2px] bg-sunlight-orange/40" />

              {/* Titik Penanda (Dot) Oranye/Kuning */}
              <div className="relative z-10 w-4 h-4 rounded-full bg-sunlight-orange border-2 border-blue-marine shrink-0" />

              {/* Tanggal di Samping Titik */}
              <span className="relative z-10 ml-3 text-xs md:text-sm font-semibold text-sunlight-orange bg-blue-marine px-2 py-0.5 rounded">
                {event.date}
              </span>
            </div>

            {/* Kartu Konten */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:border-sunlight-orange/50 hover:bg-white/10 transition-all duration-300 flex-1 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                {event.title}
              </h3>
              <p className="text-silver-shine text-sm leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}