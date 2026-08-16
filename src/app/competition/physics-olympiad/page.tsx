"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Trophy, Users, FileText, Calendar, Medal, HelpCircle, ChevronRight, Wallet, Banknote, BanknoteIcon, LucideMedal } from "lucide-react";
import { COMPETITION_PRICING, PHASE_NAMES, formatIDR, getCurrentPhase } from "@/lib/competition-config";
import type { CompeType, Phase } from "@/lib/competition-config";
import Image from "next/image";

type DocItem = { id: string; title: string; url: string; };
type TimelineItem = { date: string; title: string; desc: string; };
type FaqItem = { q: string; a: string; };
type Hadiah = { juara1: string; juara2: string; juara3: string; specialTitle: string; };
type Info = { type: string; desc: string; };

type TemplateProps = {
  formatName: string;
  lombaId: string;
  info: Info;
  documents: DocItem[];
  activeDoc: DocItem;
  activePdfIndex: number;
  setActivePdfIndex: (val: number) => void;
  timelineData: TimelineItem[];
  faqData: FaqItem[];
  hadiah: Hadiah;
};

export default function PhysicsOlympiadPage() {
  const formatName = "PHYSICS OLYMPIAD";
  const lombaId = "physics-olympiad"; 
  
  const info = { 
    type: "Individual", 
    desc: "Physics Olympiad EUREKA! ITB 2026 adalah kompetisi olimpiade fisika tingkat nasional bagi pelajar SMA/Sederajat. Dirancang untuk mengukur penguasaan dan problem solving konsep fisika secara mendalam." 
  };

  const documents = [
    { id: "guidebook", title: "Official Guidebook", url: "/guidebooks/rev-physics-olympiad.pdf" },
    { id: "silabus", title: "Syllabus & Guidelines", url: "/guidebooks/silabus-physics-olympiad.pdf" },
  ];
  
  const [activePdfIndex, setActivePdfIndex] = useState(0);
  const activeDoc = documents[activePdfIndex];

  const timelineData = [
    { date: "Aug 16 - 29, 2026", title: "Wave 1 Registration", desc: "Pendaftaran peserta dan verifikasi berkas secara online." },
    { date: "Aug 30 - Sep 19, 2026", title: "Wave 2 Registration", desc: "Pendaftaran peserta dan verifikasi berkas secara online." },
    { date: "Sep 20 - 30, 2026", title: "Wave 3 Registration", desc: "Pendaftaran peserta dan verifikasi berkas secara online." },
    { date: "Oct 08, 2026", title: "Technical Meeting", desc: "Dilaksanakan secara online. Peserta wajib hadir untuk mendapatkan informasi teknis lomba." },
    { date: "Oct 10, 2026", title: "Preliminary Round", desc: "Dilaksanakan serentak secara online melalui platform CBT." },
    { date: "Oct 31, 2026", title: "Semifinal Round", desc: "Dilaksanakan serentak secara online melalui platform CBT." },
    { date: "Nov 28 - 29, 2026", title: "Final & Grand Final", desc: "Dilaksanakan secara luring di Kampus ITB Ganesha." },
  ];

  const faqData = [
    { q: "Is it allowed to register for the Physics Olympiad and another competition branch at the same time?", a: "Yes, as long as the competition schedules do not clash with each other." },
    { q: "Are finalists required to attend offline at ITB?", a: "Yes, for the final and grand final rounds, participants are strictly required to attend offline at the ITB Ganesha Campus." },
    { q: "What if a finalist is suddenly unable to attend?", a: "Participant confirmation must be made no later than the technical meeting stage for finalists." },
  ];

  const hadiah = { 
    juara1: "Rp 5.000.000", 
    juara2: "Rp 3.500.000", 
    juara3: "Rp 2.000.000",
    specialTitle: "Best Category"
  };

  return <CompetitionTemplate formatName={formatName} lombaId={lombaId} info={info} documents={documents} activeDoc={activeDoc} activePdfIndex={activePdfIndex} setActivePdfIndex={setActivePdfIndex} timelineData={timelineData} faqData={faqData} hadiah={hadiah} />;
}

