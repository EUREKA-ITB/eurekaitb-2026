import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { documents, teams } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const { teamId, paymentUrl } = await req.json();
    if (!teamId || !paymentUrl) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });

    // 1. Simpan/Update Dokumen Bukti Bayar
    const existingDoc = await db.select().from(documents).where(eq(documents.teamId, teamId)).limit(1);
    if (existingDoc.length > 0) {
      await db.update(documents).set({ urlPayment: paymentUrl }).where(eq(documents.teamId, teamId));
    } else {
      await db.insert(documents).values({ teamId: teamId, urlIdentitas: null, urlPayment: paymentUrl });
    }

    // 2. MENGUBAH STATUS PESERTA MENJADI 'PENDING'
    await db.update(teams).set({ statusPayment: "pending" }).where(eq(teams.id, teamId));

    return NextResponse.json({ message: "Bukti pembayaran berhasil diunggah!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}