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

    // 1. Ambil semua dokumen dengan teamId tersebut (untuk antisipasi ada data ganda sebelumnya)
    const existingDocs = await db.select().from(documents).where(eq(documents.teamId, teamId));

    if (existingDocs.length > 0) {
      // Jika sudah ada, update dokumen yang PERTAMA ditemukan
      await db.update(documents)
        .set({ urlPayment: paymentUrl })
        .where(eq(documents.id, existingDocs[0].id));

      // [SOLUSI BUG] Hapus otomatis sisanya jika ternyata terjadi "Race Condition" / data double di tabel
      if (existingDocs.length > 1) {
        for (let i = 1; i < existingDocs.length; i++) {
          await db.delete(documents).where(eq(documents.id, existingDocs[i].id));
        }
      }
    } else {
      // Jika benar-benar baru, lakukan insert
      await db.insert(documents).values({ 
        teamId: teamId, 
        urlIdentitas: null, 
        urlPayment: paymentUrl 
      });
    }

    // 2. STATUS 'PENDING'
    await db.update(teams).set({ statusPayment: "pending" }).where(eq(teams.id, teamId));

    return NextResponse.json({ message: "Bukti pembayaran berhasil diunggah!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}