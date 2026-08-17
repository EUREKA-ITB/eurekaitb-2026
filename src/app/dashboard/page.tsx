import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, teams, teamMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { CheckCircle2, Clock, CreditCard, FileText, Lock, QrCode, Trophy, Users, MessageCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import AbstractPortalClient from "./AbstractPortalClient"; 
import SuccessConfetti from "./SuccessConfetti";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0) redirect("/login");

  const userTeam = await db.select().from(teams).where(eq(teams.userId, dbUser[0].id)).limit(1);
  const hasRegistered = userTeam.length > 0;

  let membersData: {
    id: string;
    teamId: string | null;
    fullName: string;
    email: string;
    phoneNumber: string;
    grade: string;
    photoUrl: string | null;
    ktmUrl: string | null;
    isLeader: boolean | null;
  }[] = [];

  let isVerified = false;
  let isPending = false;
  let isPO = false;
  let isSPC = false;
  let isICC = false;
  let abstractStatus = "waiting";
  let abstractUrl = null;
  let caseChoice = null;
  let participantNumber = "";
  let cbtPassword = "";
  let compeTypeSlug = "";
  let documentStatus = "waiting";
  let adminNotes = null;

  if (hasRegistered) {
    isVerified = userTeam[0].statusPayment === "verified";
    isPending = userTeam[0].statusPayment === "pending";
    compeTypeSlug = userTeam[0].compeType.replace(/_/g, "-");
    isPO = compeTypeSlug === "physics-olympiad";
    isSPC = compeTypeSlug === "science-project";
    isICC = compeTypeSlug === "industrial-case";
    abstractStatus = userTeam[0].abstractStatus;
    abstractUrl = userTeam[0].abstractUrl;
    caseChoice = userTeam[0].caseChoice;
    documentStatus = userTeam[0].documentStatus; // NEW
    adminNotes = userTeam[0].adminNotes; // NEW
    participantNumber = userTeam[0].participantNumber || "PENDING";
    cbtPassword = userTeam[0].cbtPassword || "******";
    membersData = await db.select().from(teamMembers).where(eq(teamMembers.teamId, userTeam[0].id));
    membersData.sort((a, b) => Number(b.isLeader || false) - Number(a.isLeader || false));
  }

  let currentStep = 1;
  if (hasRegistered) {
    if (isPO) currentStep = isVerified ? 3 : (isPending ? 2.5 : 2);
    else {
       if (abstractStatus === "passed") currentStep = isVerified ? 3 : (isPending ? 2.5 : 2);
       else currentStep = 1; 
    }
  }

  const waGroupLinks = {
    "physics-olympiad": "https://chat.whatsapp.com/D5abGwkP7qyBzYRMA8s0aU",
    "science-project": "https://chat.whatsapp.com/B60UKcQMg2bGUBI3vzTOqH",
    "industrial-case": "https://chat.whatsapp.com/JqkSHzRxYRBFxuVmig1wMw",
  };

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full pt-16 sm:pt-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 w-full box-border gap-4">
          <div>
            <Link href="/" className="font-display font-bold text-2xl text-white tracking-widest hover:text-sunlight-orange transition-colors block mb-2">EUREKA! <span className="text-sunlight-orange">ITB 2026</span></Link>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">Official Participant Portal</h1>
          </div>
          <div className="flex gap-4 sm:gap-6 items-center w-full md:w-auto justify-between md:justify-end">
            <Link href="/" className="text-silver-shine hover:text-white transition-colors text-sm font-semibold">← Homepage</Link>
            <LogoutButton/>
          </div>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="relative z-10 w-full md:w-2/3 flex items-center justify-between">
            <div className="flex flex-col items-center gap-2 w-1/3 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 1 ? "bg-sunlight-orange border-sunlight-orange text-blue-marine" : "border-white/20 text-white/40"}`}><FileText size={18} /></div>
              <span className={`text-xs font-semibold ${currentStep >= 1 ? "text-sunlight-orange" : "text-white/40"}`}>{(isSPC || isICC) ? "Registration & Abstract" : "Team Profile"}</span>
            </div>
            <div className={`flex-1 h-0.5 -mt-6 transition-colors ${currentStep >= 2 ? "bg-sunlight-orange" : "bg-white/10"}`}></div>
            <div className="flex flex-col items-center gap-2 w-1/3 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 2 ? (isPending ? "bg-yellow-500 border-yellow-500 text-black" : "bg-sunlight-orange border-sunlight-orange text-blue-marine") : "bg-blue-marine border-white/20 text-white/40"}`}>{isPending ? <Clock size={18} /> : <CreditCard size={18} />}</div>
              <span className={`text-xs font-semibold ${currentStep >= 2 ? (isPending ? "text-yellow-500" : "text-sunlight-orange") : "text-white/40"}`}>{isPending ? "Admin Verification" : "Payment"}</span>
            </div>
            <div className={`flex-1 h-0.5 -mt-6 transition-colors ${currentStep >= 3 ? "bg-sunlight-orange" : "bg-white/10"}`}></div>
            <div className="flex flex-col items-center gap-2 w-1/3 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 3 ? "bg-green-400 border-green-400 text-blue-marine" : "bg-blue-marine border-white/20 text-white/40"}`}><CheckCircle2 size={18} /></div>
              <span className={`text-xs font-semibold ${currentStep >= 3 ? "text-green-400" : "text-white/40"}`}>Officially Registered</span>
            </div>
          </div>
        </div>

        {!hasRegistered ? (
          <div className="bg-white/5 border border-white/10 p-8 sm:p-16 rounded-3xl text-center backdrop-blur-sm w-full box-border border-dashed">
            <Trophy className="w-12 h-12 text-sunlight-orange mx-auto mb-6" />
            <Link href="/dashboard/register-lomba" className="inline-block bg-sunlight-orange text-blue-marine font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition-transform shadow-xl text-sm mt-4">Fill Team Registration Form</Link>
          </div>
        ) : (
          <div className="flex flex-col w-full box-border">
            
            {/* NEW: BANNER CATATAN REVISI BERKAS DARI ADMIN */}
            {documentStatus === "revision" && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-5 sm:p-6 rounded-3xl w-full mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                   <AlertCircle className="text-yellow-500 shrink-0 mt-1 sm:mt-0" size={36} />
                   <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-yellow-500 mb-2">Revisi Berkas Diperlukan!</h3>
                      <p className="text-sm text-silver-shine mb-3">Admin menemukan ketidaksesuaian pada berkas pendaftaran tim kamu. Silakan perbaiki dan lengkapi data sesuai catatan berikut:</p>
                      <div className="bg-black/30 p-4 rounded-xl border border-white/10 text-sm text-white italic border-l-4 border-l-yellow-500">
                        {adminNotes || "Tidak ada catatan."}
                      </div>
                   </div>
                   <Link href="/dashboard/register-lomba" className="mt-2 sm:mt-0 bg-yellow-500 text-black font-bold px-6 py-3.5 rounded-xl text-sm hover:bg-yellow-400 transition-colors shrink-0 whitespace-nowrap shadow-lg">
                      Buka Form Edit Data
                   </Link>
                </div>
            )}

            {(isSPC || isICC) && abstractStatus === "waiting" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full box-border mb-8">
                <div className="flex flex-col gap-4">
                  <div className="bg-white/5 p-1 rounded-3xl shadow-xl relative overflow-hidden group grayscale-[50%] opacity-80 border border-white/10">
                    <div className="bg-blue-marine/95 w-full h-full rounded-[22px] p-6 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute right-4 top-4 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                        ABSTRACT SELECTION
                      </div>
                      <div className="mt-6">
                        <p className="text-[10px] font-bold text-silver-shine uppercase tracking-widest mb-1">Team Name</p>
                        <h3 className="font-display text-2xl font-bold text-white mb-6 break-words">{userTeam[0].teamName}</h3>
                        <div className="space-y-3 text-xs mb-4">
                          <div>
                            <p className="text-silver-shine">Category</p>
                            <p className="font-bold text-white uppercase">{compeTypeSlug.replace(/-/g, " ")}</p>
                          </div>
                          <div>
                            <p className="text-silver-shine">Institution</p>
                            <p className="font-bold text-white">{userTeam[0].institutionName}</p>
                          </div>
                          {caseChoice && (
                            <div>
                              <p className="text-silver-shine">Case Choice</p>
                              <p className="font-bold text-sunlight-orange">{caseChoice}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full text-center border border-white/20 bg-black/40 text-silver-shine font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-not-allowed">
                    <Lock size={16}/> Data Registrasi Terkunci
                  </div>
                  
                  {isICC && (
                    <a href={waGroupLinks[compeTypeSlug as keyof typeof waGroupLinks]} target="_blank" rel="noreferrer" className="w-full bg-green-500/20 border border-green-500/40 text-green-400 font-bold py-3.5 rounded-xl hover:bg-green-500/30 transition-colors text-sm shadow-md flex items-center justify-center gap-2">
                      <MessageCircle size={18}/> Join WhatsApp Group
                    </a>
                  )}
                </div>

                <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden shadow-2xl flex flex-col justify-center items-center">
                  <AbstractPortalClient 
                    currentUrl={abstractUrl} 
                    compeType={compeTypeSlug} 
                    currentCase={caseChoice} 
                  />
                </div>
              </div>
            )}

            {(isSPC || isICC) && abstractStatus !== "waiting" && !isVerified && (
              <div className={`p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full mb-8 relative overflow-hidden transition-all ${
                abstractStatus === "passed" 
                ? "bg-gradient-to-br from-sunlight-orange/10 to-yellow-600/5 border-2 border-sunlight-orange shadow-[0_0_30px_rgba(255,183,3,0.15)]" 
                : "bg-black/30 border border-white/10 shadow-none grayscale-[20%]"
              }`}>
                {abstractStatus === "passed" && <SuccessConfetti />}
                
                <div className={`p-4 rounded-full shrink-0 relative z-10 ${abstractStatus === "passed" ? "bg-sunlight-orange/20 text-sunlight-orange" : "bg-white/5 text-silver-shine"}`}>
                  {abstractStatus === "passed" ? <Trophy size={32} /> : <AlertCircle size={32} />}
                </div>
                <div className="relative z-10">
                  <h3 className={`font-display text-xl sm:text-2xl font-bold mb-2 ${abstractStatus === "passed" ? "text-sunlight-orange" : "text-white/60"}`}>
                    {abstractStatus === "passed" ? "Abstract Selection Passed!" : "Abstract Selection Update"}
                  </h3>
                  <p className={abstractStatus === "passed" ? "text-white text-sm leading-relaxed" : "text-silver-shine text-sm leading-relaxed"}>
                    {abstractStatus === "passed"
                      ? "Congratulations! Your team's abstract has been evaluated and meets the qualification standards. Please proceed to the administration payment stage below to secure your slot."
                      : "We apologize, but your team did not pass the abstract selection phase. Keep your spirits up and thank you for participating in EUREKA ITB 2026!"}
                  </p>
                </div>
              </div>
            )}

            {(!isVerified && (isPO || ((isSPC || isICC) && abstractStatus !== "waiting"))) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full box-border mb-8">
                <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col justify-between">
                  <div>
                    <p className="text-silver-shine text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Users size={16}/> Registration Data</p>
                    <h3 className="font-display text-2xl font-bold text-white mb-6">{userTeam[0].teamName}</h3>
                    <div className="space-y-4 text-sm bg-black/20 p-5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center border-b border-white/10 pb-3 gap-2">
                        <span className="text-silver-shine">Category</span><span className="font-semibold capitalize text-sunlight-orange text-right">{compeTypeSlug.replace(/-/g, " ")}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 gap-2">
                        <span className="text-silver-shine">Institution</span><span className="font-semibold text-right">{userTeam[0].institutionName}</span>
                      </div>
                    </div>
                  </div>
                  
                  {userTeam[0].statusPayment === "unpaid" ? (
                    <Link href="/dashboard/register-lomba" className="w-full text-center border-2 border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors text-sm mt-6 block">
                      Edit Registration Data
                    </Link>
                  ) : (
                    <div className="w-full text-center border border-white/10 bg-black/20 text-silver-shine font-bold py-3 rounded-xl text-sm mt-6 flex items-center justify-center gap-2">
                      <Lock size={16}/> Profile Locked
                    </div>
                  )}

                  {isICC && (
                    <a href={waGroupLinks[compeTypeSlug as keyof typeof waGroupLinks]} target="_blank" rel="noreferrer" className="w-full bg-green-500/20 border border-green-500/40 text-green-400 font-bold py-3 rounded-xl hover:bg-green-500/30 transition-colors text-sm mt-4 flex items-center justify-center gap-2">
                      <MessageCircle size={16}/> Join WhatsApp Group
                    </a>
                  )}
                </div>

                <div className={`border p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col justify-between relative overflow-hidden ${isPending ? "bg-yellow-500/10 border-yellow-500/30" : "bg-white/5 border-white/10"}`}>
                  <div className="relative z-10">
                    <h3 className="font-display text-xl font-bold mb-4 text-white flex items-center gap-2">
                      <CreditCard className={isPending ? "text-yellow-500" : "text-silver-shine"} size={24}/> Administration
                    </h3>
                    
                    {abstractStatus === "failed" ? (
                      <>
                        <p className="text-sm text-silver-shine mb-6">
                          Administration is locked because your team did not pass the abstract selection.
                        </p>
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm flex items-center justify-between">
                           <span className="text-sm font-semibold">Status:</span>
                           <span className="text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider bg-red-500/20 text-red-400">
                             SELECTION FAILED
                           </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-silver-shine mb-6">
                          {isPending ? "Payment receipt received. The Treasurer is validating the bank mutation." : "Complete the administration payment to secure your slot."}
                        </p>
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm flex items-center justify-between">
                           <span className="text-sm font-semibold">Status:</span>
                           <span className={`text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider ${isPending ? "bg-yellow-500/20 text-yellow-500" : "bg-white/10 text-white"}`}>
                             {isPending ? "Pending Verification" : "Unpaid"}
                           </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {abstractStatus !== "failed" && (
                    <Link 
                      href="/dashboard/payment" 
                      className={`w-full block text-center font-bold py-4 rounded-xl transition-all shadow-lg text-sm relative z-10 mt-6 ${isPending ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" : "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"}`}
                    >
                      {isPending ? "View Invoice Ticket" : "Open Payment Portal"}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {isVerified && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                <div className="lg:col-span-1 flex flex-col gap-4">
                  <div className="bg-gradient-to-br from-sunlight-orange to-yellow-600 p-1 rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="bg-blue-marine/90 w-full h-full rounded-[22px] p-6 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                        <QrCode size={150} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-sunlight-orange uppercase tracking-widest mb-1 flex items-center justify-between">
                          Official Participant
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded-md text-[8px] tracking-normal">VERIFIED</span>
                        </p>
                        <h3 className="font-display text-2xl font-bold text-white mb-6 break-words mt-2">{userTeam[0].teamName}</h3>
                        <div className="space-y-3 text-xs mb-8">
                          <div>
                            <p className="text-silver-shine">Category</p>
                            <p className="font-bold text-white uppercase">{compeTypeSlug.replace(/-/g, " ")}</p>
                          </div>
                          <div>
                            <p className="text-silver-shine">Institution</p>
                            <p className="font-bold text-white">{userTeam[0].institutionName}</p>
                          </div>
                        </div>
                      </div>
                      {isPO && (
                        <div className="pt-4 border-t border-white/20">
                          <p className="text-[10px] text-silver-shine mb-1">Registration Number:</p>
                          <p className="font-mono text-xl font-bold text-white tracking-widest">{participantNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <a href={waGroupLinks[compeTypeSlug as keyof typeof waGroupLinks]} target="_blank" rel="noreferrer" className="w-full bg-green-500/20 border border-green-500/40 text-green-400 font-bold py-3.5 rounded-xl hover:bg-green-500/30 transition-colors text-sm shadow-md flex items-center justify-center gap-2">
                    <MessageCircle size={18}/> Join WhatsApp Group
                  </a>
                </div>

                {isPO && (
                  <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden shadow-2xl">
                    <h2 className="font-display text-2xl font-bold text-white mb-6">Competition Portal</h2>
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-900/40 to-black/40 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-2">Preliminary & Semifinal: CBT Platform</h3>
                        <p className="text-sm text-silver-shine mb-4">Use the credentials below to access the external EUREKA exam platform.</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10"><p className="text-[10px] uppercase text-silver-shine">User:</p><p className="font-mono font-bold">{participantNumber}</p></div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10"><p className="text-[10px] uppercase text-silver-shine">Pass:</p><p className="font-mono font-bold">{cbtPassword}</p></div>
                        </div>
                        <a href="https://cbt.indolat.com" target="_blank" rel="noreferrer" className="block text-center bg-sunlight-orange text-blue-marine font-bold py-3 rounded-xl text-sm transition-colors hover:bg-yellow-400">Enter Exam Platform</a>
                      </div>
                    </div>
                  </div>
                )}

                {(isSPC || isICC) && (
                  <div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden shadow-2xl text-center flex flex-col justify-center">
                    <FileText size={40} className="text-sunlight-orange mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-bold text-white mb-2">Full Paper Submission Portal</h2>
                    <p className="text-sm text-silver-shine mb-6 max-w-lg mx-auto">
                      Congratulations! You are officially registered as a Finalist. Please upload your Full Paper and presentation according to the Guidebook schedule.
                    </p>
                    <Link href={`/competition/${compeTypeSlug}`} className="inline-block bg-white/10 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors hover:bg-white/20 border border-white/20">
                      Open Submission Room
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm w-full">
              <h3 className="font-display text-lg font-bold mb-6 text-white border-b border-white/10 pb-4">Team Members Structure</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {membersData.map((member, index) => (
                  <div key={member.id} className="bg-black/20 border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${member.isLeader ? "bg-sunlight-orange/20 text-sunlight-orange" : "bg-white/10 text-silver-shine"}`}>
                        {member.isLeader ? "★ Leader" : `Member ${index}`}
                      </span>
                    </div>
                    <div className="flex gap-4 items-center">
                      {member.photoUrl ? (
                        <Image src={member.photoUrl || ""} alt="Foto" width={64} height={80} unoptimized className="w-16 h-20 object-cover rounded-lg border border-white/20 shrink-0" />
                      ) : (
                        <div className="w-16 h-20 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] text-white/40 text-center p-1 shrink-0">No Photo</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{member.fullName}</p>
                        <p className="text-xs text-silver-shine truncate mt-1">{member.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}