"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function RetryPaymentButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });

      if (res.ok) {
        router.refresh(); 
      } else {
        alert("Gagal mereset waktu. Silakan coba lagi.");
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRetry} 
      disabled={loading}
      className="inline-flex items-center gap-2 bg-sunlight-orange text-blue-marine font-bold py-3 px-6 rounded-xl hover:bg-yellow-400 transition-colors text-sm shadow-lg disabled:opacity-50"
    >
      <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
      {loading ? "Memproses Ulang..." : "Coba Bayar Lagi"}
    </button>
  );
}