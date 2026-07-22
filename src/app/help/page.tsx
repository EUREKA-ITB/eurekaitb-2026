import { getServerSession } from "next-auth";
import Link from "next/link";
import { CircleHelp, Clock3, Mail, MessageCircleQuestion, ShieldCheck, Headphones, Download } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import EmailHelpButton from "@/components/EmailHelpButton";
import FaqRating from "@/components/FaqRating";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";

const faqs = [
  {
    question: "Bagaimana cara mendaftar sebagai peserta?",
    answer:
      "Buat akun terlebih dahulu, lalu masuk ke dashboard dan pilih menu pendaftaran lomba. Isi data tim, unggah dokumen yang diminta, dan lanjutkan ke pembayaran.",
  },
  {
    question: "Apakah saya bisa mengubah data tim setelah submit?",
    answer:
      "Bisa, selama status pembayaran masih unpaid. Setelah bukti pembayaran dikirim dan status berubah menjadi pending atau verified, data akan dikunci untuk menjaga integritas pendaftaran.",
  },
  {
    question: "Bagaimana jika saya belum menerima verifikasi pembayaran?",
    answer:
      "Tim bendahara akan memeriksa bukti transfer Anda. Jika sudah diverifikasi, status akan berubah menjadi verified dan nomor peserta resmi akan muncul di dashboard.",
  },
  {
    question: "Dokumen apa saja yang harus diunggah?",
    answer:
      "Setiap anggota diwajibkan mengunggah pas foto, KTM atau kartu pelajar, link Instagram, serta bukti follow dan share poster/BC sesuai instruksi pada formulir.",
  },
  {
    question: "Apa yang harus saya lakukan jika ada masalah teknis?",
    answer:
      "Silakan hubungi helpdesk melalui email atau nomor WhatsApp resmi EUREKA. Tim support akan membantu menyelesaikan masalah Anda secepat mungkin.",
  },
  {
    question: "Kenapa status pembayaran saya masih unpaid padahal sudah upload bukti transfer?",
    answer:
      "Setelah upload bukti transfer, tim bendahara akan memeriksa mutasi bank terlebih dahulu. Jika belum diverifikasi, status akan tetap unpaid atau pending sampai proses validasi selesai.",
  },
  {
    question: "Bagaimana total biaya dihitung dan apa itu kode unik transfer?",
    answer:
      "Total biaya terdiri dari biaya pendaftaran plus kode unik tiga digit di akhir. Kode unik ini membantu sistem mengenali pembayaran Anda tanpa salah.",
  },
  {
    question: "Apa yang terjadi jika saya salah memasukkan 3 digit kode unik saat transfer?",
    answer:
      "Jika kode unik tidak cocok, sistem mungkin tidak dapat memverifikasi pembayaran otomatis. Hubungi helpdesk dan kirimkan bukti transfer agar verifikasi dapat dilakukan manual.",
  },
  {
    question: "Dokumen apa saja yang harus saya unggah untuk setiap anggota tim?",
    answer:
      "Setiap anggota harus melampirkan pas foto, KTM atau kartu pelajar, link Instagram, bukti follow akun resmi EUREKA, dan bukti share poster/BC sesuai instruksi formulir.",
  },
  {
    question: "Apakah satu akun email bisa mendaftar lebih dari satu lomba?",
    answer:
      "Tidak. Sistem EUREKA saat ini hanya memperbolehkan satu akun email untuk satu pendaftaran lomba demi menghindari duplikasi data.",
  },
];

