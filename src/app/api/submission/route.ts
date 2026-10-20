import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { getOwnedTeam } from "@/lib/owned-team";

type SubmissionType = "fullPaper" | "poster" | "presentation";

const submissionFields = {
  fullPaper: {
    url: teams.fullPaperUrl,
    status: teams.submissionStatus,
    notes: teams.submissionNotes,
  },
  poster: {
    url: teams.posterUrl,
    status: teams.posterStatus,
    notes: teams.posterNotes,
  },
  presentation: {
    url: teams.presentationUrl,
    status: teams.presentationStatus,
    notes: teams.presentationNotes,
  },
};

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Data submission tidak valid." }, { status: 400 });
    }

    const payload = body as {
      teamId?: unknown;
      type?: unknown;
      paperUrl?: unknown;
    };

    const teamId = typeof payload.teamId === "string" ? payload.teamId.trim() : "";
    const type = payload.type;
    const paperUrl = typeof payload.paperUrl === "string" ? payload.paperUrl.trim() : "";

    if (
      !teamId ||
      !paperUrl ||
      (type !== "fullPaper" && type !== "poster" && type !== "presentation")
    ) {
      return NextResponse.json({ error: "Data submission belum lengkap." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(paperUrl);
    } catch {
      return NextResponse.json({ error: "URL dokumen tidak valid." }, { status: 400 });
    }

    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "URL dokumen harus menggunakan HTTPS." }, { status: 400 });
    }

    const owned = await getOwnedTeam(teamId);
    if ("error" in owned) {
      return NextResponse.json({ error: owned.error }, { status: owned.status });
    }

    const { team } = owned;
    const isSPC = team.compeType === "science-project";
    const isICC = team.compeType === "industrial-case";

    if (!isSPC && !isICC) {
      return NextResponse.json({ error: "Kategori ini tidak memiliki tahap submission." }, { status: 403 });
    }

    if (isICC && type !== "fullPaper") {
      return NextResponse.json({ error: "ICC hanya memiliki submission full report." }, { status: 400 });
    }

    if (team.abstractStatus !== "passed" || team.statusPayment !== "verified") {
      return NextResponse.json(
        { error: "Tim harus lolos abstrak dan pembayaran harus terverifikasi." },
        { status: 403 }
      );
    }

    const deadline =
      team.compeType === "science-project"
        ? new Date("2026-10-23T23:59:59+07:00")
        : new Date("2026-11-07T23:59:59+07:00");

    if (Date.now() > deadline.getTime()) {
      return NextResponse.json({ error: "Batas waktu submission telah berakhir." }, { status: 403 });
    }

    const fields = submissionFields[type];
    const [currentTeam] = await db
      .select({
        url: fields.url,
        status: fields.status,
      })
      .from(teams)
      .where(eq(teams.id, team.id))
      .limit(1);

    if (
      currentTeam.status !== "not_submitted" &&
      currentTeam.status !== "revision"
    ) {
      return NextResponse.json(
        { error: "Submission sedang diperiksa atau sudah dikunci." },
        { status: 409 }
      );
    }

    await db
      .update(teams)
      .set({
        [type === "fullPaper"
          ? "fullPaperUrl"
          : type === "poster"
            ? "posterUrl"
            : "presentationUrl"]: paperUrl,
        [type === "fullPaper"
          ? "submissionStatus"
          : type === "poster"
            ? "posterStatus"
            : "presentationStatus"]: "submitted",
        [type === "fullPaper"
          ? "submissionNotes"
          : type === "poster"
            ? "posterNotes"
            : "presentationNotes"]: null,
      })
      .where(eq(teams.id, team.id));

    return NextResponse.json({ success: true, status: "submitted" });
  } catch (error) {
    console.error("Submission API error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}