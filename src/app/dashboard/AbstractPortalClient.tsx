"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, CheckCircle2, Lock, FileText, CheckSquare, AlertCircle } from "lucide-react";

interface CloudinaryResult {
  info?: string | { secure_url?: string };
}

export default function AbstractPortalClient({
  currentUrl,
  compeType,
  currentCase,
  abstractStatus
}: {
  currentUrl: string | null;
  compeType: string;
  currentCase: string | null;
  abstractStatus: string;
}) {
  const router = useRouter();
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(!!currentUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ABSTRACT_DEADLINE = new Date("2026-10-25T23:59:59+07:00");
  const now = new Date();
  
  const isTimePassed = now > ABSTRACT_DEADLINE;
  const isICC = compeType === "industrial-case";
  const isSPC = compeType === "science-project";
  
  let isLocked = isTimePassed || abstractStatus === "passed" || abstractStatus === "review";
  if (isICC && abstractStatus === "failed") {
    isLocked = true; 
  }

  let lockMessage = "Data Dikunci";
  if (abstractStatus === "review") lockMessage = "Data Dikunci (Sedang Direview Admin)";
  else if (abstractStatus === "passed") lockMessage = "Data Dikunci (Lolos Seleksi)";
  else if (abstractStatus === "failed" && isICC) lockMessage = "Data Dikunci (Gagal Seleksi - Tidak Ada Revisi)";
  else if (abstractStatus === "failed" && isSPC) lockMessage = "Data Dikunci (Tidak Lolos)";
  else if (isTimePassed) lockMessage = "Data Dikunci (Batas Waktu Habis)";

  const handleUploadSuccess = (res: CloudinaryResult) => {
    if (typeof res.info === "object" && res.info?.secure_url) {
      setUploadedUrl(res.info.secure_url);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (isLocked) {
      setErrorMessage("Batas waktu pengumpulan atau data sudah dikunci!");
      return;
    }

    if (!uploadedUrl) {
      setErrorMessage("Silakan unggah dokumen PDF terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/teams/abstract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstractUrl: uploadedUrl }),
      });

      if (response.ok) {
        setIsSuccess(true);
        router.refresh();
      } else {
        const err = await response.json();
        setErrorMessage(`Gagal menyimpan: ${err.error}`);
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tampilan Jika Data Dikunci
  if (isLocked) {
    return (
      <div className="text-center w-full bg-black/20 border border-white/10 p-6 sm:p-8 rounded-3xl">
        <Lock size={48} className="text-white/20 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-white mb-2">Abstract Submission Portal</h3>
        <p className="text-sm text-silver-shine mb-6">
          Portal pengumpulan abstrak telah ditutup atau sedang dalam proses seleksi.
        </p>
        <div className="w-full text-center border border-white/20 bg-black/40 text-silver-shine font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-not-allowed">
          <Lock size={16}/> {lockMessage}
        </div>
        {currentUrl && (
          <a href={currentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors">
            <FileText size={16}/> Lihat Dokumen Terkirim
          </a>
        )}
      </div>
    );
  }

  // Tampilan Jika Berhasil Disubmit (Bisa Direvisi)
  if (isSuccess && uploadedUrl) {
    return (
      <div className="text-center w-full">
        <div className="bg-blue-marine/55 border border-green-500/30 p-6 sm:p-8 rounded-3xl shadow-[0_0_30px_rgba(34,197,94,0.15)] relative overflow-hidden w-full">
          <div className="relative z-10 w-full">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/40">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-green-400 mb-2">Abstrak Terkirim!</h3>
            <p className="text-sm text-silver-shine mb-6 max-w-md mx-auto">
              Dokumen abstrak tim Anda berhasil disimpan dan berstatus <span className="text-white font-bold">Waiting for Review</span>.
            </p>
            
            <a href={uploadedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl text-sm font-bold mb-6 hover:bg-white/20 transition-all shadow-lg">
              <FileText size={18} /> Lihat Dokumen PDF
            </a>

            <div className="mt-2 pt-6 border-t border-white/10">
              <p className="text-xs text-silver-shine mb-3">
                Dokumen dapat direvisi sebelum batas waktu (25 Oktober 2026).
              </p>
              <button 
                onClick={() => { setIsSuccess(false); setUploadedUrl(null); }}
                className="inline-flex items-center justify-center gap-2 text-xs bg-yellow-500/20 text-yellow-500 px-5 py-2.5 rounded-xl hover:bg-yellow-500/30 transition-all font-bold border border-yellow-500/30"
              >
                <UploadCloud size={14} /> Revisi Dokumen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center w-full">
      <UploadCloud size={48} className="text-sunlight-orange mx-auto mb-4" />
      <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">Abstract Submission Portal</h3>
      <p className="text-sm text-silver-shine mb-2">
        Upload your team`s initial abstract document to participate in the administrative selection process.
      </p>
      
      {isSPC && (
         <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-xl mb-6 text-xs text-blue-200">
           <span className="font-bold text-blue-400">INFO SPC:</span> Sesuai format sistem, harap <span className="font-bold text-white underline">gabungkan</span> Lembar Pernyataan Orisinalitas ke dalam halaman terakhir dokumen Abstrak Anda (menjadi 1 file PDF).
         </div>
      )}
      {!isSPC && <div className="mb-6"></div>}

      <CldUploadWidget 
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PDF_PRESET} 
        options={{ maxFiles: 1, clientAllowedFormats: ["pdf"], resourceType: "auto" }}
        onSuccess={handleUploadSuccess}
      >
        {({ open }) => (
          <div 
            onClick={() => open()} 
            className={`cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-colors mb-6 ${
              uploadedUrl ? "border-green-500/50 bg-green-500/10 hover:bg-green-500/20" : "border-white/20 bg-black/30 hover:bg-white/10"
            }`}
          >
            {uploadedUrl ? (
              <>
                <CheckCircle2 size={40} className="mx-auto mb-3 text-green-400" />
                <p className="font-bold text-green-400 mb-1 text-base">File PDF Siap Dikirim!</p>
                <p className="text-xs text-silver-shine">Klik area ini jika ingin mengganti file</p>
              </>
            ) : (
              <>
                <FileText size={40} className="mx-auto mb-3 text-white" />
                <p className="font-bold text-white mb-1 text-base">Pilih File PDF</p>
                <p className="text-xs text-silver-shine">Ukuran maksimal 5MB</p>
              </>
            )}
          </div>
        )}
      </CldUploadWidget>

      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 mb-6 text-left">
          <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-100 font-semibold">{errorMessage}</p>
        </div>
      )}

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting || !uploadedUrl}
        className={`flex items-center justify-center gap-2 w-full font-bold py-4 rounded-xl text-sm transition-all shadow-xl ${
          !uploadedUrl || isSubmitting
            ? "bg-white/10 text-white/40 cursor-not-allowed"
            : "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"
        }`}
      >
        <CheckSquare size={18} />
        {isSubmitting ? "Menyimpan ke Database..." : "Kirim Dokumen Abstrak"}
      </button>
    </div>
  );
}