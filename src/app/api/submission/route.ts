import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
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

const validStatuses = [
  "not_submitted",
  "submitted",
  "revision",
  "accepted",
  "rejected",
] as const;

type SubmissionStatus = (typeof validStatuses)[number];

function isSubmissionType(value: unknown): value is SubmissionType {
  return (
    value === "fullPaper" ||
    value === "poster" ||
    value === "presentation"
  );
}

function isSubmissionStatus(value: unknown): value is SubmissionStatus {
  return (
    typeof value === "string" &&
    validStatuses.includes(value as SubmissionStatus)
  );
}

function getLockedMessage(status: SubmissionStatus) {
  if (status === "submitted") {
    return "Dokumen sudah dikirim dan sedang diperiksa. Tunggu hasil pemeriksaan admin.";
  }

  if (status === "accepted") {
    return "Dokumen sudah diterima dan tidak bisa diubah.";
  }

  if (status === "rejected") {
    return "Dokumen berstatus ditolak dan pengiriman dikunci. Hubungi admin jika perlu peninjauan.";
  }

  return "Status submission berubah. Muat ulang halaman sebelum mencoba lagi.";
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Data submission tidak valid." },
        { status: 400 }
      );
    }

    const payload = body as {
      teamId?: unknown;
      type?: unknown;
      paperUrl?: unknown;
    };

    const teamId =
      typeof payload.teamId === "string" ? payload.teamId.trim() : "";
    const paperUrl =
      typeof payload.paperUrl === "string" ? payload.paperUrl.trim() : "";
    const type = payload.type;

    if (!teamId || !paperUrl || !isSubmissionType(type)) {
      return NextResponse.json(
        { error: "Data submission belum lengkap." },
        { status: 400 }
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(paperUrl);
    } catch {
      return NextResponse.json(
        { error: "URL dokumen tidak valid." },
        { status: 400 }
      );
    }

    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "URL dokumen harus menggunakan HTTPS." },
        { status: 400 }
      );
    }

    const owned = await getOwnedTeam(teamId);

    if ("error" in owned) {
      return NextResponse.json(
        { error: owned.error },
        { status: owned.status }
      );
    }

    const { team } = owned;
    const isSPC = team.compeType === "science-project";
    const isICC = team.compeType === "industrial-case";

    if (!isSPC && !isICC) {
      return NextResponse.json(
        { error: "Kategori ini tidak memiliki tahap submission." },
        { status: 403 }
      );
    }

    if (isICC && type !== "fullPaper") {
      return NextResponse.json(
        { error: "ICC hanya memiliki submission full report." },
        { status: 400 }
      );
    }

    if (team.abstractStatus !== "passed" || team.statusPayment !== "verified") {
      return NextResponse.json(
        {
          error:
            "Tim harus lolos abstrak dan pembayaran harus terverifikasi.",
        },
        { status: 403 }
      );
    }

    const deadline =
      team.compeType === "science-project"
        ? new Date("2026-10-23T23:59:59+07:00")
        : new Date("2026-11-07T23:59:59+07:00");

    if (Date.now() > deadline.getTime()) {
      return NextResponse.json(
        { error: "Batas waktu submission telah berakhir." },
        { status: 403 }
      );
    }

    const fields = submissionFields[type];

    const [currentSubmission] = await db
      .select({
        url: fields.url,
        status: fields.status,
      })
      .from(teams)
      .where(eq(teams.id, team.id))
      .limit(1);

    if (!currentSubmission) {
      return NextResponse.json(
        { error: "Data tim tidak ditemukan." },
        { status: 404 }
      );
    }

    if (
      currentSubmission.status !== "not_submitted" &&
      currentSubmission.status !== "revision"
    ) {
      return NextResponse.json(
        {
          error: getLockedMessage(currentSubmission.status),
          status: currentSubmission.status,
          savedUrl: currentSubmission.url,
        },
        { status: 409 }
      );
    }

    const urlField =
      type === "fullPaper"
        ? "fullPaperUrl"
        : type === "poster"
          ? "posterUrl"
          : "presentationUrl";

    const statusField =
      type === "fullPaper"
        ? "submissionStatus"
        : type === "poster"
          ? "posterStatus"
          : "presentationStatus";

    const notesField =
      type === "fullPaper"
        ? "submissionNotes"
        : type === "poster"
          ? "posterNotes"
          : "presentationNotes";

    const updated = await db
      .update(teams)
      .set({
        [urlField]: paperUrl,
        [statusField]: "submitted",
        [notesField]: null,
      })
      .where(
        and(
          eq(teams.id, team.id),
          inArray(fields.status, ["not_submitted", "revision"])
        )
      )
      .returning({ id: teams.id });

    if (updated.length === 0) {
      const [latestSubmission] = await db
        .select({
          url: fields.url,
          status: fields.status,
        })
        .from(teams)
        .where(eq(teams.id, team.id))
        .limit(1);

      const latestStatus = latestSubmission?.status;

      if (latestStatus && isSubmissionStatus(latestStatus)) {
        return NextResponse.json(
          {
            error: getLockedMessage(latestStatus),
            status: latestStatus,
            savedUrl: latestSubmission.url,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Status submission berubah saat dokumen dikirim. Muat ulang halaman.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "submitted",
    });
  } catch (error) {
    console.error("Submission API error:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan server saat menyimpan submission." },
      { status: 500 }
    );
  }
}