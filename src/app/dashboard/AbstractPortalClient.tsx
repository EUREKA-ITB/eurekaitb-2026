"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, CheckCircle2, Lock, FileText, Download } from "lucide-react";

interface CloudinaryResult {
  info?: string | { secure_url?: string; };
}

const REVEAL_DATE = new Date("2026-10-05T00:00:00+07:00").getTime();

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
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number, s: number} | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(compeType !== "industrial-case");

  const isLocked = abstractStatus === "waiting" || abstractStatus === "passed";

  useEffect(() => {
    if (compeType !== "industrial-case") return;

    const checkReveal = () => {
      const now = new Date().getTime();
      const distance = REVEAL_DATE - now;
      if (distance <= 0) {
        setIsRevealed(true);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      } else {
        setIsRevealed(false);
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    checkReveal();
    const timer = setInterval(checkReveal, 1000);
    return () => clearInterval(timer);
  }, [compeType]);

  const handleUploadSuccess = async (res: CloudinaryResult) => {
    if (typeof res.info === "object" && res.info?.secure_url) {
      setIsUpdating(true);
      try {
        const response = await fetch("/api/teams/abstract", {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            abstractUrl: res.info.secure_url,
            caseChoice: null // Dropdown dihapus, data ini dikosongkan karena semua peserta ICC pakai 1 PDF Case yang sama
          }),
        });
        if (response.ok) {
          router.refresh(); 
        } else {
          alert("Failed to save the document to the database.");
        }
      } catch (error) {
        alert("A network error occurred.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Tampilan ketika hitung mundur belum selesai (Khusus ICC)
  if (compeType === "industrial-case" && !isRevealed) {
    return (
      <div className="bg-black/30 border border-dashed border-white/20 rounded-2xl p-6 text-center w-full">
        <Lock size={40} className="mx-auto mb-4 text-silver-shine opacity-50" />
        <p className="text-white font-bold mb-2 text-xl">Case Reveal Not Yet Open</p>
        <p className="text-xs text-silver-shine mb-6 max-w-sm mx-auto">
          The industrial case will be announced simultaneously on October 5, 2026.
        </p>
        {timeLeft && (
          <div className="flex justify-center gap-4 text-sunlight-orange font-mono font-bold text-2xl">
            <div className="flex flex-col"><span className="bg-white/5 px-3 py-2 rounded-lg border border-white/10">{timeLeft.d}</span><span className="text-[10px] text-silver-shine mt-1 font-sans">Days</span></div>
            <div className="flex flex-col"><span className="bg-white/5 px-3 py-2 rounded-lg border border-white/10">{timeLeft.h}</span><span className="text-[10px] text-silver-shine mt-1 font-sans">Hours</span></div>
            <div className="flex flex-col"><span className="bg-white/5 px-3 py-2 rounded-lg border border-white/10">{timeLeft.m}</span><span className="text-[10px] text-silver-shine mt-1 font-sans">Minutes</span></div>
            <div className="flex flex-col"><span className="bg-white/5 px-3 py-2 rounded-lg border border-white/10">{timeLeft.s}</span><span className="text-[10px] text-silver-shine mt-1 font-sans">Seconds</span></div>
          </div>
        )}
      </div>
    );
  }

  // Tampilan Utama (Setelah Reveal ICC, atau Default untuk SPC)
  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* KOTAK DOWNLOAD PDF CASE REVEAL (Hanya muncul untuk ICC setelah waktu habis) */}
      {compeType === "industrial-case" && isRevealed && (
        <div className="bg-gradient-to-r from-blue-900/40 to-black/40 border border-sunlight-orange/40 rounded-2xl p-5 w-full flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(255,184,0,0.1)]">
          <div className="flex items-center gap-4 text-left">
            <div className="bg-sunlight-orange/20 p-3 rounded-xl text-sunlight-orange shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-sunlight-orange uppercase tracking-widest mb-1">Status: Revealed</p>
              <h4 className="text-white font-bold text-sm">Industrial Case Study PDF</h4>
              <p className="text-xs text-silver-shine mt-1">Download and analyze the case to prepare your abstract.</p>
            </div>
          </div>
          <a 
            href="/icc/reveal-case.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-sunlight-orange hover:bg-yellow-400 text-blue-marine font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 w-full sm:w-auto justify-center"
          >
            <Download size={16} /> Download Case
          </a>
        </div>
      )}

      {/* PORTAL UPLOAD ABSTRAK */}
      <div className="bg-black/30 border border-dashed border-white/20 rounded-2xl p-6 text-center w-full">
        <UploadCloud size={40} className={`mx-auto mb-4 ${currentUrl ? "text-green-400" : "text-sunlight-orange"}`} />
        
        <p className="text-white font-bold mb-2">Abstract Submission Portal</p>
        <p className="text-xs text-silver-shine mb-6 max-w-sm mx-auto">
          {currentUrl 
            ? "Your abstract document has been saved. You can update it as long as the selection period has not ended." 
            : "Upload your team's initial abstract document to participate in the administrative selection process."}
        </p>

        {isLocked ? (
          <div className="mt-4 p-4 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-silver-shine text-sm font-bold shadow-inner">
            <Lock size={16} /> Data Dikunci ({abstractStatus === "passed" ? "Lolos Seleksi" : "Sedang Direview"})
          </div>
        ) : isUpdating ? (
          <div className="text-sm font-bold text-silver-shine animate-pulse">Saving document...</div>
        ) : (
          <CldUploadWidget 
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} 
            options={{ maxFiles: 1, clientAllowedFormats: ["pdf", "doc", "docx"], resourceType: "raw" }}
            onSuccess={handleUploadSuccess}
          >
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
                {currentUrl ? <><CheckCircle2 size={16}/> Update Abstract File</> : "Upload Document Now"}
              </button>
            )}
          </CldUploadWidget>
        )}
        
        {currentUrl && !isLocked && (
          <div className="mt-4 text-[10px] text-silver-shine italic">
            *Re-uploading will overwrite the previous abstract file.
          </div>
        )}
      </div>
    </div>
  );
}