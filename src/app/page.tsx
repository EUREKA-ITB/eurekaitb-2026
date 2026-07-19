import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link"; // <-- INI TAMBAHAN IMPORTNYA

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans selection:bg-sunlight-orange selection:text-blue-marine">
      <Navbar session={session} />

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="font-display text-5xl md:text-8xl font-extrabold mb-6 leading-tight">
          Exploring <span className="text-sunlight-orange">Physics</span>
        </h1>
        <p className="text-silver-shine max-w-2xl text-lg md:text-xl mb-10">
          Dari rasa ingin tahu menjadi dampak nyata. Bergabunglah dalam kompetisi sains dan fisika terbesar tahun ini untuk SMA dan Mahasiswa tingkat nasional.
        </p>
      </section>

      {/* TIMELINE SECTION (Bisa discroll ke pinggir) */}
      <section id="timeline" className="py-20 px-6 border-t border-white/10 overflow-hidden">
        <h2 className="font-display text-4xl font-bold mb-10 text-center">Timeline Kegiatan</h2>
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
          {/* Card Timeline Sementara */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="min-w-[300px] bg-white/5 border border-white/10 p-6 rounded-2xl snap-center shrink-0">
              <p className="text-sunlight-orange font-bold mb-2">Fase {item}</p>
              <h3 className="text-2xl font-display font-semibold mb-2">Early Bird</h3>
              <p className="text-silver-shine text-sm">Pendaftaran gelombang pertama dibuka dengan harga khusus.</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOMBA SECTION (Berbaris ke Bawah) */}
      <section id="lomba" className="py-20 px-6">
        <h2 className="font-display text-4xl font-bold mb-10 text-center">Kategori Lomba</h2>
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          
          {/* Lomba 1 */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/10 transition-colors">
            <div className="flex-1">
              <h3 className="text-2xl font-display font-bold mb-2 text-sunlight-orange">Physics Olympiad</h3>
              <p className="text-silver-shine text-sm">Kompetisi individu untuk siswa SMA/MA/SMK sederajat menguji pemahaman fisika tingkat lanjut.</p>
            </div>
            {/* <button> DIUBAH MENJADI <Link> */}
            <Link href="/competition/physics_olympiad" className="w-full md:w-auto px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-blue-marine transition-all font-semibold shrink-0 text-center block">
              Info Lengkap
            </Link>
          </div>
          
          {/* Lomba 2 */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/10 transition-colors">
            <div className="flex-1">
              <h3 className="text-2xl font-display font-bold mb-2 text-sunlight-orange">Science Project</h3>
              <p className="text-silver-shine text-sm">Kompetisi beregu (2-3 orang) untuk SMA/sederajat dalam merancang proyek sains inovatif.</p>
            </div>
            {/* <button> DIUBAH MENJADI <Link> */}
            <Link href="/competition/science_project" className="w-full md:w-auto px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-blue-marine transition-all font-semibold shrink-0 text-center block">
              Info Lengkap
            </Link>
          </div>
          
          {/* Lomba 3 */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/10 transition-colors">
            <div className="flex-1">
              <h3 className="text-2xl font-display font-bold mb-2 text-sunlight-orange">Industrial Case</h3>
              <p className="text-silver-shine text-sm">Tantangan pemecahan masalah industri untuk Mahasiswa S1 beregu (2-3 orang).</p>
            </div>
            {/* <button> DIUBAH MENJADI <Link> */}
            <Link href="/competition/industrial_case" className="w-full md:w-auto px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-blue-marine transition-all font-semibold shrink-0 text-center block">
              Info Lengkap
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer id="kontak" className="py-12 px-6 border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <h2 className="font-display text-2xl font-bold">EUREKA<span className="text-sunlight-orange">2026</span></h2>
          <div className="flex gap-4 justify-center">
            <span className="px-4 py-2 bg-white/5 rounded-full text-sm text-silver-shine">Sponsored by ...</span>
            <span className="px-4 py-2 bg-white/5 rounded-full text-sm text-silver-shine">Supported by ...</span>
          </div>
          <p className="text-silver-shine text-sm mt-8">© 2026 MIPA SQUAD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}