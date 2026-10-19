import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { teams, users } from "@/db/schema";

const abstractStatuses = ["waiting", "passed", "failed"] as const;
const submissionStatuses = ["revision", "accepted", "rejected"] as const;
const resultStatuses = ["finalist", "winner", "not_selected"] as const;

type SubmissionType = "fullPaper" | "poster" | "presentation";

function isOneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T
): value is T[number] {
  return typeof value === "string" && allowed.includes(value);
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [admin] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!admin || (admin.role !== "admin" && admin.role !== "admin_se")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    }

    const payload = body as {
      teamId?: unknown;
      target?: unknown;
      type?: unknown;
      status?: unknown;
      notes?: unknown;
    };

    const teamId = typeof payload.teamId === "string" ? payload.teamId : "";
    const notes = typeof payload.notes === "string" ? payload.notes.trim() : null;

    if (!teamId || typeof payload.target !== "string") {
      return NextResponse.json({ error: "Data wajib belum lengkap." }, { status: 400 });
    }

    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (!team) {
      return NextResponse.json({ error: "Tim tidak ditemukan." }, { status: 404 });
    }

    const isSPC = team.compeType === "science-project";
    const isICC = team.compeType === "industrial-case";

    if (!isSPC && !isICC) {
      return NextResponse.json({ error: "Fitur ini hanya untuk SPC dan ICC." }, { status: 400 });
    }

    if (payload.target === "abstract") {
      if (!isOneOf(payload.status, abstractStatuses)) {
        return NextResponse.json({ error: "Status abstrak tidak valid." }, { status: 400 });
      }

      await db
        .update(teams)
        .set({ abstractStatus: payload.status })
        .where(eq(teams.id, team.id));

      return NextResponse.json({ success: true });
    }

    if (payload.target === "submission") {
      if (
        payload.type !== "fullPaper" &&
        payload.type !== "poster" &&
        payload.type !== "presentation"
      ) {
        return NextResponse.json({ error: "Jenis submission tidak valid." }, { status: 400 });
      }

      const type = payload.type as SubmissionType;

      if (isICC && type !== "fullPaper") {
        return NextResponse.json({ error: "ICC hanya memiliki full report." }, { status: 400 });
      }

      if (!isOneOf(payload.status, submissionStatuses)) {
        return NextResponse.json({ error: "Status submission tidak valid." }, { status: 400 });
      }

      if (team.abstractStatus !== "passed" || team.statusPayment !== "verified") {
        return NextResponse.json({ error: "Tim belum memenuhi syarat review." }, { status: 409 });
      }

      const url =
        type === "fullPaper"
          ? team.fullPaperUrl
          : type === "poster"
            ? team.posterUrl
            : team.presentationUrl;

      if (!url) {
        return NextResponse.json({ error: "Berkas belum dikumpulkan." }, { status: 409 });
      }

      if ((payload.status === "revision" || payload.status === "rejected") && !notes) {
        return NextResponse.json({ error: "Catatan wajib diisi untuk revisi atau penolakan." }, { status: 400 });
      }

      const updates =
        type === "fullPaper"
          ? { submissionStatus: payload.status, submissionNotes: notes }
          : type === "poster"
            ? { posterStatus: payload.status, posterNotes: notes }
            : { presentationStatus: payload.status, presentationNotes: notes };

      await db.update(teams).set(updates).where(eq(teams.id, team.id));

      return NextResponse.json({ success: true });
    }

    if (payload.target === "result") {
      if (!isOneOf(payload.status, resultStatuses)) {
        return NextResponse.json({ error: "Hasil akhir tidak valid." }, { status: 400 });
      }

      const allRequiredSubmissionsAccepted =
        team.submissionStatus === "accepted" &&
        (isICC ||
          (team.posterStatus === "accepted" &&
            team.presentationStatus === "accepted"));

      if (!allRequiredSubmissionsAccepted) {
        return NextResponse.json(
          { error: "Semua submission wajib diterima sebelum hasil akhir ditetapkan." },
          { status: 409 }
        );
      }

      await db
        .update(teams)
        .set({ resultStatus: payload.status, resultNotes: notes })
        .where(eq(teams.id, team.id));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Target update tidak valid." }, { status: 400 });
  } catch (error) {
    console.error("Admin competition API error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}