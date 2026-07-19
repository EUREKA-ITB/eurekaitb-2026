import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, teams, documents } from "@/db/schema";
import { eq } from "drizzle-orm";

interface DocumentPayload {
  urlIdentitas?: string;
  urlPayment?: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const body = (await req.json()) as DocumentPayload;
    
    // Cari user dan ID Tim mereka
    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    const userId = dbUser[0].id;
    
    const userTeam = await db.select().from(teams).where(eq(teams.userId, userId)).limit(1);
    if (userTeam.length === 0) {
      return NextResponse.json({ error: "Tim tidak ditemukan" }, { status: 404 });
    }
    const teamId = userTeam[0].id;

    // Cek apakah tim ini sudah punya baris di tabel dokumen
    const existingDoc = await db.select().from(documents).where(eq(documents.teamId, teamId)).limit(1);

    if (existingDoc.length > 0) {
      // Update dokumen yang sudah ada (menggabungkan data lama dan baru)
      await db.update(documents).set({
        urlIdentitas: body.urlIdentitas ?? existingDoc[0].urlIdentitas,
        urlPayment: body.urlPayment ?? existingDoc[0].urlPayment,
        uploadedAt: new Date(),
      }).where(eq(documents.teamId, teamId));
    } else {
      // Buat baris dokumen baru
      await db.insert(documents).values({
        teamId: teamId,
        urlIdentitas: body.urlIdentitas ?? null,
        urlPayment: body.urlPayment ?? null,
      });
    }

    return NextResponse.json({ message: "Dokumen berhasil disimpan" }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error API Documents:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}