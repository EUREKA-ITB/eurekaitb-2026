"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import {
  UploadCloud,
  CheckCircle2,
  FileText,
  CheckSquare,
  AlertCircle,
} from "lucide-react";

interface CloudinaryResult {
  info?: string | { secure_url?: string };
}

export default function SubmissionClient({
  teamId,
  compeType,
  initialUrl,
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
  const submissionDeadline =
    compeType === "science-project" ? SPC_DEADLINE : ICC_DEADLINE;
  const isLocked = new Date() > submissionDeadline;

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!paperUrl) {
      setErrorMessage(
        "Harap unggah dokumen PDF terlebih dahulu sebelum submit!"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          type: "fullPaper",
          paperUrl,
        }),
      });

      const responseData = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(
          `GAGAL SUBMIT: ${
            responseData.error ?? "Terjadi kesalahan saat mengirim dokumen."
          }`
        );
        return;
      }

      setIsSuccess(true);
      router.refresh();
    } catch {
      setErrorMessage(
        "GAGAL JARINGAN: Terjadi kesalahan koneksi atau server down."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-400 sm:p-6 sm:text-base">
        Batas waktu pengumpulan dokumen telah berakhir!
      </div>
    );
  }

  if (isSuccess && paperUrl === initialUrl && initialUrl) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center sm:p-8">
        <CheckCircle2
          size={48}
          className="mx-auto mb-4 text-green-400 sm:h-16 sm:w-16"
        />

        <h3 className="mb-2 text-lg font-bold text-green-400 sm:text-xl">
          Submission Tersimpan!
        </h3>

        <p className="mb-6 text-xs text-silver-shine sm:text-sm">
          Dokumen tim Anda telah tersimpan di sistem kami.
        </p>

        <a
          href={initialUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-4 inline-block rounded-xl bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 sm:text-sm"
        >
          Lihat Dokumen Terkirim ↗
        </a>

        <div className="mt-4 border-t border-green-500/20 pt-4">
          <p className="mb-3 text-xs text-silver-shine">
            Ingin mengganti dokumen sebelum batas waktu pengumpulan?
          </p>

          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setPaperUrl(null);
            }}
            className="w-full rounded-lg bg-yellow-500/20 px-4 py-2.5 text-xs font-bold text-yellow-500 transition hover:bg-yellow-500/30 sm:w-auto"
          >
            Upload Ulang Dokumen Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 text-left sm:gap-6">
      <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-8">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white sm:text-base">
          <FileText size={18} className="shrink-0 text-sunlight-orange" />
          {compeType === "industrial-case"
            ? "Full Report (PDF)"
            : "Full Paper (PDF)"}
        </h3>

        <p className="mb-6 text-xs text-silver-shine">
          Unggah dokumen lengkap sesuai panduan Guidebook.
        </p>

        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PDF_PRESET}
          options={{
            maxFiles: 1,
            clientAllowedFormats: ["pdf"],
            resourceType: "auto",
          }}
          onSuccess={(result: CloudinaryResult) => {
            if (
              typeof result.info === "object" &&
              result.info?.secure_url
            ) {
              setPaperUrl(result.info.secure_url);
              setErrorMessage(null);
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className={`w-full cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
                paperUrl
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
            >
              {paperUrl ? (
                <span className="flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 size={32} className="text-green-400" />
                  <span className="text-sm font-bold text-green-400">
                    Dokumen Siap Dikirim
                  </span>
                  <span className="text-xs font-normal text-silver-shine">
                    Klik area ini jika ingin mengganti file PDF
                  </span>
                </span>
              ) : (
                <span className="flex flex-col items-center justify-center gap-2">
                  <UploadCloud size={32} className="text-white" />
                  <span className="text-sm font-bold text-white">
                    Pilih File PDF
                  </span>
                  <span className="text-xs font-normal text-silver-shine">
                    Maksimal 5MB
                  </span>
                </span>
              )}
            </button>
          )}
        </CldUploadWidget>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/20 p-4"
        >
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-400"
          />
          <p className="text-sm font-semibold text-red-100">
            {errorMessage}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || !paperUrl}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg transition-all sm:py-4 ${
          !paperUrl || isSubmitting
            ? "cursor-not-allowed bg-white/10 text-white/40"
            : "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"
        }`}
      >
        <CheckSquare size={18} />
        {isSubmitting ? "Menyimpan ke Database..." : "Kirim Dokumen"}
      </button>
    </div>
  );
}