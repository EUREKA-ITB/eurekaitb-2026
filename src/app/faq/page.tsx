import Link from "next/link";
import { Sparkles, CircleHelp, Clock3, Mail, MessageCircleQuestion, ShieldCheck, Headphones, Download } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import EmailHelpButton from "@/components/EmailHelpButton";
import FaqRating from "@/components/FaqRating";

const faqs = [
  {
    question: "Bagaimana cara mendaftar sebagai peserta?",
    answer: "Buat akun terlebih dahulu, lalu masuk ke dashboard dan pilih menu pendaftaran lomba. Isi data tim, unggah dokumen yang diminta, dan lanjutkan ke pembayaran.",
  },
  {
    question: "Apakah saya bisa mengubah data tim setelah submit?",
    answer: "Bisa, selama status pembayaran masih unpaid. Setelah bukti pembayaran dikirim dan status berubah menjadi pending atau verified, data akan dikunci untuk menjaga integritas pendaftaran.",
  },
  {
    question: "Bagaimana jika saya belum menerima verifikasi pembayaran?",
    answer: "Tim bendahara akan memeriksa bukti transfer Anda. Jika sudah diverifikasi, status akan berubah menjadi verified dan nomor peserta resmi akan muncul di dashboard.",
  },
  {
    question: "Dokumen apa saja yang harus diunggah?",
    answer: "Setiap anggota diwajibkan mengunggah pas foto, KTM atau kartu pelajar, link Instagram, serta bukti follow dan share poster/BC sesuai instruksi pada formulir.",
  },
  {
    question: "Apa yang harus saya lakukan jika ada masalah teknis?",
    answer: "Silakan hubungi helpdesk melalui email atau nomor WhatsApp resmi EUREKA. Tim support akan membantu menyelesaikan masalah Anda secepat mungkin.",
  },
  {
    question: "Kenapa status pembayaran saya masih unpaid padahal sudah upload bukti transfer?",
    answer: "Setelah upload bukti transfer, tim bendahara akan memeriksa mutasi bank terlebih dahulu. Jika belum diverifikasi, status akan tetap unpaid atau pending sampai proses validasi selesai.",
  },
  {
    question: "Bagaimana total biaya dihitung dan apa itu kode unik transfer?",
    answer: "Total biaya terdiri dari biaya pendaftaran plus kode unik tiga digit di akhir. Kode unik ini membantu sistem mengenali pembayaran Anda tanpa salah.",
  },
  {
    question: "Apa yang terjadi jika saya salah memasukkan 3 digit kode unik saat transfer?",
    answer: "Jika kode unik tidak cocok, sistem mungkin tidak dapat memverifikasi pembayaran otomatis. Hubungi helpdesk dan kirimkan bukti transfer agar verifikasi dapat dilakukan manual.",
  },
  {
    question: "Dokumen apa saja yang harus saya unggah untuk setiap anggota tim?",
    answer: "Setiap anggota harus melampirkan pas foto, KTM atau kartu pelajar, link Instagram, bukti follow akun resmi EUREKA, dan bukti share poster/BC sesuai instruksi formulir.",
  },
  {
    question: "Apakah satu akun email bisa mendaftar lebih dari satu lomba?",
    answer: "Tidak. Sistem EUREKA saat ini hanya memperbolehkan satu akun email untuk satu pendaftaran lomba demi menghindari duplikasi data.",
  },
];

export default function FaqPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_HELPDESK_WHATSAPP ?? "(Nomor WA belum tersedia)";
  const whatsappTemplate = encodeURIComponent(
    "Halo tim helpdesk EUREKA 2026, saya ingin menanyakan masalah terkait pendaftaran lomba."
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-28 pb-20 text-white selection:bg-sunlight-orange selection:text-blue-marine overflow-x-hidden">
      <div className="mx-auto max-w-6xl">
        
        {/* BAGIAN ATAS: Desain Card UI kamu + Copywriting Staf */}
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.35em] text-silver-shine mb-5">
                <Sparkles size={14} className="text-sunlight-orange" /> FAQ & Helpdesk
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold">
                Butuh bantuan seputar pendaftaran EUREKA 2026?
              </h1>
              <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-silver-shine">
                Temukan jawaban paling sering ditanyakan di sini, atau hubungi tim support kami jika Anda membutuhkan bantuan lebih lanjut.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-sunlight-orange px-6 py-3.5 text-sm font-bold text-blue-marine transition hover:bg-yellow-400"
              >
                Ke Dashboard
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </section>

        {/* BAGIAN BAWAH: Layout 2 Kolom buatan Staf */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* Kolom Kiri: Daftar FAQ */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <MessageCircleQuestion className="text-sunlight-orange" size={22} />
              <h2 className="font-display text-2xl font-semibold text-white">Pertanyaan yang Sering Diajukan</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details key={faq.question} className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-white flex gap-3 outline-none">
                    <span className="text-sunlight-orange font-bold shrink-0">{String(index + 1).padStart(2, "0")}</span>
                    <span>{faq.question}</span>
                  </summary>
                  <p className="mt-3 ml-7 text-sm leading-relaxed text-silver-shine border-t border-white/10 pt-3">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Sidebar Helpdesk */}
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
                      <a href="mailto:officialeurekaitb@gmail.com" target="_blank" rel="noreferrer" className="text-silver-shine hover:text-white truncate">
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
                      <a href="https://instagram.com/eurekaitb" target="_blank" rel="noreferrer" className="text-silver-shine hover:text-white truncate">
                        @eurekaitb
                      </a>
                      <CopyButton text="@eurekaitb" ariaLabel="Copy instagram handle" className="shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <svg className="mt-0.5 text-sunlight-orange shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.5 3.5L3.5 11.5L10.5 18.5L18 20L20.5 3.5Z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">WhatsApp</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-silver-shine truncate">{whatsappNumber}</p>
                      <CopyButton text={whatsappNumber} ariaLabel="Copy whatsapp number" className="shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="flex gap-3">
                    <Download className="mt-0.5 text-sunlight-orange shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Guidebook</p>
                      <p className="text-silver-shine text-xs mt-1">Unduh panduan pendaftaran</p>
                    </div>
                  </div>
                  <Link
                    href="/links"
                    className="rounded-full border border-sunlight-orange/40 bg-sunlight-orange px-4 py-2 text-sm font-semibold text-blue-marine transition hover:bg-yellow-400 shrink-0 self-center"
                  >
                    Unduh
                  </Link>
                </div>

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
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappTemplate}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full justify-center rounded-full border border-sunlight-orange/40 bg-sunlight-orange px-4 py-2 text-sm font-semibold text-blue-marine transition hover:bg-yellow-400"
                >
                  Hubungi via WhatsApp
                </a>
              </div>
            </div>
            
            <FaqRating />
          </div>
        </section>
      </div>
    </div>
  );
}