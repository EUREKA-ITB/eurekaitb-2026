import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { teams, users } from "@/db/schema";

export async function getOwnedTeam(teamId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!user) {
    return { error: "User not found", status: 404 as const };
  }

  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, teamId), eq(teams.userId, user.id)))
    .limit(1);

  if (!team) {
    return { error: "Team not found", status: 404 as const };
  }

  return { team, userId: user.id };
}