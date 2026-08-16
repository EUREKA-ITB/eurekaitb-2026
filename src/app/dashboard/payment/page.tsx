import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, teams, teamMembers, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, Lock, ShieldCheck, Wallet, Building, Download } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import PaymentUploader from "./PaymentUploader";
import { getPrice, formatIDR, PHASE_NAMES } from "@/lib/competition-config";
import type { CompeType, Phase } from "@/lib/competition-config";
import Image from "next/image";

export default async function PaymentPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0) redirect("/login");

  const userTeam = await db.select().from(teams).where(eq(teams.userId, dbUser[0].id)).limit(1);
  if (userTeam.length === 0) redirect("/dashboard/register-lomba");

  const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, userTeam[0].id));
  const leader = members.find(m => m.isLeader);
  
  const userDocs = await db.select().from(documents).where(eq(documents.teamId, userTeam[0].id)).limit(1);
  const existingPaymentUrl = userDocs.length > 0 ? userDocs[0].urlPayment : null;
  
  const teamPhase = userTeam[0].registrationPhase as Phase;
  const phaseName = PHASE_NAMES[teamPhase];
  
  // NORMALISASI: Ubah underscore dari DB menjadi hyphen agar terbaca oleh config
  const normalizedCompeType = userTeam[0].compeType.replace(/_/g, "-") as CompeType;
  const basePrice = getPrice(normalizedCompeType, teamPhase);
  
  const uniqueCode = parseInt((leader?.phoneNumber || "000").slice(-3)) || 0; 
  const totalPayment = basePrice + uniqueCode;

  const isPending = userTeam[0].statusPayment === "pending";
  const isVerified = userTeam[0].statusPayment === "verified";

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden">
      <div className="max-w-5xl mx-auto w-full pt-20">
        
        <Link href="/dashboard" className="text-silver-shine hover:text-white transition-colors text-sm font-semibold mb-6 inline-block print:hidden">
          ← Return to Dashboard
        </Link>

        {isVerified ? (
          <div className="bg-white text-blue-marine rounded-3xl p-8 sm:p-12 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <ShieldCheck size={400} />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-6 mb-8 gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold text-sunlight-orange">EUREKA<span className="text-blue-marine">2026</span></h1>
                  <p className="text-sm font-semibold text-gray-500">Official Payment Receipt</p>
                </div>
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 size={18} /> PAID & VERIFIED
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Received From:</p>
                  <p className="font-bold text-lg">{userTeam[0].teamName}</p>
                  <p className="text-sm text-gray-600">{userTeam[0].institutionName}</p>
                  <p className="text-sm text-gray-600">{leader?.fullName} ({leader?.phoneNumber})</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Reference ID:</p>
                  <p className="font-mono font-bold text-gray-800">{userTeam[0].id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                  <span className="font-semibold text-gray-700">Competition Category</span>
                  <span className="font-bold uppercase">{normalizedCompeType.replace(/-/g, " ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total Payment</span>
                  <span className="font-display font-bold text-2xl text-sunlight-orange">{formatIDR(totalPayment)}</span>
                </div>
              </div>

              <div className="text-center text-xs text-gray-400 mt-12 print:hidden">
                <p>Please save or print this page as a valid proof of payment.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-3 tracking-widest uppercase">
                  <Lock size={12} /> Secure Payment Gateway
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">Team Administration</h1>
                <p className="text-silver-shine text-sm max-w-lg">
                  Complete the payment to secure the slot and validate the participation of team <span className="font-bold text-white">{userTeam[0].teamName}</span>.
                </p>
              </div>
            </div>

            {isPending ? (
              <div className="bg-white/5 border border-sunlight-orange/50 rounded-3xl p-8 sm:p-12 backdrop-blur-sm text-center max-w-2xl mx-auto shadow-[0_0_30px_rgba(255,183,3,0.1)]">
                <Clock size={64} className="text-sunlight-orange mx-auto mb-6 animate-pulse" />
                <h2 className="font-display text-2xl font-bold text-white mb-2">Awaiting Treasurer Verification</h2>
                <p className="text-silver-shine text-sm mb-8 leading-relaxed">
                  Your transfer receipt has been received and is in the queue for bank mutation check. This process takes a maximum of 2x24 working hours.
                </p>
                <div className="bg-black/30 rounded-xl p-4 inline-block border border-white/10 mb-6 text-left">
                  <p className="text-xs text-silver-shine mb-1">Registration Reference Number:</p>
                  <p className="font-mono text-lg font-bold text-sunlight-orange tracking-widest uppercase">
                    {userTeam[0].id.substring(0, 8)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <CountdownTimer registeredAt={userTeam[0].createdAt || new Date()} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden h-max shadow-2xl">
                    <div className="absolute top-0 right-0 bg-sunlight-orange text-blue-marine text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                      Phase {phaseName}
                    </div>
                    <h2 className="font-display text-xl font-bold mb-6 border-b border-white/10 pb-4">Invoice Details</h2>
                    
                    <div className="space-y-4 mb-8 text-sm">
                      <div className="flex justify-between"><span className="text-silver-shine">Category</span><span className="font-semibold capitalize">{normalizedCompeType.replace(/-/g, " ")}</span></div>
                      <div className="flex justify-between"><span className="text-silver-shine">Base Ticket Price</span><span className="font-semibold">{formatIDR(basePrice)}</span></div>
                      <div className="flex justify-between items-center"><span className="text-silver-shine">System Unique Code</span><span className="font-semibold text-sunlight-orange font-mono bg-sunlight-orange/10 px-2 py-0.5 rounded">+{uniqueCode}</span></div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-marine to-black/40 p-5 rounded-xl border border-white/10 text-center mb-6 shadow-inner">
                      <p className="text-xs text-silver-shine mb-1">Total Amount to Transfer:</p>
                      <p className="text-4xl font-display font-bold text-sunlight-orange tracking-tight">{formatIDR(totalPayment)}</p>
                    </div>

                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 mb-8 flex gap-3 items-start">
                      <AlertCircle size={20} className="shrink-0 text-red-400 mt-0.5" />
                      <div className="text-xs text-red-100/80 leading-relaxed">
                        <span className="font-bold text-red-400 block mb-1">Automatic Mutation Check System!</span>
                        Transfer the exact amount up to the <span className="font-bold underline text-white">last 3 digits</span> to ensure smooth verification.
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-silver-shine mb-4 font-bold uppercase tracking-wider">Select Payment Method:</p>
                      
                      <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10 mb-4 hover:border-white/30 transition-colors">
                        <div className="bg-blue-600/20 text-blue-400 p-3 rounded-lg"><Building size={24} /></div>
                        <div>
                          <p className="font-bold text-white text-sm mb-1">Bank Transfer</p>
                          <p className="text-xs text-silver-shine mb-2">BRI / Blu BCA</p>
                          <div className="text-sm font-mono text-sunlight-orange mb-1">3287 0103 8671 537 <span className="text-xs text-silver-shine font-sans">(BRI)</span></div>
                          <p className="text-xs text-silver-shine mb-2">a.n. <span className="text-white font-semibold">Azizah Pribadi Istiqomah</span></p>
                          <div className="text-sm font-mono text-sunlight-orange mb-1">0025 5263 9906 <span className="text-xs text-silver-shine font-sans">(Blu)</span></div>
                          <p className="text-xs text-silver-shine mb-2">a.n. <span className="text-white font-semibold">Rizka Hasna Tiara</span></p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10 mb-4 hover:border-white/30 transition-colors">
                        <div className="bg-green-500/20 text-green-400 p-3 rounded-lg"><Wallet size={24} /></div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm mb-1">E-Wallet Transfer</p>
                          <p className="text-xs text-silver-shine mb-2">GoPay / ShopeePay / DANA</p>
                          <div className="text-sm font-mono text-sunlight-orange mb-2">0895632139070</div>
                          <p className="text-xs text-silver-shine">a.n. <span className="text-white font-semibold">Azizah Pribadi Istiqomah</span></p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 bg-white/5 p-6 rounded-xl border border-white/10 hover:border-white/30 transition-colors text-center sm:text-left">
                        <div className="bg-white p-3 rounded-xl shadow-lg w-full max-w-[220px] sm:w-[150px] sm:max-w-none flex flex-col items-center shrink-0">
                          <div className="w-full aspect-square border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 rounded-lg mb-3 overflow-hidden relative">
                            <Image 
                              src="/QRIS-EUREKA2026.jpg" 
                              alt="QRIS EUREKA 2026" 
                              width={200} 
                              height={200} 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <a href="/QRIS-EUREKA2026.jpg" download="QRIS-EUREKA2026.jpg" className="w-full flex items-center justify-center gap-2 bg-blue-marine text-white text-xs font-bold py-2.5 rounded-lg hover:bg-blue-900 transition-colors border border-blue-800">
                            <Download size={10} /> Download
                          </a>
                        </div>
                        <div className="flex-1 w-full">
                          <p className="text-sm text-silver-shine mb-2">Scan to Pay</p>
                          <p className="text-sm text-silver-shine">a.n. <span className="text-white font-semibold">EUREKA ITB 2026</span></p>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm flex flex-col shadow-2xl">
                     <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                        <h2 className="font-display text-xl font-bold">Payment Confirmation</h2>
                        <Lock size={18} className="text-green-400" />
                     </div>
                     <p className="text-silver-shine text-sm mb-6">Upload a clear transfer receipt or m-banking screenshot so the system can validate it.</p>
                     
                     <PaymentUploader teamId={userTeam[0].id} initialUrl={existingPaymentUrl} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}