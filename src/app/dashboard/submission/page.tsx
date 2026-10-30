import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, UploadCloud } from "lucide-react";
import SubmissionClient from "./SubmissionClient";

export const dynamic = "force-dynamic";

export default async function SubmissionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!dbUser) {
    redirect("/login");
  }

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.userId, dbUser.id))
    .limit(1);

  if (!team) {
    redirect("/dashboard/register-lomba");
  }

  const compeType = team.compeType.replace(/_/g, "-");
  const isSupportedCompetition =
    compeType === "science-project" || compeType === "industrial-case";
  const isEligible =
    team.abstractStatus === "passed" && team.statusPayment === "verified";

  if (!isSupportedCompetition || !isEligible) {
    redirect("/dashboard");
  }

  const isICC = compeType === "industrial-case";

  return (
    <div className="box-border min-h-screen w-full overflow-x-hidden bg-blue-marine p-4 font-sans text-white sm:p-8 md:p-12">
      <div className="mx-auto w-full max-w-5xl pt-16 sm:pt-20">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-silver-shine transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </Link>

        <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-2xl sm:p-12">
          <div className="relative z-10 w-full text-center">
            <UploadCloud
              size={64}
              className="mx-auto mb-6 text-sunlight-orange"
            />

            <h1 className="mb-4 font-display text-2xl font-bold text-white sm:text-4xl">
              {isICC ? "Full Report Submission" : "Full Paper Submission"}
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-sm leading-relaxed text-silver-shine">
              Tim <span className="font-bold text-white">{team.teamName}</span>{" "}
              telah memenuhi syarat untuk mengirim{" "}
              <strong>{isICC ? "Full Report" : "Full Paper"}</strong>.
            </p>

            <SubmissionClient
              key={`${team.id}:${team.submissionStatus}:${team.fullPaperUrl ?? ""}:${team.submissionNotes ?? ""}`}
              teamId={team.id}
              compeType={compeType}
              initialUrl={team.fullPaperUrl || null}
              initialStatus={team.submissionStatus}
              initialNotes={team.submissionNotes || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}