export default async function HelpPage() {
  const session = await getServerSession(authOptions);
  const whatsappNumber = process.env.NEXT_PUBLIC_HELPDESK_WHATSAPP ?? "(Nomor WhatsApp belum tersedia)";
  const whatsappTemplate = encodeURIComponent(
    "Halo tim helpdesk EUREKA 2026, saya ingin menanyakan masalah terkait pendaftaran/pendaftaran lomba."
  );

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans selection:bg-sunlight-orange selection:text-blue-marine">
      <Navbar session={session} />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-md md:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sunlight-orange/30 bg-sunlight-orange/10 px-3 py-1 text-sm font-semibold text-sunlight-orange">
                  <CircleHelp size={16} /> FAQ & Helpdesk
                </div>
                <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                  Butuh bantuan seputar pendaftaran EUREKA 2026?
                </h1>
                <p className="mt-4 text-base leading-relaxed text-silver-shine">
                  Temukan jawaban paling sering ditanyakan di sini, atau hubungi tim support kami jika Anda membutuhkan bantuan lebih lanjut.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-sunlight-orange px-5 py-3 text-sm font-bold text-blue-marine transition hover:bg-yellow-400"
                >
                  Ke Dashboard
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-silver-shine transition hover:bg-white/10 hover:text-white"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-md md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <MessageCircleQuestion className="text-sunlight-orange" size={22} />
                <h2 className="font-display text-2xl font-semibold text-white">Pertanyaan yang Sering Diajukan</h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <details
                    key={faq.question}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <summary className="cursor-pointer list-none text-sm font-semibold text-white">
                      <span className="mr-2 text-sunlight-orange">{String(index + 1).padStart(2, "0")}</span>
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-silver-shine">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sunlight-orange/15 to-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-md">
                <div className="mb-4 flex items-center gap-3">
                  <Headphones className="text-sunlight-orange" size={22} />
                  <h2 className="font-display text-2xl font-semibold text-white">Helpdesk EUREKA</h2>
                </div>
                <p className="text-sm leading-relaxed text-silver-shine">
                  Tim support kami siap membantu Anda dari hari kerja selama masa pendaftaran.
                </p>

                  <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <Mail className="mt-0.5 text-sunlight-orange" size={18} />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Email</p>
                      <div className="flex items-center">
                        <a href="mailto:officialeurekaitb@gmail.com" target="_blank" rel="noreferrer" className="text-silver-shine hover:text-white">
                          officialeurekaitb@gmail.com
                        </a>
                        <CopyButton text="officialeurekaitb@gmail.com" ariaLabel="Copy email" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <ShieldCheck className="mt-0.5 text-sunlight-orange" size={18} />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Instagram resmi</p>
                      <div className="flex items-center">
                        <a href="https://instagram.com/eurekaitb" target="_blank" rel="noreferrer" className="text-silver-shine hover:text-white">
                          @eurekaitb
                        </a>
                        <CopyButton text="@eurekaitb" ariaLabel="Copy instagram handle" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <svg className="mt-0.5 text-sunlight-orange" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.5 3.5L3.5 11.5L10.5 18.5L18 20L20.5 3.5Z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-white">WhatsApp</p>
                      <div className="flex items-center">
                        <p className="text-silver-shine">{whatsappNumber}</p>
                        <CopyButton text={whatsappNumber} ariaLabel="Copy whatsapp number" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <Download className="mt-0.5 text-sunlight-orange" size={18} />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Guidebook</p>
                      <p className="text-silver-shine">Unduh panduan lengkap pendaftaran</p>
                    </div>
                    <Link
                      href="/guidebook/guidebook"
                      className="rounded-full border border-sunlight-orange/40 bg-sunlight-orange px-4 py-2 text-sm font-semibold text-blue-marine transition hover:bg-yellow-400"
                    >
                      Unduh
                    </Link>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <Clock3 className="mt-0.5 text-sunlight-orange" size={18} />
                    <div>
                      <p className="font-semibold text-white">Jam respon</p>
                      <p className="text-silver-shine">Senin–Jumat, 08.00–17.00 WIB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white">Butuh bantuan cepat?</h3>
                    <p className="mt-2 text-sm leading-relaxed text-silver-shine">
                      Jika Anda mengalami masalah saat upload bukti pembayaran, mengubah data tim, atau mengakses dashboard, hubungi support kami langsung.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-3">
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
      </main>
    </div>
  );
}
