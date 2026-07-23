import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Sparkles, Trophy } from "lucide-react";

const competitionCards = [
  { title: "Physics Olympiad", tagline: "Individu - SMA/Sederajat", description: "Babak kompetisi untuk peserta tunggal yang ingin menantang logika, konsep fisika, dan pemecahan masalah tingkat lanjut.", href: "/competition/physics_olympiad" },
  { title: "Science Project", tagline: "Tim - SMA/Sederajat", description: "Format tim untuk presentasi proyek sains yang aplikatif, kreatif, dan relevan dengan isu nyata di sekitar peserta.", href: "/competition/science_project" },
  { title: "Industrial Case", tagline: "Tim - Mahasiswa S1", description: "Cabang berbasis studi kasus industri dengan pendekatan analitis, strategis, dan presentasi solusi yang terstruktur.", href: "/competition/industrial_case" },
];

const timelineItems = [
  { date: "Nov 2025", title: "Launch & Registration", desc: "Pendaftaran dibuka dan guidebook mulai diumumkan." },
  { date: "Feb 2026", title: "Screening & Admin Check", desc: "Verifikasi biodata, administrasi, dan kelengkapan dokumen." },
  { date: "Mar 2026", title: "Preliminary Round", desc: "Babak awal kompetisi dilaksanakan sesuai cabang masing-masing." },
  { date: "Apr 2026", title: "Announcement Stage", desc: "Pengumuman hasil, daftar lolos, dan arahan tahap selanjutnya." },
];

const faqPreview = [
  { q: "Apa saja cabang lombanya?", a: "Physics Olympiad untuk individu SMA, Science Project untuk tim SMA, dan Industrial Case untuk tim mahasiswa S1." },
  { q: "Kapan pendaftaran ditutup?", a: "Ikuti timeline resmi di halaman utama dan setiap halaman kompetisi. Status terbaru akan selalu ditampilkan di portal ini." },
  { q: "Di mana guidebook dan update diumumkan?", a: "Guidebook dan pengumuman utama bisa diakses dari halaman kompetisi, halaman side event, dan FAQ umum." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden text-white selection:bg-sunlight-orange selection:text-blue-marine">
      
      {/* 1. HERO SECTION - Clean, Center-aligned, No bulky cards */}
      <section className="relative isolate pt-32 pb-24 px-4 sm:px-6 flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,184,0,0.15),_transparent_40%),linear-gradient(180deg,_rgba(5,10,31,0.1),_rgba(5,10,31,0.8))]"></div>
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-silver-shine shadow-[0_0_15px_rgba(255,184,0,0.1)]">
            EUREKA! ITB 2026
          </div>
          <h1 className="mt-8 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            Exploring Physics, <span className="text-sunlight-orange relative whitespace-nowrap">Racing Ideas<svg className="absolute -bottom-2 left-0 w-full text-sunlight-orange/40" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="transparent"/></svg></span>,<br className="hidden sm:block" /> and Building Impact.
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg leading-8 text-silver-shine">
            Platform EUREKA ITB 2026 dirancang layaknya festival kompetisi modern: akses informasi cepat, jalur pendaftaran yang terintegrasi, dan direktori panduan yang terpusat.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/#lomba" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-sunlight-orange px-8 py-3.5 text-sm font-bold text-blue-marine transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,184,0,0.3)]">
              Lihat Kompetisi <ArrowRight size={16} />
            </Link>
            <Link href="/faq" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
              FAQ Umum
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TIMELINE SECTION - Horizontal connected line layout (MCF Style) */}
      <section id="timeline" className="px-4 sm:px-6 py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center rounded-full bg-sunlight-orange/10 p-3 mb-4">
              <CalendarDays className="text-sunlight-orange" size={24} />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Timeline Kegiatan</h2>
            <p className="mt-3 text-silver-shine text-sm">Alur waktu pelaksanaan EUREKA ITB 2026</p>
          </div>
        </div>
      </section>

      {/* 3. COMPETITIONS SECTION - Sleek glassmorphism grid */}
      <section id="lomba" className="px-4 sm:px-6 py-20 relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.03),_transparent_40%)]"></div>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Cabang Kompetisi</h2>
            <p className="mt-3 text-silver-shine text-sm">Pilih cabang yang sesuai dengan minat dan kualifikasi tim kamu.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {competitionCards.map((card) => (
              <Link key={card.title} href={card.href} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-sunlight-orange/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sunlight-orange/5 rounded-full blur-3xl group-hover:bg-sunlight-orange/10 transition-colors"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sunlight-orange/10 text-sunlight-orange">
                      <Trophy size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sunlight-orange border border-sunlight-orange/20 px-3 py-1 rounded-full bg-sunlight-orange/5">
                      {card.tagline}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">{card.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-silver-shine flex-grow">
                    {card.description}
                  </p>
                  <div className="mt-8 flex items-center text-sm font-bold text-white group-hover:text-sunlight-orange transition-colors">
                    Lihat Panduan & Detail <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SIDE EVENT SECTION - Streamlined Banner Style */}
      <section id="side-event" className="px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto rounded-3xl border border-sunlight-orange/20 bg-gradient-to-r from-sunlight-orange/10 to-transparent p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-sunlight-orange/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="font-display text-3xl font-bold text-white">Side Event & Mini Competition</h2>
            <p className="mt-4 text-sm leading-relaxed text-silver-shine">
              Selain kompetisi utama, ikuti juga rangkaian side event kami. Akses seluruh pendaftaran kegiatan pendukung, webinar, dan kontak resmi dalam satu portal.
            </p>
          </div>
          <div className="relative z-10 w-full md:w-auto flex-shrink-0">
            <Link href="/side-event" className="flex items-center justify-center gap-2 rounded-full bg-white text-blue-marine px-8 py-4 text-sm font-bold transition-transform hover:scale-105 shadow-[0_4px_15px_rgba(255,255,255,0.1)] w-full md:w-auto">
              Buka Halaman Side Event <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. PREVIEW FAQ SECTION - Clean Accordion */}
      <section className="px-4 sm:px-6 py-16 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6 mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold">Pertanyaan Umum</h2>
              <p className="mt-2 text-sm text-silver-shine">FAQ yang paling sering ditanyakan oleh peserta.</p>
            </div>
            <Link href="/faq" className="inline-flex items-center gap-2 text-sm font-bold text-sunlight-orange hover:underline whitespace-nowrap">
              Lihat semua FAQ <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {faqPreview.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:bg-white/5 open:bg-white/5 cursor-pointer">
                <summary className="list-none font-bold text-white flex justify-between items-center outline-none">
                  <span className="pr-4">{item.q}</span>
                  <ChevronRight size={16} className="text-sunlight-orange transition-transform group-open:rotate-90 flex-shrink-0" />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-silver-shine border-t border-white/10 pt-4">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}