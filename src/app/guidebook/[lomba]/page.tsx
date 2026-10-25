import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const guidebooks = {
  "physics-olympiad": {
    title: "PHYSICS OLYMPIAD",
    file: "/guidebooks/gb-po-rev10.pdf",
  },
  po: {
    title: "PHYSICS OLYMPIAD",
    file: "/guidebooks/gb-po-rev10.pdf",
  },
  "science-project": {
    title: "SCIENCE PROJECT",
    file: "/guidebooks/gb-spc-rev2.pdf",
  },
  spc: {
    title: "SCIENCE PROJECT",
    file: "/guidebooks/gb-spc-rev2.pdf",
  },
  "industrial-case": {
    title: "INDUSTRIAL CASE",
    file: "/guidebooks/industrial-case.pdf",
  },
  icc: {
    title: "INDUSTRIAL CASE",
    file: "/guidebooks/industrial-case.pdf",
  },
} as const;

type GuidebookViewerProps = {
  params: Promise<{ lomba: string }>;
};

export default async function GuidebookViewer({
  params,
}: GuidebookViewerProps) {
  const { lomba } = await params;
  const guidebook = guidebooks[lomba as keyof typeof guidebooks];

  if (!guidebook) {
    notFound();
  }

  const pdfUrl = guidebook.file;

  return (
    <div className="box-border flex min-h-screen flex-col bg-blue-marine p-4 pt-24 font-sans text-white md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-sunlight-orange md:text-3xl">
              GUIDEBOOK: {guidebook.title}
            </h1>
            <p className="text-sm text-silver-shine">
              Baca buku panduan lengkap kompetisi di bawah ini.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={pdfUrl}
              download
              className="rounded-lg bg-white/10 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              ↓ Download PDF
            </a>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg bg-maroon-flash px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-red-800"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
          </div>
        </div>

        <div className="relative min-h-[70vh] w-full flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
          <object
            data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            aria-label={`Guidebook ${guidebook.title}`}
            className="absolute inset-0 h-full w-full"
          >
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-silver-shine">
                Browser kamu tidak mendukung pembaca PDF langsung.
              </p>
              <a href={pdfUrl} className="text-sunlight-orange underline">
                Unduh Guidebook di sini
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}
