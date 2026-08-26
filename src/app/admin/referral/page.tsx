import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, referralCodes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import AdminReferralClient from "./AdminReferralClient";

export default async function AdminReferralPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0 || dbUser[0].role !== "admin") {
    redirect("/dashboard");
  }

  const initialCodes = await db.select().from(referralCodes).orderBy(desc(referralCodes.createdAt));

  return <AdminReferralClient initialCodes={initialCodes} />;
}