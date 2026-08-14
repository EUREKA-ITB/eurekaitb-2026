import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, teams } from "@/db/schema";
import { eq } from "drizzle-orm";

// UBAH JADI POST AGAR SINKRON DENGAN CLIENT (AbstractPortalClient.tsx)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (dbUser.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userTeam = await db.select().from(teams).where(eq(teams.userId, dbUser[0].id)).limit(1);
    if (userTeam.length === 0) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // TANGKAP caseChoice JUGA DARI PAYLOAD (KHUSUS ICC)
    const { abstractUrl, caseChoice } = await req.json();
    if (!abstractUrl) {
      return NextResponse.json({ error: "Abstract URL is required" }, { status: 400 });
    }

    // UPDATE DATABASE (Sekalian simpan caseChoice jika ada isinya)
    if (caseChoice) {
      await db.update(teams).set({ abstractUrl, abstractStatus: "waiting", caseChoice }).where(eq(teams.id, userTeam[0].id));
    } else {
      await db.update(teams).set({ abstractUrl, abstractStatus: "waiting" }).where(eq(teams.id, userTeam[0].id));
    }

    return NextResponse.json({ message: "Abstract uploaded successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}