"use client";

import { useState, useEffect } from "react";
import { Timer, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CountdownTimer({ startedAt, teamId }: { startedAt: Date | string | null, teamId: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isInitializing, setIsInitializing] = useState(!startedAt);
  const router = useRouter();

  useEffect(() => {
    // JIKA PERTAMA KALI MASUK PORTAL (startedAt masih null)
    if (!startedAt) {
      const initTimer = async () => {
        try {
          await fetch("/api/payment/retry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teamId })
          });
          router.refresh(); 
        } catch (error) {
          console.error("Gagal memulai timer", error);
        }
      };
      initTimer();
      return;
    }

    setIsInitializing(false);

    // Batas waktu: 3 Jam setelah masuk portal
    const targetTime = new Date(startedAt).getTime() + 3 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      // JIKA WAKTU HABIS
      if (distance < 0) {
        setTimeLeft("00:00:00");
        clearInterval(timer);
        router.refresh(); 
        return;
      }

      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${h.toString().padStart(2, '0')} Jam ${m.toString().padStart(2, '0')} Menit ${s.toString().padStart(2, '0')} Detik`);
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, teamId, router]);

  if (isInitializing) {
    return (
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 text-silver-shine px-5 py-3 rounded-xl font-bold text-sm sm:text-base mb-8">
        <Loader2 size={24} className="animate-spin" />
        <span>Menyiapkan waktu pembayaran...</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl font-bold text-sm sm:text-base mb-8 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse">
      <Timer size={24} />
      <span>Sisa Waktu Pembayaran: {timeLeft}</span>
    </div>
  );
}