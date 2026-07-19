import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, teams, documents, teamMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import AdminTable from "./AdminTable"; 
import LogoutButton from "@/components/LogoutButton"; // <-- Import LogoutButton

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  // PROTEKSI SUPER KETAT: Hanya akun admin
  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0 || dbUser[0].role !== "admin") {
    redirect("/dashboard"); 
  }

  // Tarik SEMUA data (Teams, Documents untuk Bukti Bayar, TeamMembers untuk KTM)
  const allTeams = await db.select().from(teams);
  const allDocs = await db.select().from(documents);
  const allMembers = await db.select().from(teamMembers); // <-- Tarik anggota tim

  // Gabungkan data dengan aman
  const teamsWithDocs = allTeams.map((team) => {
    // Cari bukti transfer (masih di tabel documents)
    const doc = allDocs.find((d) => d.teamId === team.id);
    
    // Cari KTM dari Ketua Tim di tabel teamMembers
    const leader = allMembers.find((m) => m.teamId === team.id && m.isLeader);

    return { 
      id: team.id,
      teamName: team.teamName,
      institutionName: team.institutionName,
      compeType: team.compeType,
      statusPayment: team.statusPayment,
      document: { 
        urlIdentitas: leader?.ktmUrl || null, // <-- Sekarang narik dari KTM Ketua
        urlPayment: doc?.urlPayment || null 
      } 
    };
  });

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden pt-28">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* HEADER ADMIN */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-red-500/30 pb-6">
          <div>
            <div className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
              Admin Mode
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">
              Data Pendaftar EUREKA 2026
            </h1>
            <p className="text-silver-shine text-sm">Akses penuh ke seluruh data peserta.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4 items-center">
            <Link 
              href="/dashboard" 
              className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              Mode Peserta
            </Link>
            
            {/* Pakai Tombol Instan, Bebas Boros Page */}
            <LogoutButton /> 
          </div>
        </header>

        {/* TABEL DATA */}
        <AdminTable initialData={teamsWithDocs} />

      </div>
    </div>
  );
}