"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, CheckCircle, ShieldCheck } from "lucide-react";

interface CloudinaryResult {
  info?: string | { secure_url?: string; };
}

export default function PaymentUploader({ teamId, initialUrl }: { teamId: string, initialUrl: string | null }) {
  const router = useRouter();
  const [paymentUrl, setPaymentUrl] = useState<string>(initialUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!paymentUrl) return alert("Harap unggah bukti transfer terlebih dahulu!");
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, paymentUrl }),
      });
      
      if (res.ok) {
        alert("Bukti transfer berhasil dikirim! Silakan tunggu verifikasi admin.");
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Gagal menyimpan bukti transfer.");
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      
      <div className="mb-6">
        <CldUploadWidget 
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} 
          onSuccess={(res: CloudinaryResult) => { 
            if(typeof res.info === "object" && res.info?.secure_url) {
              setPaymentUrl(res.info.secure_url);
            }
          }}
        >
          {({ open }) => (
            <div 
              onClick={() => open()}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer group ${
                paymentUrl 
                ? "border-green-400/50 bg-green-400/10 hover:bg-green-400/20" 
                : "border-white/20 bg-black/20 hover:bg-white/5 hover:border-sunlight-orange/50"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                {paymentUrl ? (
                  <>
                    <CheckCircle className="text-green-400 mb-3" size={40} />
                    <span className="text-sm text-green-400 font-bold mb-1">Bukti Transfer Berhasil Diunggah!</span>
                    <span className="text-xs text-silver-shine">Klik lagi jika ingin mengganti gambar</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="text-silver-shine group-hover:text-sunlight-orange mb-3 transition-colors" size={40} />
                    <span className="text-sm text-white font-bold mb-1">Upload Struk Mutasi / Screenshot M-Banking</span>
                    <span className="text-xs text-silver-shine">Format: JPG, PNG, (Maks 2MB)</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CldUploadWidget>
      </div>

      {/* Tombol Pintar: Baru bisa diklik kalau paymentUrl sudah terisi */}
      <button 
        onClick={handleSave}
        disabled={!paymentUrl || isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-sunlight-orange text-blue-marine font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShieldCheck size={20} />
        {isSubmitting ? "Mengamankan Data..." : "Kirim Bukti Pembayaran"}
      </button>

    </div>
  );
}