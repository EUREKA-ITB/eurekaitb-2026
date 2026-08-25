"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function ReferralInput({ teamId }: { teamId: string }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleApply = async () => {
    if (!code) return;
    setStatus("loading");
    
    try {
      const res = await fetch("/api/referral/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase(), teamId }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(`Diskon ${data.discountVal}% berhasil diterapkan! Memuat ulang...`);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setStatus("error");
        setMessage(data.error || "Kode tidak valid.");
      }
    } catch (e) {
      setStatus("error");
      setMessage("Kesalahan jaringan.");
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-6 shadow-lg">
      <p className="text-sm font-bold mb-3 flex items-center gap-2 text-sunlight-orange">
        <Ticket size={18} /> Punya Kode Referral Medpar?
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Contoh: ALPHA-EUREKA5-XXX"
          className="flex-1 bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange uppercase transition-colors"
          disabled={status === "loading" || status === "success"}
        />
        <button 
          onClick={handleApply}
          disabled={!code || status === "loading" || status === "success"}
          className="bg-sunlight-orange text-blue-marine font-bold px-6 py-3 rounded-xl text-sm hover:bg-yellow-400 disabled:opacity-50 transition-all flex justify-center items-center shrink-0"
        >
          {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : "Terapkan"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-3 flex items-center gap-1.5 font-medium"><XCircle size={14}/> {message}</p>
      )}
      {status === "success" && (
        <p className="text-green-400 text-xs mt-3 flex items-center gap-1.5 font-medium"><CheckCircle2 size={14}/> {message}</p>
      )}
    </div>
  );
}