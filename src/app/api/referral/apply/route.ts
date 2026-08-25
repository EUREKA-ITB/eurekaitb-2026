import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { referralCodes } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, teamId } = await req.json();
    if (!code || !teamId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const existingApplied = await db.select().from(referralCodes).where(eq(referralCodes.usedByTeam, teamId)).limit(1);
    if (existingApplied.length > 0) {
      return NextResponse.json({ error: "Tim kamu sudah menggunakan kode referral lain." }, { status: 400 });
    }

    const validCode = await db.select().from(referralCodes)
      .where(and(eq(referralCodes.code, code), eq(referralCodes.isUsed, false), isNull(referralCodes.usedByTeam)))
      .limit(1);

    if (validCode.length === 0) {
      return NextResponse.json({ error: "Kode referral tidak valid atau sudah hangus." }, { status: 404 });
    }

    await db.update(referralCodes)
      .set({ isUsed: true, usedByTeam: teamId, usedAt: new Date() })
      .where(eq(referralCodes.id, validCode[0].id));

    return NextResponse.json({ message: "Kode berhasil diterapkan!", discountVal: validCode[0].discountVal }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}