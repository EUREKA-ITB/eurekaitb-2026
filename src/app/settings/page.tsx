import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "profile";

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0) redirect("/login");

  const userData = dbUser[0];
  
  // LOGIKA CERDAS: Cek apakah user mendaftar via Google (tidak punya password)
  const isGoogleUser = !userData.password;

  return (
    <SettingsClient 
      userData={userData} 
      isGoogleUser={isGoogleUser} 
      activeTab={activeTab} 
      sessionImage={session.user?.image} 
    />
  );
}