/* --- VISUAL TEMPLATE --- */
function CompetitionTemplate({ formatName, lombaId, info, documents, activeDoc, activePdfIndex, setActivePdfIndex, timelineData, faqData, hadiah }: TemplateProps) {
  const pricing = COMPETITION_PRICING[lombaId as CompeType];
  const currentPhase = getCurrentPhase();

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans overflow-x-hidden pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-6">
        
        <Link href="/#lomba" className="inline-flex items-center text-silver-shine hover:text-white transition-colors w-max text-sm font-semibold relative z-20">
          <ArrowLeft size={16} className="mr-2" /> Back to Competitions
        </Link>

        {/* HERO SECTION */}
        <section className="relative text-center flex flex-col items-center justify-center pt-8 pb-12">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-sunlight-orange/15 blur-[100px] rounded-full z-0 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-80 h-48 flex items-center justify-center mb-1 overflow-hidden mx-auto">
             <Image
               src="/compe-icon/po-white.png" 
               alt="po-white.png" 
               width={400} 
               height={200}
               quality={100}
               className="w-full h-full object-contain scale-100"
             />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">{formatName}</h1>
            <p className="text-silver-shine text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-10">{info.desc}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <div className="bg-white/5 border border-white/10 px-6 py-3.5 rounded-full flex items-center gap-3 w-full sm:w-auto justify-center">
                <Users size={18} className="text-sunlight-orange" />
                <span className="text-sm font-bold">{info.type}</span>
              </div>
              <Link href={`/dashboard/register-lomba?lomba=${lombaId}`} className="bg-sunlight-orange text-blue-marine px-8 py-3.5 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 w-full sm:w-auto shadow-[0_0_20px_rgba(255,184,0,0.3)]">
                Register Now <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* PRIZE POOL (ELEGANT CONFETTI BACKGROUND) */}
        <section id="prize-pool" className="px-4 py-8 relative z-20">
          <div className="max-w-4xl mx-auto rounded-3xl border border-sunlight-orange/40 p-10 sm:p-14 relative overflow-hidden text-center shadow-[0_0_50px_rgba(255,184,0,0.15)] group">
            
            {/* Animated Confetti & Sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-12 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-60"></div>
              <div className="absolute top-24 right-16 w-3 h-3 bg-sunlight-orange rounded-full animate-pulse opacity-80 shadow-[0_0_12px_#ffb800]"></div>
              <div className="absolute bottom-12 left-1/4 w-2 h-2 bg-white rounded-full animate-bounce opacity-50"></div>
              <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse opacity-70"></div>
              <div className="absolute bottom-20 right-12 text-sunlight-orange animate-spin opacity-40" style={{ animationDuration: '4s' }}>✦</div>
              <div className="absolute top-1/4 left-1/3 text-yellow-400 animate-pulse opacity-30 text-xl">✧</div>
              {/* Soft glows */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-sunlight-orange/20 rounded-full blur-[90px] group-hover:bg-sunlight-orange/30 transition-colors duration-700"></div>
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-yellow-500/10 rounded-full blur-[90px] group-hover:bg-yellow-500/20 transition-colors duration-700"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="inline-block px-5 py-2 rounded-full text-sunlight-orange text-s font-bold uppercase tracking-[0.25em] mb-4 backdrop-blur-sm shadow-sm">
                Total Prize Pool
              </div>
              <h3 className="text-5xl sm:text-7xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-sunlight-orange to-yellow-400 drop-shadow-sm mb-4 tracking-tight pb-2">
                Rp 30.000.000+
              </h3>
              <p className="text-silver-shine text-sm sm:text-base max-w-lg leading-relaxed mx-auto">
                Compete with the brightest minds across Indonesia and win a share of the grand prize pool, exclusive trophies, and certificates!
              </p>
            </div>
          </div>
        </section>

        {/* WINNERS & AWARDS */}
        <section className="relative z-10 py-4">
          <div className="text-center mb-12"><h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3"><Medal className="text-sunlight-orange" /> Winners & Awards</h2></div>
          
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
            {/* 2nd Winner */}
            <div className="order-2 md:order-1 bg-white/3 border border-silver-600 shadow-inner p-6 rounded-3xl text-center w-full md:w-1/3 flex flex-col hover:-translate-y-2 transition-transform h-full">
              <div className="w-16 h-16 mx-auto bg-gray-300/20 rounded-full flex items-center justify-center text-2xl mb-4 border border-gray-400 shadow-inner"><Trophy size={30}/></div>
              <p className="text-xs uppercase tracking-widest text-silver-shine mb-2">2nd Winner</p>
              <div className="flex flex-col gap-2 mt-auto text-xs text-silver-shine font-semibold">
                <span className="bg-black/30 py-2 px-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">Prize Money</span>
                <span className="bg-black/30 py-2 px-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">Certificate</span>
                <span className="bg-black/30 py-2 px-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">Trophy</span>
              </div>
            </div>

            {/* 1st Winner */}
            <div className="order-1 md:order-2 bg-white/3 border border-sunlight-orange/50 p-8 rounded-[2.5rem] text-center w-full md:w-1/3 flex flex-col shadow-[0_0_30px_rgba(255,184,0,0.15)] transform md:-translate-y-4 h-full relative z-10">
              <div className="w-20 h-20 mx-auto bg-sunlight-orange/20 rounded-full flex items-center justify-center text-4xl mb-4 border border-sunlight-orange shadow-[0_0_15px_rgba(255,184,0,0.5)]"><Trophy size={30}/></div>
              <p className="text-xs uppercase tracking-widest text-sunlight-orange font-bold mb-2">1st Winner</p>
              <div className="flex flex-col gap-2 mt-auto text-sm text-silver-shine font-semibold">
                <span className="bg-black/40 py-2.5 px-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-white">Prize Money</span>
                <span className="bg-black/40 py-2.5 px-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-white">Certificate</span>
                <span className="bg-black/40 py-2.5 px-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-white">Trophy</span>
              </div>
            </div>

            {/* 3rd Winner */}
            <div className="order-3 md:order-3 bg-white/3 border border-amber-500 shadow-inner p-6 rounded-3xl text-center w-full md:w-1/3 flex flex-col hover:-translate-y-2 transition-transform h-full">
              <div className="w-16 h-16 mx-auto bg-amber-700/30 rounded-full flex items-center justify-center text-2xl mb-4 border border-amber-800 shadow-inner"><Trophy size={30}/></div>
              <p className="text-xs uppercase tracking-widest text-silver-shine mb-2">3rd Winner</p>
              <div className="flex flex-col gap-2 mt-auto text-xs text-silver-shine font-semibold">
                <span className="bg-black/30 py-2 px-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">Prize Money</span>
                <span className="bg-black/30 py-2 px-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">Certificate</span>
                <span className="bg-black/30 py-2 px-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">Trophy</span>
              </div>
            </div>
          </div>

          {/* SPECIAL AWARDS CARD */}
          <div className="mt-8 max-w-3xl mx-auto bg-gradient-to-r from-transparent via-white/5 to-transparent border border-white-200 p-6 rounded-[2rem] text-center shadow-lg hover:border-sunlight-orange/40 hover:bg-white/5 transition-all duration-300">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/2 rounded-full flex items-center justify-center text-xl border border-white-200"><LucideMedal size={18}/></div>
              <h4 className="text-xl font-bold text-white uppercase tracking-wider">{hadiah.specialTitle}</h4>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-silver-shine font-bold">
              <span className="px-5 rounded-full border border-white/10">Honorable Mention</span>
            </div>
          </div>

          <p className="text-center text-[11px] text-silver-shine mt-10 max-w-2xl mx-auto opacity-70">*All participants in the preliminary rounds will receive an e-certificate, while finalists will receive a physical certificate.</p>
        </section>

        {/* REGISTRATION FEE */}
        <section className="relative z-10 py-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3"><Wallet className="text-sunlight-orange" /> Registration Fee</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {(["early_bird", "normal", "late"] as const).map((phaseKey) => {
              const isActive = currentPhase === phaseKey;
              return (
                <div key={phaseKey} className={`p-6 rounded-3xl text-center transition-all duration-300 ${isActive ? "border border-sunlight-orange/50 shadow-[0_0_25px_rgba(255,184,0,0.2)] transform md:-translate-y-2" : "bg-white/5 border border-white/10 opacity-60 hover:opacity-100"}`}>
                  {isActive && <div className="text-[10px] font-bold bg-sunlight-orange text-blue-marine px-3 py-1 rounded-full inline-block mb-4 uppercase tracking-widest">Active Phase</div>}
                  <p className={`text-xs uppercase tracking-widest mb-2 ${isActive ? "text-sunlight-orange font-bold" : "text-silver-shine"}`}>{PHASE_NAMES[phaseKey]}</p>
                  <h3 className="text-2xl font-bold text-white">{formatIDR(pricing[phaseKey])}</h3>
                  <p className="text-xs text-silver-shine mt-3">
                    {phaseKey === "early_bird" ? "Aug 16 - Aug 29, 2026" : phaseKey === "normal" ? "Aug 30 - Sep 19, 2026" : "Sep 20 - Sep 30, 2026"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* TIMELINE */}
        <section className="relative z-10 py-10 border-t border-white/10">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold flex items-center justify-center gap-3"><Calendar className="text-sunlight-orange" /> Competition Timeline</h2>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-6 md:left-1/2 md:-ml-[1px] top-0 bottom-0 w-[2px] bg-white/10"></div>
            <div className="flex flex-col gap-8">
              {timelineData.map((item, index) => (
                <div key={index} className={`relative flex flex-col md:flex-row items-start md:items-center ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-blue-marine border-2 border-sunlight-orange -translate-x-[7px] mt-1.5 md:mt-0 z-10"></div>
                  <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12 md:text-right"}`}>
                    <div className="bg-white/5 border border-sunlight-orange/50 p-5 rounded-2xl backdrop-blur-sm hover:border-sunlight-orange/30 transition-colors">
                      <span className="inline-block px-1 py-1 text-sunlight-orange text-s font-bold rounded-full mb-3">{item.date}</span>
                      <h3 className="font-display text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-silver-shine leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DOCUMENTS */}
        <section className="relative z-10">
          <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-[2rem] backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold flex items-center gap-3 mb-2"><BookOpen className="text-sunlight-orange" /> Documents & Guidelines</h2>
                <p className="text-sm text-silver-shine">Read or download the official competition guidelines.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc, index) => (
                  <button key={doc.id} onClick={() => setActivePdfIndex(index)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activePdfIndex === index ? "bg-sunlight-orange text-blue-marine shadow-lg" : "bg-black/30 border border-white/10 text-silver-shine hover:bg-white/10 hover:text-white"}`}>
                    <FileText size={16} /> {doc.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full bg-[#0a0f24] border border-white/10 rounded-2xl overflow-hidden relative h-[400px] md:h-[700px] flex flex-col items-center justify-center group">
              <object data={`${activeDoc.url}#toolbar=0`} type="application/pdf" className="hidden md:block w-full h-full absolute inset-0 z-10">
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-black/40">
                  <FileText size={48} className="text-white/20 mb-4" />
                  <p className="text-white font-bold mb-2">Document Not Available</p>
                  <p className="text-sm text-silver-shine">Please ensure the file <b>{activeDoc.url}</b> is uploaded in the public folder.</p>
                </div>
              </object>
              <div className="md:hidden flex flex-col items-center justify-center p-8 text-center h-full relative z-20">
                <FileText size={48} className="text-sunlight-orange mb-4 opacity-50" />
                <h3 className="font-bold text-lg mb-2">Document Preview</h3>
                <p className="text-silver-shine text-sm mb-6">Mobile devices do not support direct PDF previews.</p>
                <a href={activeDoc.url} target="_blank" rel="noreferrer" className="bg-sunlight-orange text-blue-marine font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition-colors">Open / Download {activeDoc.title}</a>
              </div>
              <a href={activeDoc.url} download className="hidden md:flex absolute top-4 right-6 z-20 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-white text-xs font-bold items-center gap-2 transition-colors">Download PDF</a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 py-10 border-t border-white/10">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-1/3">
              <h2 className="font-display text-3xl font-bold flex items-center gap-3 mb-4"><HelpCircle className="text-sunlight-orange" /> FAQ</h2>
              <p className="text-sm text-silver-shine leading-relaxed">Here are the most frequently asked questions regarding <b>{formatName}</b>.</p>
            </div>
            <div className="md:w-2/3 flex flex-col gap-3">
              {faqData.map((item, index) => (
                <details key={index} className="group bg-black/20 border border-white/10 rounded-2xl p-5 hover:bg-white/5 transition-colors cursor-pointer">
                  <summary className="font-bold text-sm list-none flex justify-between items-center outline-none">
                    <span className="pr-6">{item.q}</span>
                    <ChevronRight size={16} className="text-sunlight-orange shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-4 text-sm text-silver-shine leading-relaxed border-t border-white/10 pt-4">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}