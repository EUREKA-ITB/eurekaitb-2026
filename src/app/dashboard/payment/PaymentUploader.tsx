"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, CheckCircle2, CheckSquare } from "lucide-react";

interface CloudinaryResult {
  info?: string | { secure_url?: string };
}

export default function PaymentUploader({ 
  teamId, 
  initialUrl,
  compeType
}: { 
  teamId: string; 
  initialUrl: string | null;
  compeType: string;
}) {
  const router = useRouter();
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPO = compeType === "physics-olympiad";
  const PO_DEADLINE = new Date("2026-10-05T12:00:00+07:00");
  const SPC_ICC_DEADLINE = new Date("2026-10-25T23:59:59+07:00");
  const PAYMENT_DEADLINE = isPO ? PO_DEADLINE : SPC_ICC_DEADLINE;

  const handleUploadSuccess = (res: CloudinaryResult) => {
    if (typeof res.info === "object" && res.info?.secure_url) {
      setUploadedUrl(res.info.secure_url);
    }
  };

  const handleSubmit = async () => {
    const now = new Date();
    
    if (now > PAYMENT_DEADLINE) {
      const deadlineText = isPO ? "5 Oktober 2026, 12:00 WIB" : "25 Oktober 2026, 23:59 WIB";
      alert(`Batas waktu pengiriman bukti pembayaran telah habis (${deadlineText})!`);
      return;
    }

    if (!uploadedUrl) {
      alert("Silakan unggah bukti pembayaran terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, paymentUrl: uploadedUrl }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Gagal mengirim bukti pembayaran. Silakan coba lagi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <CldUploadWidget 
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} 
        options={{ maxFiles: 1, clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "pdf"], resourceType: "auto" }}
        onSuccess={handleUploadSuccess}
      >
        {({ open }) => (
          <div 
            onClick={() => open()} 
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
              uploadedUrl 
                ? "border-green-500/50 bg-green-500/5 hover:bg-green-500/10" 
                : "border-white/20 bg-black/20 hover:bg-white/5"
            }`}
          >
            {uploadedUrl ? (
              <>
                <CheckCircle2 size={40} className="mx-auto mb-3 text-green-400" />
                <p className="font-bold text-green-400 mb-1 text-sm">Bukti Transfer Berhasil Diunggah!</p>
                <p className="text-xs text-silver-shine">Klik lagi jika ingin mengganti gambar</p>
              </>
            ) : (
              <>
                <UploadCloud size={40} className="mx-auto mb-3 text-sunlight-orange" />
                <p className="font-bold text-white mb-1 text-sm">Unggah Bukti Transfer</p>
                <p className="text-xs text-silver-shine">Format: JPG, PNG, atau PDF (Maks 5MB)</p>
              </>
            )}
          </div>
        )}
      </CldUploadWidget>

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting || !uploadedUrl}
        className={`flex items-center justify-center gap-2 w-full font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg ${
          !uploadedUrl || isSubmitting
            ? "bg-white/10 text-white/40 cursor-not-allowed"
            : "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"
        }`}
      >
        <CheckSquare size={18} />
        {isSubmitting ? "Memproses..." : "Kirim Bukti Pembayaran"}
      </button>
    </div>
  );
}