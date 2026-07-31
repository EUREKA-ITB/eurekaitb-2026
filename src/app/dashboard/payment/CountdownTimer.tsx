"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

export default function CountdownTimer({ registeredAt }: { registeredAt: Date | string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Batas waktu: 24 Jam after tanggal pendaftaran
    const targetTime = new Date(registeredAt).getTime() + 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        setTimeLeft("00:00:00");
        clearInterval(timer);
        return;
      }

      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${h.toString().padStart(2, '0')} Jam ${m.toString().padStart(2, '0')} Menit ${s.toString().padStart(2, '0')} Detik`);
    }, 1000);

    return () => clearInterval(timer);
  }, [registeredAt]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl font-bold text-sm sm:text-base mb-8 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse">
      <Timer size={24} />
      <span>Sisa Waktu Pembayaran: {timeLeft}</span>
    </div>
  );
}