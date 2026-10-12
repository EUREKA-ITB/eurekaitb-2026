import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, FileText, UploadCloud } from "lucide-react";
import SubmissionClient from "./SubmissionClient"; 

export const dynamic = "force-dynamic";

export default async function SubmissionPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0) redirect("/login");

  const userTeam = await db.select().from(teams).where(eq(teams.userId, dbUser[0].id)).limit(1);
  if (userTeam.length === 0) redirect("/dashboard/register-lomba");

  const team = userTeam[0];
  const isVerified = team.statusPayment === "verified";
  const isFinalist = team.abstractStatus === "passed" && isVerified;

  if (!isFinalist) {
    redirect("/dashboard");
  }

  const compeTypeSlug = team.compeType.replace(/_/g, "-");
  const existingSubmissionUrl = team.fullPaperUrl || null;

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden w-full">
      <div className="max-w-5xl mx-auto w-full pt-16 sm:pt-20">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-silver-shine hover:text-white transition-colors text-sm font-semibold mb-8">
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>

        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden w-full">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden sm:block">
            <FileText size={200} />
          </div>
          
          <div className="relative z-10 text-center w-full">
            <UploadCloud size={64} className="text-sunlight-orange mx-auto mb-6" />
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-white mb-4">
              {compeTypeSlug === "industrial-case" ? "Full Report Submission" : "Full Paper Submission"}
            </h1>
            <p className="text-silver-shine text-sm leading-relaxed max-w-2xl mx-auto mb-10">
              Selamat! Tim <span className="font-bold text-white">{team.teamName}</span> telah resmi menjadi semifinalis. Silakan unggah dokumen <strong>{compeTypeSlug === "industrial-case" ? "Full Report" : "Full Paper"}</strong> Anda pada portal di bawah ini.
            </p>

            <SubmissionClient teamId={team.id} compeType={compeTypeSlug} initialUrl={existingSubmissionUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}