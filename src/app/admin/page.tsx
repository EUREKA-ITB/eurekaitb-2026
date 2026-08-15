import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, teams, documents, teamMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import AdminTable from "./AdminTable"; 
import LogoutButton from "@/components/LogoutButton";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0 || (dbUser[0].role !== "admin" && dbUser[0].role !== "admin_se")) {
    redirect("/dashboard"); 
  }

  const allTeams = await db.select().from(teams);
  const allDocs = await db.select().from(documents);
  const allMembers = await db.select().from(teamMembers); 

  const teamsWithDetails = allTeams.map((team) => {
    const doc = allDocs.find((d) => d.teamId === team.id);

    const members = allMembers.filter((m) => m.teamId === team.id).map(m => ({
      id: m.id,
      fullName: m.fullName,
      email: m.email,
      phoneNumber: m.phoneNumber,
      isLeader: m.isLeader,
      grade: m.grade,
      photoUrl: m.photoUrl,
      ktmUrl: m.ktmUrl,
      proofFollowUrl: m.proofFollowUrl,
      proofShareUrl: m.proofShareUrl,
      proofStoryCompeUrl: m.proofStoryCompeUrl, // URL BARU
      proofTwibbonUrl: m.proofTwibbonUrl, // URL BARU
      igAccountLink: m.igAccountLink
    }));

    const leader = members.find((m) => m.isLeader) || members[0];

    return { 
      id: team.id,
      teamName: team.teamName,
      institutionName: team.institutionName,
      compeType: team.compeType,
      statusPayment: team.statusPayment,
      abstractStatus: team.abstractStatus,
      abstractUrl: team.abstractUrl,
      caseChoice: team.caseChoice,
      document: { 
        urlPayment: doc?.urlPayment || null 
      },
      leaderContact: {
        name: leader?.fullName || "-",
        email: leader?.email || "-",
        phone: leader?.phoneNumber || "-"
      },
      members: members,
      verifiedBy: team.verifiedBy || null,
      participantNumber: team.participantNumber || null,
      cbtPassword: team.cbtPassword || null
    };
  });

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden pt-28">
      <div className="max-w-7xl mx-auto w-full">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-red-500/30 pb-6">
          <div>
            <div className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              Administrator Mode
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">
              EUREKA 2026 Registrant Data
            </h1>
            <p className="text-silver-shine text-sm">Participant verification and validation center.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4 items-center">
            <Link 
              href="/dashboard" 
              className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              Participant Mode
            </Link>
            <LogoutButton /> 
          </div>
        </header>

        <AdminTable initialData={teamsWithDetails} />

      </div>
    </div>
  );
}