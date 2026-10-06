import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const teamRecord = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (teamRecord.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isPO = teamRecord[0].compeType === "physics-olympiad";
    const PAYMENT_DEADLINE = isPO 
      ? new Date("2026-10-05T12:00:00+07:00") 
      : new Date("2026-10-25T23:59:59+07:00");

    if (new Date() > PAYMENT_DEADLINE) {
      return NextResponse.json({ error: "Batas waktu pembayaran telah berakhir." }, { status: 403 });
    }

    await db.update(teams).set({
      paymentStartedAt: new Date()
    }).where(eq(teams.id, teamId));

    return NextResponse.json({ success: true, message: "Timer di-reset ke 3 jam dari sekarang" }, { status: 200 });
  } catch (error) {
    console.error("Error setting payment timer:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}