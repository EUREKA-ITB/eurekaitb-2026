import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, teams } from "@/db/schema";
import { eq } from "drizzle-orm";

type AbstractStatus = "waiting" | "passed" | "failed";
type PaymentStatus = "unpaid" | "pending" | "verified" | "rejected";

interface VerifyPayload {
  teamId: string;
  updateTarget: "abstract" | "payment";
  newStatus: string;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (dbUser.length === 0 || (dbUser[0].role !== "admin" && dbUser[0].role !== "admin_se")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { teamId, updateTarget, newStatus } = (await req.json()) as VerifyPayload;

    if (!teamId || !updateTarget || !newStatus) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const currentTeam = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (currentTeam.length === 0) return NextResponse.json({ error: "Tim tidak ditemukan" }, { status: 404 });

    if (updateTarget === "abstract") {
      await db.update(teams).set({ abstractStatus: newStatus as AbstractStatus }).where(eq(teams.id, teamId));
      return NextResponse.json({ message: `Status abstrak diubah menjadi ${newStatus}` }, { status: 200 });
    }

    if (updateTarget === "payment") {
      if (newStatus === "verified" && !currentTeam[0].participantNumber) {
        const sameCategoryTeams = await db
          .select({ participantNumber: teams.participantNumber })
          .from(teams)
          .where(eq(teams.compeType, currentTeam[0].compeType));

        const code = currentTeam[0].compeType === "physics_olympiad" ? "PO" : currentTeam[0].compeType === "science_project" ? "SP" : "IC";
        const prefix = `E26-${code}-`;

        let highestSequence = 0;
        for (const team of sameCategoryTeams) {
          const participantNumber = team.participantNumber;
          if (!participantNumber || !participantNumber.startsWith(prefix)) continue;

          const sequence = Number.parseInt(participantNumber.slice(prefix.length), 10);
          if (Number.isFinite(sequence) && sequence > highestSequence) {
            highestSequence = sequence;
          }
        }

        const nextSequence = String(highestSequence + 1).padStart(4, "0");
        const participantNumber = `${prefix}${nextSequence}`;
        const cbtPassword = Math.random().toString(36).slice(-6).toUpperCase();

        await db.update(teams).set({
          statusPayment: newStatus as PaymentStatus,
          participantNumber,
          cbtPassword,
          verifiedBy: dbUser[0].name // LOG NAMA ADMIN
        }).where(eq(teams.id, teamId));
      } 
      else {
        await db.update(teams).set({ 
          statusPayment: newStatus as PaymentStatus,
          verifiedBy: newStatus === "verified" ? dbUser[0].name : null
        }).where(eq(teams.id, teamId));
      }

      return NextResponse.json({ message: `Pembayaran diubah menjadi ${newStatus}` }, { status: 200 });
    }

    return NextResponse.json({ error: "Target update tidak valid" }, { status: 400 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}