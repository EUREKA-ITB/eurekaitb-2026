"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, CheckCircle2 } from "lucide-react";

interface CloudinaryResult {
  info?: string | { secure_url?: string; };
}

export default function AbstractPortalClient({ currentUrl }: { currentUrl: string | null }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUploadSuccess = async (res: CloudinaryResult) => {
    if (typeof res.info === "object" && res.info?.secure_url) {
      setIsUpdating(true);
      try {
        const response = await fetch("/api/teams/abstract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ abstractUrl: res.info.secure_url }),
        });
        if (response.ok) {
          router.refresh(); 
        } else {
          alert("Gagal menyimpan dokumen ke database.");
        }
      } catch (error) {
        alert("Terjadi kesalahan jaringan.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="bg-black/30 border border-dashed border-white/20 rounded-2xl p-6 text-center w-full">
      <UploadCloud size={40} className={`mx-auto mb-4 ${currentUrl ? "text-green-400" : "text-sunlight-orange"}`} />
      
      <p className="text-white font-bold mb-2">Portal Submisi Abstrak</p>
      <p className="text-xs text-silver-shine mb-6 max-w-sm mx-auto">
        {currentUrl 
          ? "Dokumen abstrak Anda telah tersimpan. Anda dapat mengubahnya selama masa seleksi belum berakhir." 
          : "Unggah dokumen abstrak awal tim Anda untuk mengikuti proses seleksi administrasi."}
      </p>

      {isUpdating ? (
        <div className="text-sm font-bold text-silver-shine animate-pulse">Menyimpan dokumen...</div>
      ) : (
        <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} onSuccess={handleUploadSuccess}>
          {({ open }) => (
            <button 
              type="button" 
              onClick={() => open()} 
              className={`font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg inline-flex items-center gap-2 ${
                currentUrl 
                  ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" 
                  : "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"
              }`}
            >
              {currentUrl ? <><CheckCircle2 size={16}/> Ubah File Abstrak</> : "Unggah Dokumen Sekarang"}
            </button>
          )}
        </CldUploadWidget>
      )}
      
      {currentUrl && (
        <div className="mt-4 text-[10px] text-silver-shine italic">
          *Mengunggah ulang akan menimpa file abstrak sebelumnya.
        </div>
      )}
    </div>
  );
}