import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { referralCodes } from "@/db/schema";
import { getOwnedTeam } from "@/lib/owned-team";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    }

    const payload = body as { code?: unknown; teamId?: unknown };
    const code = typeof payload.code === "string" ? payload.code.trim().toUpperCase() : "";
    const teamId = typeof payload.teamId === "string" ? payload.teamId.trim() : "";

    if (!code || !teamId) {
      return NextResponse.json({ error: "Kode dan tim wajib diisi." }, { status: 400 });
    }

    const owned = await getOwnedTeam(teamId);
    if ("error" in owned) {
      return NextResponse.json({ error: owned.error }, { status: owned.status });
    }

    const existingApplied = await db
      .select({ id: referralCodes.id })
      .from(referralCodes)
      .where(eq(referralCodes.usedByTeam, owned.team.id))
      .limit(1);

    if (existingApplied.length > 0) {
      return NextResponse.json(
        { error: "Tim sudah menggunakan kode referral." },
        { status: 409 }
      );
    }

    const [validCode] = await db
      .select()
      .from(referralCodes)
      .where(
        and(
          eq(referralCodes.code, code),
          eq(referralCodes.isUsed, false),
          isNull(referralCodes.usedByTeam)
        )
      )
      .limit(1);

    if (!validCode) {
      return NextResponse.json(
        { error: "Kode referral tidak valid atau sudah digunakan." },
        { status: 404 }
      );
    }

    const [claimedCode] = await db
      .update(referralCodes)
      .set({
        isUsed: true,
        usedByTeam: owned.team.id,
        usedAt: new Date(),
      })
      .where(
        and(
          eq(referralCodes.id, validCode.id),
          eq(referralCodes.isUsed, false),
          isNull(referralCodes.usedByTeam)
        )
      )
      .returning({ id: referralCodes.id });

    if (!claimedCode) {
      return NextResponse.json(
        { error: "Kode referral baru saja digunakan orang lain." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: "Kode referral berhasil diterapkan.",
      discountVal: validCode.discountVal,
    });
  } catch (error) {
    console.error("Referral apply error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}