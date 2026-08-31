import Link from "next/link";
import { Sparkles, Target, Users, Atom, Handshake, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type Sponsor = {
  name: string;
  logoUrl?: string;
  isTextOnly?: boolean;
  link?: string;
};

const sponsorTiers: { tier: string; sponsors: Sponsor[] }[] = [
  {
    tier: "Collaborators",
    sponsors: [
      { name: "BRIN", logoUrl: "/logo-cms/brin-c.png" },
      { name: "IASSSF", logoUrl: "/logo-cms/iasssf-white-c.png" },
      { name: "PLN Nusantara Power", logoUrl: "/logo-cms/pln-c.png" },
      { name: "Puspresnas", logoUrl: "/logo-cms/puspresnas-c.png" },
    ],
  },
  {
    tier: "Sponsor",
    sponsors: [
      { name: "Indolat", logoUrl: "/logo-cms/indolat-s.png" },
    ],
  },
  {
    tier: "Media Partner",
    sponsors: [
      { name: "@hlphysics", isTextOnly: true, link: "https://instagram.com/hlphysics" },
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 pt-28 pb-20 text-white selection:bg-sunlight-orange selection:text-blue-marine overflow-x-hidden">
      <div className="mx-auto max-w-6xl">
        {/* HERO */}
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 backdrop-blur-sm shadow-2xl text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold max-w-3xl mx-auto">
            EUREKA! <span className="text-sunlight-orange">ITB 2026</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-silver-shine">
            Ajang kompetisi fisika yang diselenggarakan oleh Himpunan Mahasiswa Fisika (HIMAFI) Institut Teknologi Bandung, hadir setiap dua tahun sekali untuk menghubungkan pelajar dan mahasiswa dari seluruh Indonesia lewat semangat eksplorasi sains.
          </p>
        </section>

        {/* TENTANG EUREKA */}
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md">
          <div className="mb-6 flex items-center gap-3">
            <Atom className="text-sunlight-orange" size={22} />
            <h2 className="font-display text-2xl font-semibold text-white">About EUREKA! ITB</h2>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-silver-shine">
            EUREKA! ITB adalah rangkaian kompetisi dan side event bertema fisika yang mewadahi peserta SMA/sederajat maupun mahasiswa S1 untuk berkompetisi lewat tiga cabang utama: Physics Olympiad, Science Project, dan Industrial Case. Diselenggarakan dua tahun sekali oleh HIMAFI ITB, acara ini bertujuan menumbuhkan minat sains, melatih kemampuan berpikir analitis, dan mempertemukan talenta muda dari berbagai daerah dalam satu panggung yang sama.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <Target className="text-sunlight-orange" size={20} />
              <p className="mt-3 font-semibold text-white text-sm">Our Mission</p>
              <p className="mt-1 text-xs leading-relaxed text-silver-shine">
                Menghadirkan wadah kompetisi fisika yang inklusif dan mendidik bagi pelajar dan mahasiswa Indonesia.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <Users className="text-sunlight-orange" size={20} />
              <p className="mt-3 font-semibold text-white text-sm">Who Can Join</p>
              <p className="mt-1 text-xs leading-relaxed text-silver-shine">
                Pelajar SMA/sederajat dan mahasiswa S1 dari seluruh Indonesia, individu maupun tim.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <Sparkles className="text-sunlight-orange" size={20} />
              <p className="mt-3 font-semibold text-white text-sm">Event Frequency</p>
              <p className="mt-1 text-xs leading-relaxed text-silver-shine">
                Setiap dua tahun sekali oleh Himpunan Mahasiswa Fisika ITB.
              </p>
            </div>
          </div>
        </section>

        {/* TENTANG HIMAFI */}
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md">
          <div className="mb-6 flex items-center gap-3">
            <Users className="text-sunlight-orange" size={22} />
            <h2 className="font-display text-2xl font-semibold text-white">Organizer: HIMAFI ITB</h2>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-silver-shine">
            Himpunan Mahasiswa Fisika (HIMAFI) ITB adalah organisasi kemahasiswaan yang menaungi seluruh mahasiswa Program Studi Fisika Institut Teknologi Bandung. Berlandaskan Tri Dharma Perguruan Tinggi, HIMAFI berperan sebagai wadah pembinaan, pengembangan diri, dan pengabdian mahasiswa Fisika ITB kepada almamater dan masyarakat, sekaligus menjadi ruang kolaborasi lewat berbagai program akademik maupun non-akademik — salah satunya EUREKA! ITB.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Link href="https://instagram.com/himafi.itb" target="_blank" rel="noreferrer">
                <svg
                  className="text-sunlight-orange shrink-0"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
                @himafi.itb
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Link href="mailto:officialeurekaitb@gmail.com">
                <Mail size={16} className="text-sunlight-orange" /> officialeurekaitb@gmail.com
              </Link>
            </Button>
          </div>
        </section>

        {/* SPONSOR & PARTNER */}
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md">
          <div className="mb-6 flex items-center gap-3">
            <Handshake className="text-sunlight-orange" size={22} />
            <h2 className="font-display text-2xl font-semibold text-white">Sponsors & Partners</h2>
          </div>
          <p className="text-sm text-silver-shine mb-10">
          </p>

          <div className="space-y-12">
            {sponsorTiers.map(({ tier, sponsors }) => (
              <div key={tier}>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-sunlight-orange mb-6 border-b border-white/10 pb-2 inline-block">
                  {tier}
                </p>
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 items-center justify-items-center">
                  {sponsors.map((sponsor, idx) => (
                    <div
                      key={`${tier}-${idx}`}
                      className="flex h-16 sm:h-20 w-full items-center justify-center transition-transform hover:scale-105"
                    >
                      {sponsor.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={sponsor.logoUrl} 
                          alt={sponsor.name} 
                          className="max-h-full max-w-full object-contain drop-shadow-2xl rounded-md" 
                        />
                      ) : sponsor.isTextOnly ? (
                        <a 
                          href={sponsor.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 text-sm font-bold text-white hover:text-sunlight-orange transition-colors px-3 py-2 rounded-full border border-white/10 hover:border-sunlight-orange/30 shadow-lg"
                        >
                          {sponsor.name} <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-xs text-silver-shine/60">TBA</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}