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
    <main className="min-h-screen overflow-x-hidden bg-blue-marine px-4 pb-12 pt-24 text-white sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sunlight-orange">
              Admin · SPC & ICC
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Seleksi dan Progres Kompetisi
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-silver-shine">
              Cari tim, tinjau abstrak dan submission, lalu tetapkan hasil akhir.
            </p>
          </div>

          <a
            href="/admin"
            className="inline-flex w-fit rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Kembali ke Admin utama
          </a>
        </header>

        <CompetitionWorkflowTable initialTeams={initialTeams} />
      </div>
    </main>
  );
}