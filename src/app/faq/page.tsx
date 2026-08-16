"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Clock3,
  Mail,
  ShieldCheck,
  Headphones,
  Download,
  ListFilter,
  UserRound,
  Wallet,
  FileText,
  Wrench,
} from "lucide-react";
import CopyButton from "@/components/CopyButton";
import EmailHelpButton from "@/components/EmailHelpButton";
import FaqRating from "@/components/FaqRating";
import { Button } from "@/components/ui/button";

type Category = "akun" | "pembayaran" | "dokumen" | "teknis";

const categories: { id: Category; label: string; icon: typeof UserRound }[] = [
  { id: "akun", label: "Pendaftaran & Akun", icon: UserRound },
  { id: "pembayaran", label: "Pembayaran", icon: Wallet },
  { id: "dokumen", label: "Dokumen", icon: FileText },
  { id: "teknis", label: "Teknis & Lainnya", icon: Wrench },
];

const faqs: { question: string; answer: string; category: Category }[] = [
  {
    category: "akun",
    question: "Bagaimana cara mendaftar sebagai peserta?",
    answer:
      "Buat akun terlebih dahulu, lalu masuk ke dashboard dan pilih menu pendaftaran lomba. Isi data tim, unggah dokumen yang diminta, dan lanjutkan ke langkah berikutnya sesuai kompetisi yang diikuti.",
  },
  {
    category: "akun",
    question: "Apakah saya bisa mengubah data tim setelah submit?",
    answer:
      "Untuk kompetisi berupa tim seperti SPC dan ICC, setelah selesai melakukan registrasi, formulir akan otomatis terkunci.",
  },
  {
    category: "akun",
    question: "Apakah satu akun email bisa mendaftar lebih dari satu lomba?",
    answer:
      "Tidak. Sistem EUREKA saat ini hanya memperbolehkan satu akun email untuk satu pendaftaran lomba demi menghindari duplikasi data.",
  },
  {
    category: "pembayaran",
    question: "Bagaimana jika saya belum menerima verifikasi pembayaran?",
    answer:
      "Tim bendahara akan memeriksa bukti transfer Anda. Jika sudah diverifikasi, status akan berubah menjadi verified dan nomor peserta resmi akan muncul di dashboard.",
  },
  {
    category: "pembayaran",
    question: "Kenapa status pembayaran saya masih unpaid padahal sudah upload bukti transfer?",
    answer:
      "Setelah upload bukti transfer, tim bendahara akan memeriksa mutasi bank terlebih dahulu. Jika belum diverifikasi, status akan tetap unpaid atau pending sampai proses validasi selesai.",
  },
  {
    category: "pembayaran",
    question: "Bagaimana total biaya dihitung dan apa itu kode unik transfer?",
    answer:
      "Total biaya terdiri dari biaya pendaftaran plus kode unik tiga digit di akhir. Kode unik ini membantu sistem mengenali pembayaran Anda tanpa salah.",
  },
  {
    category: "pembayaran",
    question: "Apa yang terjadi jika saya salah memasukkan 3 digit kode unik saat transfer?",
    answer:
      "Jika kode unik tidak cocok, sistem mungkin tidak dapat memverifikasi pembayaran otomatis. Hubungi helpdesk dan kirimkan bukti transfer agar verifikasi dapat dilakukan manual.",
  },
  {
    category: "dokumen",
    question: "Dokumen apa saja yang harus saya unggah untuk setiap anggota tim?",
    answer:
      "Setiap anggota harus melampirkan pas foto ukuran 3x4, KTM atau kartu pelajar, link Instagram, bukti follow akun resmi EUREKA, bukti upload twibbon, dan bukti share poster/BC sesuai instruksi formulir.",
  },
  {
    category: "teknis",
    question: "Apa yang harus saya lakukan jika ada masalah teknis?",
    answer:
      "Silakan hubungi helpdesk melalui email atau nomor WhatsApp resmi EUREKA. Tim support akan membantu menyelesaikan masalah Anda secepat mungkin.",
  },
];

