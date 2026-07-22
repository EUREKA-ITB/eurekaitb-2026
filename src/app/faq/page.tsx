import Link from "next/link";
import { ArrowRight, HelpCircle, ShieldCheck, Sparkles } from "lucide-react";

const generalFaqs = [
  { q: "Bagaimana cara mendaftar kompetisi?", a: "Masuk ke halaman kompetisi, baca guidebook, lalu lanjut dari tombol pendaftaran yang tersedia." },
  { q: "Kapan nomor registrasi diberikan?", a: "Nomor registrasi aktif setelah admin memverifikasi pembayaran. Password CBT dibuat acak." },
  { q: "Apakah data pendaftaran bisa diedit?", a: "Bisa selama status pembayaran masih unpaid. Setelah itu data akan terkunci." },
  { q: "Di mana saya melihat invoice dan status pembayaran?", a: "Gunakan dashboard peserta untuk cek status dan upload bukti pembayaran." },
  { q: "Apakah ada FAQ per kompetisi?", a: "Ada. Selain FAQ umum ini, tiap halaman kompetisi juga punya FAQ cabangnya sendiri." },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 pt-28 pb-8 text-white">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.35em] text-silver-shine">
            <Sparkles size={14} className="text-sunlight-orange" /> FAQ Center
          </div>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold">FAQ Umum EUREKA ITB 2026</h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base leading-8 text-silver-shine">
            Halaman ini dipakai untuk pertanyaan umum di seluruh event. FAQ per cabang tetap tersedia di halaman kompetisi masing-masing.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/links" className="inline-flex items-center justify-center gap-2 rounded-full bg-sunlight-orange px-6 py-3.5 text-sm font-bold text-blue-marine">
              Buka Links <ArrowRight size={16} />
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white">
              Kembali ke Landing <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {generalFaqs.map((item) => (
            <details key={item.q} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <summary className="cursor-pointer list-none font-bold text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-sunlight-orange" />
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-7 text-silver-shine">{item.a}</p>
            </details>
          ))}
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-sunlight-orange" />
            <h2 className="font-display text-2xl font-bold text-white">Aturan Singkat</h2>
          </div>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-silver-shine">
            <li className="rounded-2xl border border-white/10 bg-black/20 p-4">Satu email dipakai untuk satu pendaftaran tim/peserta.</li>
            <li className="rounded-2xl border border-white/10 bg-black/20 p-4">Upload dokumen administrasi wajib diisi sebelum submit.</li>
            <li className="rounded-2xl border border-white/10 bg-black/20 p-4">Nomor registrasi dan password CBT muncul setelah verifikasi admin.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}