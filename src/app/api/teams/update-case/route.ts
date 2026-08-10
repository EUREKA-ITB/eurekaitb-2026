import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, teams } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (dbUser.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userTeam = await db.select().from(teams).where(eq(teams.userId, dbUser[0].id)).limit(1);
    if (userTeam.length === 0) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (userTeam[0].compeType !== "industrial_case") {
      return NextResponse.json({ error: "Invalid competition type" }, { status: 400 });
    }

    const { caseChoice } = await req.json();
    if (!caseChoice) {
      return NextResponse.json({ error: "Case choice is required" }, { status: 400 });
    }

    await db.update(teams).set({ caseChoice }).where(eq(teams.id, userTeam[0].id));

    return NextResponse.json({ message: "Case choice updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}