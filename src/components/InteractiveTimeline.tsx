"use client";

import React, { useState, useEffect } from "react";

interface EventItem {
  id: number;
  startDate: string;
  endDate: string;
  dateLabel: string;
  title: string;
  description: string;
}

const timelineEvents: EventItem[] = [
  {
    id: 1,
    startDate: "2026-06-01",
    endDate: "2026-07-15",
    dateLabel: "1 Jun – 15 Jul 2026",
    title: "Sosialisasi & Pre-Event",
    description:
      "Rangkaian webinar dan sosialisasi kompetisi ke seluruh SMA & Perguruan Tinggi.",
  },
  {
    id: 2,
    startDate: "2026-07-16",
    endDate: "2026-08-15",
    dateLabel: "16 Jul – 15 Agt 2026",
    title: "Pendaftaran Buka",
    description:
      "Pembukaan pendaftaran resmi gelombang utama peserta EUREKA! ITB 2026.",
  },
  {
    id: 3,
    startDate: "2026-08-16",
    endDate: "2026-09-05",
    dateLabel: "16 Agt – 5 Sep 2026",
    title: "Babak Penyisihan",
    description:
      "Pengerjaan soal ujian dan pengumpulan abstrak proyek secara daring.",
  },
  {
    id: 4,
    startDate: "2026-09-06",
    endDate: "2026-09-20",
    dateLabel: "6 Sep – 20 Sep 2026",
    title: "Pengumuman Finalis",
    description:
      "Pengumuman tim dan peserta terbaik yang lolos ke tahap Grand Final.",
  },
  {
    id: 5,
    startDate: "2026-10-10",
    endDate: "2026-10-12",
    dateLabel: "10 – 12 Oktober 2026",
    title: "Grand Final & Exhibition",
    description:
      "Presentasi proyek, babak final offline, dan pameran teknologi di Kampus ITB.",
  },
];

// Komponen Hitung Mundur Realtime
function CountdownBadge({
  targetDate,
  isActive,
}: {
  targetDate: Date;
  isActive: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md border ${
        isActive
          ? "text-sunlight-orange bg-sunlight-orange/10 border-sunlight-orange/30"
          : "text-silver-shine bg-white/5 border-white/10"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-sunlight-orange animate-pulse" : "bg-silver-shine"
        }`}
      />
      <span>
        Sisa: {timeLeft.days}h {timeLeft.hours}j {timeLeft.minutes}m{" "}
        {timeLeft.seconds}d
      </span>
    </div>
  );
}

// Komponen Kartu Tilt 3D
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const [transform, setTransform] = useState(
    "perspective(1000px) rotateX(0deg) rotateY(0deg)"
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  };

  const handleMouseLeave = () => {
    setTransform(
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
    );
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: "transform 0.15s ease-out",
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

export default function InteractiveTimeline() {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "upcoming" | "past"
  >("all");
  const today = new Date();

  const filteredEvents = timelineEvents.filter((event) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    end.setHours(23, 59, 59, 999);

    const isPast = today > end;
    const isActive = today >= start && today <= end;
    const isUpcoming = today < start;

    if (activeFilter === "active") return isActive;
    if (activeFilter === "upcoming") return isUpcoming;
    if (activeFilter === "past") return isPast;
    return true;
  });

  return (
    <div className="w-full pt-4 pb-4">
      {/* 1. FILTER BUTTONS */}
      <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
        {[
          { id: "all", label: "Semua Event" },
          { id: "active", label: "🔥 Berlangsung" },
          { id: "upcoming", label: "⏳ Mendatang" },
          { id: "past", label: "✓ Selesai" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 border ${
              activeFilter === tab.id
                ? "bg-sunlight-orange text-blue-marine border-sunlight-orange shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : "bg-white/5 text-silver-shine border-white/10 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. TIMELINE ITEMS */}
      <div className="flex flex-row gap-0 overflow-x-auto pt-4 pb-8 px-4 hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filteredEvents.map((event) => {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          end.setHours(23, 59, 59, 999);

          const isPast = today > end;
          const isActive = today >= start && today <= end;

          const countdownTarget = isActive ? end : start;

          return (
            <div
              key={event.id}
              className={`min-w-[300px] md:min-w-[340px] flex-1 shrink-0 flex flex-col transition-all duration-300 ${
                isPast ? "opacity-50 hover:opacity-90" : "opacity-100"
              }`}
            >
              {/* Header Line & Status */}
              <div className="flex items-center w-full mb-5 h-8">
                <div className="relative flex items-center justify-center shrink-0">
                  {isActive && (
                    <span className="absolute w-7 h-7 rounded-full bg-sunlight-orange/30 animate-ping" />
                  )}
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-blue-marine shrink-0 relative z-10 ${
                      isPast
                        ? "bg-slate-500"
                        : isActive
                        ? "bg-sunlight-orange shadow-[0_0_12px_rgba(245,158,11,0.9)]"
                        : "bg-transparent border-white/70"
                    }`}
                  />
                </div>

                <div
                  className={`w-4 h-[2px] shrink-0 ${
                    isPast
                      ? "bg-white/10"
                      : isActive
                      ? "bg-sunlight-orange"
                      : "bg-white/20"
                  }`}
                />

                <div className="flex items-center gap-2 shrink-0 px-1">
                  <span
                    className={`text-xs md:text-sm font-semibold px-2.5 py-1 rounded-md ${
                      isPast
                        ? "text-silver-shine/70 bg-white/5"
                        : isActive
                        ? "text-sunlight-orange bg-sunlight-orange/15 font-bold border border-sunlight-orange/30"
                        : "text-white bg-white/10"
                    }`}
                  >
                    {event.dateLabel}
                  </span>

                  {isActive && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sunlight-orange bg-sunlight-orange/20 border border-sunlight-orange/40 px-2 py-1 rounded-md">
                      Berlangsung
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                      Selesai
                    </span>
                  )}
                </div>

                <div
                  className={`flex-1 h-[2px] ml-1 ${
                    isPast
                      ? "bg-white/10"
                      : isActive
                      ? "bg-sunlight-orange/60"
                      : "bg-white/20"
                  }`}
                />
              </div>

              {/* KARTU KONTEN DENGAN WARNA SESUAI KONDISI */}
              <TiltCard
                className={`mr-4 p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 flex-1 shadow-lg cursor-pointer ${
                  isPast
                    ? "bg-white/5 border-slate-700/50 hover:border-slate-500"
                    : isActive
                    ? "bg-sunlight-orange/5 border-sunlight-orange shadow-[0_4px_25px_rgba(245,158,11,0.2)] hover:bg-sunlight-orange/10"
                    : "bg-white/5 border-white/20 hover:border-white/50"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`text-xs font-bold ${
                      isPast
                        ? "text-slate-400"
                        : isActive
                        ? "text-sunlight-orange"
                        : "text-silver-shine"
                    }`}
                  >
                    Fase 0{event.id}
                  </span>

                  {!isPast && (
                    <CountdownBadge
                      targetDate={countdownTarget}
                      isActive={isActive}
                    />
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 font-display">
                  {event.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isPast ? "text-slate-400" : "text-silver-shine"
                  }`}
                >
                  {event.description}
                </p>
              </TiltCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}