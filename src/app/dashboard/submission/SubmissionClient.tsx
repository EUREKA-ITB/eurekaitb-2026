"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, CheckCircle2, FileText, CheckSquare, AlertCircle } from "lucide-react";

interface CloudinaryResult {
  info?: string | { secure_url?: string };
}

export default function SubmissionClient({ 
  teamId, 
  compeType, 
  initialUrl 
}: { 
  teamId: string;
  compeType: string;
  initialUrl: string | null;
}) {
  const router = useRouter();
  const [paperUrl, setPaperUrl] = useState<string | null>(initialUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(!!initialUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const SPC_DEADLINE = new Date("2026-10-23T23:59:59+07:00");
  const ICC_DEADLINE = new Date("2026-11-07T23:59:59+07:00");
  const SUBMISSION_DEADLINE = compeType === "science-project" ? SPC_DEADLINE : ICC_DEADLINE;
  const isLocked = new Date() > SUBMISSION_DEADLINE;

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!paperUrl) {
      setErrorMessage("Harap unggah dokumen PDF terlebih dahulu sebelum submit!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, paperUrl }),
      });

      if (response.ok) {
        setIsSuccess(true);
        router.refresh();
      } else {
        const errorData = await response.json();
        setErrorMessage(`GAGAL SUBMIT: ${errorData.error}`);
      }
    } catch (error) {
      setErrorMessage("GAGAL JARINGAN: Terjadi kesalahan koneksi atau server down.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 p-4 sm:p-6 rounded-2xl text-red-400 font-bold max-w-2xl mx-auto text-sm sm:text-base w-full">
        Batas waktu pengumpulan dokumen telah berakhir!
      </div>
    );
  }

  if (isSuccess && paperUrl === initialUrl) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 p-6 sm:p-8 rounded-2xl text-center max-w-2xl mx-auto w-full">
        <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4 sm:w-16 sm:h-16" />
        <h3 className="text-lg sm:text-xl font-bold text-green-400 mb-2">Submission Tersimpan!</h3>
        <p className="text-xs sm:text-sm text-silver-shine mb-6">Dokumen tim Anda telah terarsip di sistem kami.</p>
        
        <a href={initialUrl!} target="_blank" rel="noreferrer" className="inline-block bg-white/10 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold mb-4 hover:bg-white/20 transition">
          Lihat Dokumen Terkirim ↗
        </a>

        <div className="mt-4 pt-4 border-t border-green-500/20">
          <p className="text-xs text-silver-shine mb-3">Ingin merevisi dokumen sebelum deadline ditutup?</p>
          <button 
            onClick={() => { setIsSuccess(false); setPaperUrl(null); }}
            className="text-xs bg-yellow-500/20 text-yellow-500 px-4 py-2.5 rounded-lg hover:bg-yellow-500/30 transition font-bold w-full sm:w-auto"
          >
            Upload Ulang Dokumen Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 text-left max-w-2xl mx-auto w-full">
      <div className="bg-black/30 border border-white/10 p-5 sm:p-8 rounded-2xl w-full">
        <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
          <FileText size={18} className="text-sunlight-orange shrink-0"/> 
          {compeType === "industrial-case" ? "Full Report (PDF)" : "Full Paper (PDF)"}
        </h3>
        <p className="text-xs text-silver-shine mb-6">Unggah dokumen lengkap sesuai panduan Guidebook.</p>
        
        <CldUploadWidget 
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} 
          options={{ maxFiles: 1, clientAllowedFormats: ["pdf"], resourceType: "auto" }}
          onSuccess={(res: CloudinaryResult) => {
            if (typeof res.info === "object" && res.info?.secure_url) {
              setPaperUrl(res.info.secure_url);
              setErrorMessage(null); // Menghilangkan error jika upload berhasil
            }
          }}
        >
          {({ open }) => (
            <div onClick={() => open()} className={`cursor-pointer border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-colors ${paperUrl ? "border-green-500/50 bg-green-500/5" : "border-white/20 bg-white/5 hover:bg-white/10"}`}>
              {paperUrl ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 size={32} className="text-green-400"/>
                  <span className="text-green-400 text-sm font-bold">Dokumen Siap Dikirim</span>
                  <span className="text-xs text-silver-shine font-normal">Klik area ini jika ingin mengganti file PDF</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <UploadCloud size={32} className="text-white"/>
                  <span className="text-white text-sm font-bold">Pilih File PDF</span>
                  <span className="text-xs text-silver-shine font-normal">Maksimal 5MB</span>
                </div>
              )}
            </div>
          )}
        </CldUploadWidget>
      </div>

      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-100 font-semibold">{errorMessage}</p>
        </div>
      )}

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting || !paperUrl}
        className={`flex items-center justify-center gap-2 w-full font-bold py-3.5 sm:py-4 rounded-xl text-sm transition-all shadow-lg ${
          !paperUrl || isSubmitting
            ? "bg-white/10 text-white/40 cursor-not-allowed"
            : "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"
        }`}
      >
        <CheckSquare size={18} />
        {isSubmitting ? "Menyimpan ke Database..." : "Kirim Dokumen"}
      </button>
    </div>
  );
}