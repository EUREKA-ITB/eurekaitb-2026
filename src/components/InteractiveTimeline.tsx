import React from 'react';

// Data dummy jadwal acara
const timelineEvents = [
  {
    id: 1,
    fase: "Fase 1",
    date: "10 Agustus 2026",
    title: "Pendaftaran Buka",
    description: "Pembukaan pendaftaran gelombang pertama peserta EUREKA! ITB 2026.",
  },
  {
    id: 2,
    fase: "Fase 2",
    date: "25 Agustus 2026",
    title: "Babak Penyisihan",
    description: "Penyisihan tahap awal yang dilaksanakan secara daring.",
  },
  {
    id: 3,
    fase: "Fase 3",
    date: "15 September 2026",
    title: "Grand Final & Exhibition",
    description: "Puncak acara EUREKA! ITB 2026 dan pengumuman pemenang.",
  },
];

export default function InteractiveTimeline() {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      {/* Alur Garis Timeline */}
      <div className="relative border-l-2 border-sunlight-orange/50 ml-4 md:ml-32 space-y-8">
        {timelineEvents.map((event) => (
          <div key={event.id} className="relative pl-6 md:pl-8 group">
            {/* Titik Penanda (Dot) */}
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-sunlight-orange border-4 border-blue-marine group-hover:scale-125 transition-transform duration-200" />

            {/* Tanggal */}
            <span className="text-sm font-semibold text-sunlight-orange block mb-1">
              {event.date}
            </span>

            {/* Kartu Konten (Transparan sesuai tema) */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-sm hover:bg-white/10 hover:border-sunlight-orange/50 hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-xl font-display font-bold text-white mb-2">
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