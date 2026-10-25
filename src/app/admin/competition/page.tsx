import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import CompetitionWorkflowTable from "./CompetitionWorkflowTable";

export const dynamic = "force-dynamic";

export default async function CompetitionWorkflowPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const [admin] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!admin || (admin.role !== "admin" && admin.role !== "admin_se")) {
    redirect("/dashboard");
  }

  const rows = await db.select().from(teams);

  const initialTeams = rows
    .filter(
      (team) =>
        team.compeType === "science-project" ||
        team.compeType === "industrial-case"
    )
    .map((team) => ({
      id: team.id,
      teamName: team.teamName,
      compeType: team.compeType,
      abstractUrl: team.abstractUrl,
      abstractStatus: team.abstractStatus,
      statusPayment: team.statusPayment,
      fullPaperUrl: team.fullPaperUrl,
      submissionStatus: team.submissionStatus,
      submissionNotes: team.submissionNotes,
      posterUrl: team.posterUrl,
      posterStatus: team.posterStatus,
      posterNotes: team.posterNotes,
      presentationUrl: team.presentationUrl,
      presentationStatus: team.presentationStatus,
      presentationNotes: team.presentationNotes,
      resultStatus: team.resultStatus,
      resultNotes: team.resultNotes,
    }));

  return (
    <main className="box-border min-h-screen overflow-x-hidden bg-blue-marine px-4 pb-12 pt-28 font-sans text-white sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-red-500/30 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <span className="mb-3 inline-flex rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              Administrator Mode · SPC & ICC
            </span>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Progres Kompetisi
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-silver-shine">
              Tinjau abstrak dan berkas kompetisi, lalu tetapkan hasil akhir
              setiap tim.
            </p>
          </div>

          <a
            href="/admin"
            className="inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Kembali ke Admin utama
          </a>
        </header>

        <CompetitionWorkflowTable initialTeams={initialTeams} />
      </div>
    </main>
  );
}