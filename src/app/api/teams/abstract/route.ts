import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Access denied" }, { status: 401 });

    const { abstractUrl } = await req.json();
    if (!abstractUrl) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    
    await db.update(teams)
      .set({ abstractUrl: abstractUrl })
      .where(eq(teams.userId, dbUser[0].id));

    return NextResponse.json({ message: "Abstract updated successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}