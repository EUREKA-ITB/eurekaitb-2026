import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, teams, teamMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { CheckCircle2, Clock, CreditCard, FileText, Lock, QrCode, Trophy, Users } from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0) redirect("/login");

  const userTeam = await db.select().from(teams).where(eq(teams.userId, dbUser[0].id)).limit(1);
  const hasRegistered = userTeam.length > 0;

  // SOLUSI ERROR 'ANY': Mendefinisikan tipe data Drizzle secara eksplisit
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
  let participantNumber = "";
  let cbtPassword = "";

  if (hasRegistered) {
    isVerified = userTeam[0].statusPayment === "verified";
    isPending = userTeam[0].statusPayment === "pending";

    participantNumber = userTeam[0].participantNumber || "MENUNGGU VERIFIKASI";
    cbtPassword = userTeam[0].cbtPassword || "******";

    membersData = await db.select().from(teamMembers).where(eq(teamMembers.teamId, userTeam[0].id));
    
    // Urutkan agar ketua selalu di atas
    membersData.sort((a, b) => Number(b.isLeader || false) - Number(a.isLeader || false));
  }

  // Progress Bar Logic
  const currentStep = !hasRegistered ? 1 : (isVerified ? 3 : (isPending ? 2.5 : 2));

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full pt-16 sm:pt-20">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 w-full box-border gap-4">
          <div>
            <Link href="/" className="font-display font-bold text-2xl text-white tracking-widest hover:text-sunlight-orange transition-colors block mb-2">
              EUREKA! <span className="text-sunlight-orange">ITB 2026</span>
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">Portal Peserta Resmi</h1>
            <p className="text-silver-shine text-sm">Selamat datang, <span className="font-semibold text-white">{session.user.name}</span></p>
          </div>
          <div className="flex gap-4 sm:gap-6 items-center w-full md:w-auto justify-between md:justify-end">
            <Link href="/" className="text-silver-shine hover:text-white transition-colors text-sm font-semibold">← Ke Beranda</Link>
            <LogoutButton/>
          </div>
        </header>

        {/* PROGRESS TRACKER */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-sunlight-orange/10 blur-3xl rounded-full z-0 pointer-events-none"></div>
          
          <div className="relative z-10 w-full md:w-1/3">
            <h2 className="font-display text-xl font-bold text-white mb-2">Status Pendaftaran</h2>
            <p className="text-silver-shine text-sm">Ikuti alur untuk mendapatkan Nomor Peserta Resmi.</p>
          </div>

          <div className="relative z-10 w-full md:w-2/3 flex items-center justify-between">
            <div className="flex flex-col items-center gap-2 w-1/3 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 1 ? "bg-sunlight-orange border-sunlight-orange text-blue-marine" : "border-white/20 text-white/40"}`}><FileText size={18} /></div>
              <span className={`text-xs font-semibold ${currentStep >= 1 ? "text-sunlight-orange" : "text-white/40"}`}>Biodata Tim</span>
            </div>
            <div className={`flex-1 h-0.5 -mt-6 transition-colors ${currentStep >= 2 ? "bg-sunlight-orange" : "bg-white/10"}`}></div>
            
            <div className="flex flex-col items-center gap-2 w-1/3 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 2 ? (isPending ? "bg-yellow-500 border-yellow-500 text-black" : "bg-sunlight-orange border-sunlight-orange text-blue-marine") : "bg-blue-marine border-white/20 text-white/40"}`}>{isPending ? <Clock size={18} /> : <CreditCard size={18} />}</div>
              <span className={`text-xs font-semibold ${currentStep >= 2 ? (isPending ? "text-yellow-500" : "text-sunlight-orange") : "text-white/40"}`}>{isPending ? "Verifikasi Admin" : "Pembayaran"}</span>
            </div>
            <div className={`flex-1 h-0.5 -mt-6 transition-colors ${currentStep >= 3 ? "bg-sunlight-orange" : "bg-white/10"}`}></div>
            
            <div className="flex flex-col items-center gap-2 w-1/3 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 3 ? "bg-green-400 border-green-400 text-blue-marine" : "bg-blue-marine border-white/20 text-white/40"}`}><CheckCircle2 size={18} /></div>
              <span className={`text-xs font-semibold ${currentStep >= 3 ? "text-green-400" : "text-white/40"}`}>Terdaftar Resmi</span>
            </div>
          </div>
        </div>

        {!hasRegistered ? (
          <div className="bg-white/5 border border-white/10 p-8 sm:p-16 rounded-3xl text-center backdrop-blur-sm w-full box-border border-dashed">
            <Trophy className="w-12 h-12 text-sunlight-orange mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold mb-4">Mulai Perjalananmu</h2>
            <Link href="/dashboard/register-lomba" className="inline-block bg-sunlight-orange text-blue-marine font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition-transform shadow-xl text-sm mt-4">
              Isi Formulir Pendaftaran Tim
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8 w-full box-border">
            
            {/* KONDISI JIKA SUDAH VERIFIED: MUNCUL KARTU PESERTA & AKSES LOMBA */}
            {isVerified && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. KARTU TANDA PESERTA */}
                <div className="lg:col-span-1 bg-gradient-to-br from-sunlight-orange to-yellow-600 p-1 rounded-3xl shadow-2xl relative overflow-hidden group">
                  <div className="bg-blue-marine/90 w-full h-full rounded-[22px] p-6 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                      <QrCode size={150} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-sunlight-orange uppercase tracking-widest mb-1">Official Participant</p>
                      <h3 className="font-display text-2xl font-bold text-white mb-6 break-words">{userTeam[0].teamName}</h3>
                      <div className="space-y-3 text-xs mb-8">
                        <div>
                          <p className="text-silver-shine">Kategori Lomba</p>
                          <p className="font-bold text-white uppercase">{userTeam[0].compeType.replace("_", " ")}</p>
                        </div>
                        <div>
                          <p className="text-silver-shine">Asal Institusi</p>
                          <p className="font-bold text-white">{userTeam[0].institutionName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <p className="text-[10px] text-silver-shine mb-1">Nomor Registrasi:</p>
                      <p className="font-mono text-xl font-bold text-white tracking-widest">{participantNumber}</p>
                    </div>
                  </div>
                </div>

                {/* 2. AKSES RUANG KOMPETISI */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden shadow-2xl">
                  <h2 className="font-display text-2xl font-bold text-white mb-6">Portal Ruang Lomba</h2>
                  
                  {userTeam[0].compeType === "physics_olympiad" ? (
                    // TAMPILAN KHUSUS PHYSICS OLYMPIAD (SEKARANG CUMA ADA CBT)
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-900/40 to-black/40 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-2">Penyisihan & Semifinal: Platform Ujian CBT</h3>
                        <p className="text-sm text-silver-shine mb-4">Gunakan kredensial di bawah ini untuk mengakses platform ujian eksternal EUREKA.</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10"><p className="text-[10px] uppercase text-silver-shine">User:</p><p className="font-mono font-bold">{participantNumber}</p></div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10"><p className="text-[10px] uppercase text-silver-shine">Pass:</p><p className="font-mono font-bold">{cbtPassword}</p></div>
                        </div>
                        <a href="https://cbt.indolat.com" target="_blank" className="block text-center bg-sunlight-orange text-blue-marine font-bold py-3 rounded-xl text-sm transition-colors hover:bg-yellow-400">Masuk Platform Ujian</a>
                      </div>
                    </div>
                  ) : (
                    // TAMPILAN KHUSUS SP & ICC (SUBMISI BERKAS)
                    <div className="bg-black/30 border border-dashed border-white/20 rounded-2xl p-6 text-center">
                      <FileText size={40} className="text-silver-shine mb-4 mx-auto opacity-50" />
                      <p className="text-white font-bold mb-2">Portal Submisi Karya</p>
                      <p className="text-xs text-silver-shine mb-6 max-w-sm mx-auto">
                        Unggah dokumen teknis, proposal, atau laporan sesuai jadwal yang ditentukan.
                      </p>
                      <Link href={`/competition/${userTeam[0].compeType}/submit`} className="bg-sunlight-orange text-blue-marine font-bold px-6 py-3 rounded-xl text-sm transition-colors hover:bg-yellow-400">
                        Buka Ruang Submisi
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* KONDISI JIKA BELUM VERIFIED (UNPAID / PENDING) */}
            {!isVerified && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full box-border">
                {/* KARTU IDENTITAS SEMENTARA */}
                <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col justify-between">
                  <div>
                    <p className="text-silver-shine text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Users size={16}/> Data Pendaftaran</p>
                    <h3 className="font-display text-2xl font-bold text-white mb-6">{userTeam[0].teamName}</h3>
                    <div className="space-y-4 text-sm bg-black/20 p-5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center border-b border-white/10 pb-3 gap-2">
                        <span className="text-silver-shine">Lomba</span><span className="font-semibold capitalize text-sunlight-orange text-right">{userTeam[0].compeType.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 gap-2">
                        <span className="text-silver-shine">Institusi</span><span className="font-semibold text-right">{userTeam[0].institutionName}</span>
                      </div>
                    </div>
                  </div>
                  {userTeam[0].statusPayment === "unpaid" ? (
                    <Link href="/dashboard/register-lomba" className="w-full text-center border-2 border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors text-sm mt-6 block">
                      Edit Biodata Pendaftaran
                    </Link>
                  ) : (
                    <div className="w-full text-center border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 font-bold py-3 rounded-xl text-sm mt-6 flex items-center justify-center gap-2">
                      <Lock size={16}/> Biodata Terkunci (Sedang Diproses)
                    </div>
                  )}
                </div>

                {/* KARTU MENUJU PEMBAYARAN */}
                <div className={`border p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col justify-between relative overflow-hidden ${isPending ? "bg-yellow-500/10 border-yellow-500/30" : "bg-gradient-to-br from-white/5 to-sunlight-orange/10 border-white/10"}`}>
                  <div className="relative z-10">
                    <h3 className="font-display text-xl font-bold mb-4 text-white flex items-center gap-2">
                      <CreditCard className={isPending ? "text-yellow-500" : "text-sunlight-orange"} size={24}/> Administrasi
                    </h3>
                    <p className="text-sm text-silver-shine mb-6">
                      {isPending ? "Bukti transfer telah diterima. Bendahara sedang memvalidasi mutasi ke rekening resmi EUREKA." : "Segera lunasi administrasi untuk mengamankan slot peserta Anda."}
                    </p>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm flex items-center justify-between">
                       <span className="text-sm font-semibold">Status Tim:</span>
                       <span className={`text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider ${isPending ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-400"}`}>
                         {isPending ? "Menunggu Verifikasi" : "Belum Bayar"}
                       </span>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard/payment" 
                    className={`w-full block text-center font-bold py-4 rounded-xl transition-all shadow-lg text-sm relative z-10 mt-6 ${isPending ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" : "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"}`}
                  >
                    {isPending ? "Lihat Status / Tiket Invoice" : "Buka Portal Pembayaran"}
                  </Link>
                </div>
              </div>
            )}

            {/* DETAIL ANGGOTA TIM (Selalu Muncul di Bawah) */}
            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm w-full mt-2">
              <h3 className="font-display text-lg font-bold mb-6 text-white border-b border-white/10 pb-4">Struktur Anggota Tim</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {membersData.map((member, index) => (
                  <div key={member.id} className="bg-black/20 border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${member.isLeader ? "bg-sunlight-orange/20 text-sunlight-orange" : "bg-white/10 text-silver-shine"}`}>
                        {member.isLeader ? "★ Ketua" : `Anggota ${index}`}
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