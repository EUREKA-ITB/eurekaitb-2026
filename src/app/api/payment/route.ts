import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents, teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOwnedTeam } from "@/lib/owned-team";

export async function POST(req: Request) {
  try {
    const { teamId, paymentUrl } = await req.json();

    if (!teamId || !paymentUrl) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    const result = await getOwnedTeam(String(teamId));
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { team } = result;

    if (team.statusPayment === "verified") {
      return NextResponse.json({ error: "Pembayaran tim sudah diverifikasi." }, { status: 409 });
    }
    if (team.statusPayment === "pending") {
      return NextResponse.json({ error: "Bukti pembayaran sedang diperiksa." }, { status: 409 });
    }
    if (
      (team.compeType === "science-project" || team.compeType === "industrial-case") &&
      team.abstractStatus !== "passed"
    ) {
      return NextResponse.json({ error: "Tim harus lolos seleksi abstrak sebelum membayar." }, { status: 403 });
    }

    // TODO: periksa deadline kategori dari satu konfigurasi server-side.
    const [doc] = await db.select().from(documents)
      .where(eq(documents.teamId, team.id))
      .limit(1);

    if (doc) {
      await db.update(documents)
        .set({ urlPayment: String(paymentUrl), uploadedAt: new Date() })
        .where(eq(documents.id, doc.id));
    } else {
      await db.insert(documents).values({
        teamId: team.id,
        urlPayment: String(paymentUrl),
      });
    }

    await db.update(teams)
      .set({ statusPayment: "pending" })
      .where(eq(teams.id, team.id));

    return NextResponse.json({ message: "Bukti pembayaran berhasil diunggah." });
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}