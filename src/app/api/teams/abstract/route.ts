import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Sesi tidak valid. Silakan login ulang." }, { status: 401 });
    }

    const body = await req.json();
    const { abstractUrl } = body;

    if (!abstractUrl) {
      return NextResponse.json({ error: "URL Abstrak tidak ditemukan." }, { status: 400 });
    }

    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (dbUser.length === 0) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const userTeam = await db.select().from(teams).where(eq(teams.userId, dbUser[0].id)).limit(1);
    if (userTeam.length === 0) {
      return NextResponse.json({ error: "Tim tidak ditemukan." }, { status: 404 });
    }

    if (userTeam[0].compeType === "industrial-case" && userTeam[0].abstractStatus === "failed") {
      return NextResponse.json({ error: "ICC tidak dapat melakukan revisi atau pengumpulan ulang dokumen." }, { status: 403 });
    }

    await db.update(teams).set({
      abstractUrl: abstractUrl,
      abstractStatus: "waiting"
    }).where(eq(teams.id, userTeam[0].id));

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Terjadi kesalahan sistem internal.";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}