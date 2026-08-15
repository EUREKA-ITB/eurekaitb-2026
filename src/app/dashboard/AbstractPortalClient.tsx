"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, CheckCircle2, Lock } from "lucide-react";

interface CloudinaryResult {
  info?: string | { secure_url?: string; };
}

// FORMAT COUNTDOWN GLOBAL (Misal: 15 Agustus 2026 Jam 00:00 WIB)
const REVEAL_DATE = new Date("2026-08-14T00:00:00+07:00").getTime();

export default function AbstractPortalClient({ 
  currentUrl, 
  compeType, 
  currentCase 
}: { 
  currentUrl: string | null;
  compeType: string;
  currentCase: string | null;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCase, setSelectedCase] = useState(currentCase || "");
  
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number, s: number} | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(compeType !== "industrial-case");

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
          method: "POST", // PASTIKAN INI POST AGAR MATCH DENGAN BACKEND
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            abstractUrl: res.info.secure_url,
            caseChoice: compeType === "industrial-case" ? selectedCase : null
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

  if (compeType === "industrial-case" && !isRevealed) {
    return (
      <div className="bg-black/30 border border-dashed border-white/20 rounded-2xl p-6 text-center w-full">
        <Lock size={40} className="mx-auto mb-4 text-silver-shine opacity-50" />
        <p className="text-white font-bold mb-2 text-xl">Case Reveal Not Yet Open</p>
        <p className="text-xs text-silver-shine mb-6 max-w-sm mx-auto">
          The industrial case will be announced simultaneously after registration closes.
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

  return (
    <div className="bg-black/30 border border-dashed border-white/20 rounded-2xl p-6 text-center w-full">
      <UploadCloud size={40} className={`mx-auto mb-4 ${currentUrl ? "text-green-400" : "text-sunlight-orange"}`} />
      
      <p className="text-white font-bold mb-2">Abstract Submission Portal</p>
      <p className="text-xs text-silver-shine mb-6 max-w-sm mx-auto">
        {currentUrl 
          ? "Your abstract document has been saved. You can update it as long as the selection period has not ended." 
          : "Upload your team's initial abstract document to participate in the administrative selection process."}
      </p>

      {compeType === "industrial-case" && !currentUrl && (
        <div className="mb-6 max-w-xs mx-auto text-left">
          <label className="block text-xs font-bold text-silver-shine mb-2">Select Industrial Case:</label>
          <select 
            value={selectedCase} 
            onChange={(e) => setSelectedCase(e.target.value)}
            className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors"
          >
            <option value="" disabled>-- Select Case --</option>
            <option value="Case A: Supply Chain">Case A: Supply Chain</option>
            <option value="Case B: Sustainability">Case B: Sustainability</option>
            <option value="Case C: Manufacturing">Case C: Manufacturing</option>
          </select>
        </div>
      )}

      {isUpdating ? (
        <div className="text-sm font-bold text-silver-shine animate-pulse">Saving document...</div>
      ) : (
        <CldUploadWidget 
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} 
          // KUNCI CUMA BISA PDF / DOC / DOCX DI SINI
          options={{ maxFiles: 1, clientAllowedFormats: ["pdf", "doc", "docx"], resourceType: "auto" }}
          onSuccess={handleUploadSuccess}
        >
          {({ open }) => (
            <button 
              type="button" 
              onClick={() => {
                if (compeType === "industrial-case" && !currentUrl && !selectedCase) {
                  alert("Please select an industrial case first!");
                  return;
                }
                open();
              }} 
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
      
      {currentUrl && (
        <div className="mt-4 text-[10px] text-silver-shine italic">
          *Re-uploading will overwrite the previous abstract file.
        </div>
      )}
    </div>
  );
}