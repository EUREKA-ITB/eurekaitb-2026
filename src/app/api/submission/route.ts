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
  },
  poster: {
    url: teams.posterUrl,
    status: teams.posterStatus,
  },
  presentation: {
    url: teams.presentationUrl,
    status: teams.presentationStatus,
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

function isCloudinaryPdfUrl(value: string, cloudName: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    return false;
  }

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== "res.cloudinary.com" ||
    parsedUrl.port !== "" ||
    parsedUrl.username !== "" ||
    parsedUrl.password !== "" ||
    parsedUrl.search !== "" ||
    parsedUrl.hash !== ""
  ) {
    return false;
  }

  const segments = parsedUrl.pathname.split("/").filter(Boolean);

  if (segments.length < 5) {
    return false;
  }

  const [urlCloudName, resourceType, uploadAction, ...assetPath] = segments;

  if (
    urlCloudName !== cloudName ||
    (resourceType !== "image" && resourceType !== "raw") ||
    uploadAction !== "upload"
  ) {
    return false;
  }

  return assetPath.join("/").toLowerCase().endsWith(".pdf");
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format data submission tidak valid." },
        { status: 400 }
      );
    }

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

    const owned = await getOwnedTeam(teamId);

    if ("error" in owned) {
      return NextResponse.json(
        { error: owned.error },
        { status: owned.status }
      );
    }

    const { team } = owned;
    const compeType = team.compeType.replace(/_/g, "-");
    const isSPC = compeType === "science-project";
    const isICC = compeType === "industrial-case";

    if (!isSPC && !isICC) {
      return NextResponse.json(
        { error: "Kategori ini tidak memiliki tahap submission." },
        { status: 403 }
      );
    }

    if (isICC && type !== "fullPaper") {
      return NextResponse.json(
        { error: "ICC hanya menerima submission Full Report." },
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
      compeType === "science-project"
        ? new Date("2026-10-23T23:59:59+07:00")
        : new Date("2026-11-07T23:59:59+07:00");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

    if (!cloudName) {
      return NextResponse.json(
        { error: "Konfigurasi upload belum tersedia. Hubungi panitia." },
        { status: 503 }
      );
    }

    if (!isCloudinaryPdfUrl(paperUrl, cloudName)) {
      return NextResponse.json(
        {
          error:
            "File harus berupa PDF yang diunggah melalui portal Cloudinary resmi.",
        },
        { status: 400 }
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

    const isPastDeadline = Date.now() > deadline.getTime();

    if (isPastDeadline && currentSubmission.status !== "revision") {
      return NextResponse.json(
        { error: "Batas waktu submission baru telah berakhir." },
        { status: 403 }
      );
    }

    const allowedStatuses: SubmissionStatus[] = isPastDeadline
      ? ["revision"]
      : ["not_submitted", "revision"];

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
          eq(teams.abstractStatus, "passed"),
          eq(teams.statusPayment, "verified"),
          inArray(fields.status, allowedStatuses)
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
            "Status submission atau kelayakan tim berubah. Muat ulang halaman.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "submitted",
      savedUrl: paperUrl,
    });
  } catch (error) {
    console.error("Submission API error:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan server saat menyimpan submission." },
      { status: 500 }
    );
  }
}