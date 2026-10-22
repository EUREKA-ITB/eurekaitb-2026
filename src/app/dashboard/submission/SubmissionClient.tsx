"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  FileText,
  UploadCloud,
} from "lucide-react";

type SubmissionStatus =
  | "not_submitted"
  | "submitted"
  | "revision"
  | "accepted"
  | "rejected";

interface CloudinaryResult {
  info?: string | { secure_url?: string };
}

interface SubmissionResponse {
  error?: string;
  status?: SubmissionStatus;
  savedUrl?: string | null;
}

export default function SubmissionClient({
  teamId,
  compeType,
  initialUrl,
  initialStatus,
  initialNotes,
}: {
  teamId: string;
  compeType: string;
  initialUrl: string | null;
  initialStatus: SubmissionStatus;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>(initialStatus);
  const [submissionNotes, setSubmissionNotes] = useState<string | null>(
    initialNotes
  );
  const [savedUrl, setSavedUrl] = useState<string | null>(initialUrl);
  const [paperUrl, setPaperUrl] = useState<string | null>(
    initialStatus === "revision" ? null : initialUrl
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const spcDeadline = new Date("2026-10-23T23:59:59+07:00");
  const iccDeadline = new Date("2026-11-07T23:59:59+07:00");
  const deadline =
    compeType === "science-project" ? spcDeadline : iccDeadline;
  const isDeadlinePassed = Date.now() > deadline.getTime();
  const isICC = compeType === "industrial-case";

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!paperUrl) {
      setErrorMessage("Pilih file PDF terlebih dahulu sebelum mengirim.");
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

      const responseData = (await response.json().catch(() => ({}))) as
        SubmissionResponse;

      if (!response.ok) {
        if (
          responseData.status === "submitted" ||
          responseData.status === "accepted" ||
          responseData.status === "rejected"
        ) {
          setSubmissionStatus(responseData.status);
          setSavedUrl(responseData.savedUrl ?? savedUrl);
          setSubmissionNotes(null);
        }

        setErrorMessage(
          responseData.error ??
            "Dokumen gagal dikirim. Muat ulang halaman dan coba lagi."
        );
        router.refresh();
        return;
      }

      setSubmissionStatus("submitted");
      setSavedUrl(paperUrl);
      setSubmissionNotes(null);
      setPaperUrl(paperUrl);
      setErrorMessage(null);
      router.refresh();
    } catch {
      setErrorMessage(
        "Koneksi bermasalah. Periksa jaringan lalu coba kirim kembali."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    submissionStatus === "submitted" ||
    submissionStatus === "accepted" ||
    submissionStatus === "rejected"
  ) {
    const isSubmitted = submissionStatus === "submitted";
    const isAccepted = submissionStatus === "accepted";

    return (
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-5 text-left sm:p-8">
        <div
          className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${
            isSubmitted
              ? "border-yellow-500/30 bg-yellow-500/10"
              : isAccepted
                ? "border-green-500/30 bg-green-500/10"
                : "border-red-500/30 bg-red-500/10"
          }`}
        >
          {isSubmitted ? (
            <FileText
              size={22}
              className="mt-0.5 shrink-0 text-yellow-400"
            />
          ) : isAccepted ? (
            <CheckCircle2
              size={22}
              className="mt-0.5 shrink-0 text-green-400"
            />
          ) : (
            <AlertCircle
              size={22}
              className="mt-0.5 shrink-0 text-red-400"
            />
          )}

          <div className="min-w-0">
            <h2
              className={`font-bold ${
                isSubmitted
                  ? "text-yellow-300"
                  : isAccepted
                    ? "text-green-300"
                    : "text-red-300"
              }`}
            >
              {isSubmitted
                ? "Submission sedang diperiksa"
                : isAccepted
                  ? "Submission diterima"
                  : "Submission ditolak"}
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-silver-shine">
              {isSubmitted
                ? "Dokumen sudah tersimpan. Tunggu hasil pemeriksaan admin. Kamu bisa mengirim revisi jika admin memintanya."
                : isAccepted
                  ? "Dokumen sudah diterima dan tidak bisa diubah dari halaman ini."
                  : "Dokumen ditolak dan pengiriman dikunci. Hubungi admin jika kamu membutuhkan peninjauan lebih lanjut."}
            </p>
          </div>
        </div>

        {savedUrl ? (
          <a
            href={savedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-2 break-all rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            <FileText size={18} className="shrink-0 text-sunlight-orange" />
            Lihat dokumen yang tersimpan
          </a>
        ) : (
          <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-silver-shine">
            Belum ada tautan dokumen yang tersimpan. Hubungi admin untuk
            memeriksa status submission tim.
          </p>
        )}
      </section>
    );
  }

  if (isDeadlinePassed) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-left sm:p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            className="mt-0.5 shrink-0 text-red-400"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-red-300">
              Batas pengiriman sudah berakhir
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-silver-shine">
              Submission baru atau revisi tidak dapat dikirim setelah batas
              waktu pengumpulan.
            </p>
          </div>
        </div>

        {submissionStatus === "revision" && submissionNotes && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
              Catatan revisi admin
            </p>
            <p className="whitespace-pre-wrap break-words text-sm text-white">
              {submissionNotes}
            </p>
          </div>
        )}

        {savedUrl && (
          <a
            href={savedUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex max-w-full items-center gap-2 break-all rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            <FileText size={18} className="shrink-0 text-sunlight-orange" />
            Lihat dokumen yang tersimpan
          </a>
        )}
      </section>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 text-left sm:gap-6">
      {submissionStatus === "revision" && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-yellow-400"
            />
            <div className="min-w-0">
              <h2 className="font-bold text-yellow-300">
                Revisi diminta oleh admin
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-silver-shine">
                Perbaiki dokumen sesuai catatan di bawah, lalu unggah file PDF
                revisi.
              </p>

              {submissionNotes && (
                <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
                    Catatan revisi
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm text-white">
                    {submissionNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {submissionStatus === "revision" && savedUrl && (
        <a
          href={savedUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-2 break-all rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          <FileText size={18} className="shrink-0 text-sunlight-orange" />
          Lihat dokumen sebelumnya
        </a>
      )}

      <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-8">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white sm:text-base">
          <FileText size={18} className="shrink-0 text-sunlight-orange" />
          {isICC ? "Full Report (PDF)" : "Full Paper (PDF)"}
        </h3>

        <p className="mb-6 text-xs leading-relaxed text-silver-shine">
          Unggah dokumen PDF sesuai panduan kompetisi.
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
                    PDF siap dikirim
                  </span>
                  <span className="text-xs font-normal text-silver-shine">
                    Klik area ini untuk memilih file PDF lain
                  </span>
                </span>
              ) : (
                <span className="flex flex-col items-center justify-center gap-2">
                  <UploadCloud size={32} className="text-white" />
                  <span className="text-sm font-bold text-white">
                    Pilih file PDF
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
          <p className="text-sm font-semibold text-red-100">{errorMessage}</p>
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
        {isSubmitting
          ? "Mengirim dokumen..."
          : submissionStatus === "revision"
            ? "Kirim dokumen revisi"
            : "Kirim dokumen"}
      </button>
    </div>
  );
}