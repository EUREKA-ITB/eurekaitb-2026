"use client";

import { useMemo, useState } from "react";
import { Search, ListFilter, UserRound, Wallet, FileText, Wrench, Sparkles } from "lucide-react";
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
      "Untuk kompetisi berupa tim seperti SPC dan ICC, setelah selesai melakukan registrasi, formulir akan otomatis terkunci kecuali ada catatan revisi dari admin.",
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
      <div className="mx-auto max-w-4xl w-full">
        {/* HERO + SEARCH */}
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 backdrop-blur-sm shadow-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-1 py-1.5 text-s font-bold uppercase tracking-[0.35em] text-sunlight-orange mb-5">
            General FAQ
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mx-auto max-w-2xl">
            Cari jawaban lebih cepat lewat pencarian
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-silver-shine">
            Ketik kata kunci atau pilih kategori pertanyaan di bawah untuk langsung menemukan jawaban yang kamu butuhkan.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 max-w-3xl mx-auto">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-shine" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari pertanyaan, misalnya: pembayaran, dokumen, kode unik..."
                className="w-full rounded-full border border-white/15 bg-black/20 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-silver-shine/60 outline-none focus:border-sunlight-orange/60"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
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
        <section className="mt-8 w-full">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md w-full box-border">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-display text-lg font-semibold text-white">Tidak ada hasil ditemukan</p>
                <p className="mt-2 text-sm text-silver-shine">
                  Coba kata kunci lain atau hubungi helpdesk melalui icon CS di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                {filtered.map((faq) => {
                  const CategoryIcon = categories.find((c) => c.id === faq.category)?.icon ?? Sparkles;
                  return (
                    <details
                      key={faq.question}
                      className="group rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:bg-white/5 w-full cursor-pointer"
                    >
                      <summary className="list-none text-sm sm:text-base font-semibold text-white flex gap-4 outline-none w-full items-center">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunlight-orange/10 text-sunlight-orange">
                          <CategoryIcon size={18} />
                        </span>
                        <span className="pt-1 break-words flex-1 leading-tight">{faq.question}</span>
                      </summary>
                      <p className="mt-4 ml-14 text-sm leading-relaxed text-silver-shine border-t border-white/10 pt-4 break-words">
                        {faq.answer}
                      </p>
                    </details>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}