export default function FaqPageV2() {
  const whatsappNumberGen = process.env.NEXT_PUBLIC_HELPDESK_WHATSAPP ?? "6283148657849";
  const whatsappTemplateGen = encodeURIComponent(
    "Halo tim helpdesk EUREKA 2026, ada yang ingin saya tanyakan terkait Eureka! ITB 2026 ini. [Jelaskan keperluan Anda]"
  );

  const whatsappNumberCompe = process.env.NEXT_PUBLIC_HELPDESK_WHATSAPP ?? "62895324405010";
  const whatsappTemplateCompe = encodeURIComponent(
    "Halo tim helpdesk EUREKA 2026, ada yang ingin saya tanyakan terkait [sebutkan jenis kompetisi yang ingin ditanyakan]."
  );

  const whatsappNumberTech = process.env.NEXT_PUBLIC_HELPDESK_WHATSAPP ?? "6285139556416";
  const whatsappTemplateTech = encodeURIComponent(
    "Halo tim helpdesk EUREKA 2026, saya mengalami kendala teknis [sebutkan kendala teknis yang dialami]. Mohon bantuannya."
  );

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "semua">("semua");

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "semua" || faq.category === activeCategory;
      const matchesQuery =
        query.trim().length === 0 ||
        faq.question.toLowerCase().includes(query.toLowerCase()) ||
        faq.answer.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-28 pb-20 text-white selection:bg-sunlight-orange selection:text-blue-marine overflow-x-hidden">
      <div className="mx-auto max-w-6xl">
        {/* HERO + SEARCH */}
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 backdrop-blur-sm shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full px-1 py-1.5 text-s font-bold uppercase tracking-[0.35em] text-sunlight-orange mb-5">
            FAQ & Helpdesk
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold max-w-2xl">
            Cari jawaban lebih cepat lewat pencarian & kategori
          </h1>
          <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-silver-shine">
            Ketik kata kunci atau pilih kategori pertanyaan di bawah untuk langsung menemukan jawaban yang kamu butuhkan.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-shine" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari pertanyaan, misalnya: pembayaran, dokumen, kode unik..."
                className="w-full rounded-full border border-white/15 bg-black/20 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-silver-shine/60 outline-none focus:border-sunlight-orange/60"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setActiveCategory("semua")}
                variant={activeCategory === "semua" ? "default" : "outline"}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                  activeCategory === "semua"
                    ? "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <ListFilter size={14} /> Semua
              </Button>
              {categories.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategory(id)}
                  variant={activeCategory === id ? "default" : "outline"}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                    activeCategory === id
                      ? "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"
                      : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={14} /> {label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* FAQ list */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-display text-lg font-semibold text-white">Tidak ada hasil ditemukan</p>
                <p className="mt-2 text-sm text-silver-shine">
                  Coba kata kunci lain atau hubungi helpdesk kami di samping.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((faq) => {
                  const CategoryIcon = categories.find((c) => c.id === faq.category)?.icon ?? Sparkles;
                  return (
                    <details
                      key={faq.question}
                      className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/5"
                    >
                      <summary className="cursor-pointer list-none text-sm font-semibold text-white flex gap-3 outline-none">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sunlight-orange/10 text-sunlight-orange">
                          <CategoryIcon size={16} />
                        </span>
                        <span className="pt-1">{faq.question}</span>
                      </summary>
                      <p className="mt-3 ml-11 text-sm leading-relaxed text-silver-shine border-t border-white/10 pt-3">
                        {faq.answer}
                      </p>
                    </details>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Helpdesk - sama seperti versi FAQ utama */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sunlight-orange/15 to-white/5 p-6 shadow-xl backdrop-blur-md">
              <div className="mb-4 flex items-center gap-3">
                <Headphones className="text-sunlight-orange" size={22} />
                <h2 className="font-display text-2xl font-semibold text-white">Helpdesk EUREKA</h2>
              </div>
              <p className="text-sm leading-relaxed text-silver-shine">
                Tim support kami siap membantu Anda di hari kerja selama masa pendaftaran.
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <Mail className="mt-0.5 text-sunlight-orange shrink-0" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">Email</p>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href="mailto:officialeurekaitb@gmail.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-silver-shine hover:text-white truncate"
                      >
                        officialeurekaitb@gmail.com
                      </a>
                      <CopyButton text="officialeurekaitb@gmail.com" ariaLabel="Copy email" className="shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <ShieldCheck className="mt-0.5 text-sunlight-orange shrink-0" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">Instagram resmi</p>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href="https://instagram.com/eurekaitb"
                        target="_blank"
                        rel="noreferrer"
                        className="text-silver-shine hover:text-white truncate"
                      >
                        @eurekaitb
                      </a>
                      <CopyButton text="@eurekaitb" ariaLabel="Copy instagram handle" className="shrink-0" />
                    </div>
                  </div>
                </div>

                {/* BUAT GUIDEBOOK UMUM */}

                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <Clock3 className="mt-0.5 text-sunlight-orange shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-white">Jam respon</p>
                    <p className="text-silver-shine">Senin–Jumat, 08.00–17.00 WIB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
              <h3 className="font-display text-xl font-semibold text-white">Butuh bantuan cepat?</h3>
              <p className="mt-2 text-sm leading-relaxed text-silver-shine mb-5">
                Jika Anda mengalami masalah saat upload bukti pembayaran, mengubah data tim, atau mengakses dashboard, hubungi support kami langsung.
              </p>
              <div className="flex flex-col gap-3">
                <EmailHelpButton />
                <Button
                  asChild
                  className="w-full rounded-full border border-sunlight-orange/40 bg-sunlight-orange px-4 py-2 text-sm font-semibold text-blue-marine hover:bg-yellow-400"
                >
                  <a
                    href={`https://wa.me/${whatsappNumberGen}?text=${whatsappTemplateGen}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    General (WhatsApp)
                  </a>
                </Button>
                <Button
                  asChild
                  className="w-full rounded-full border border-sunlight-orange/40 bg-sunlight-orange px-4 py-2 text-sm font-semibold text-blue-marine hover:bg-yellow-400"
                >
                  <a
                    href={`https://wa.me/${whatsappNumberCompe}?text=${whatsappTemplateCompe}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Kompetisi (WhatsApp)
                  </a>
                </Button>
                <Button
                  asChild
                  className="w-full rounded-full border border-sunlight-orange/40 bg-sunlight-orange px-4 py-2 text-sm font-semibold text-blue-marine hover:bg-yellow-400"
                >
                  <a
                    href={`https://wa.me/${whatsappNumberTech}?text=${whatsappTemplateTech}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Teknis (WhatsApp)
                  </a>
                </Button>
              </div>
            </div>

            <FaqRating />
          </div>
        </section>
      </div>
    </div>
  );
}
