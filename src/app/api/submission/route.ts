import { NextResponse } from "next/server";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamId, paperUrl } = body;

    // Deteksi jika payload dari client ternyata kosong
    if (!teamId || !paperUrl) {
      return NextResponse.json({ error: "Data teamId atau paperUrl kosong/tidak terbaca oleh server." }, { status: 400 });
    }

    // Melakukan update dan mengembalikan ID untuk memastikan data benar-benar tersentuh
    const updatedTeam = await db
      .update(teams)
      .set({ 
        fullPaperUrl: paperUrl 
      })
      .where(eq(teams.id, teamId))
      .returning({ id: teams.id });

    // Jika array kosong, berarti teamId tersebut tidak ditemukan di database
    if (updatedTeam.length === 0) {
       return NextResponse.json({ error: "ID Tim tidak ditemukan di database. Coba relogin." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("SUBMISSION API ERROR:", error);
    
    // Menangkap pesan error asli dari PostgreSQL (jika ada masalah panjang karakter dll)
    const errMessage = error instanceof Error ? error.message : "Terjadi kesalahan internal pada server database.";
    
    return NextResponse.json({ 
      error: errMessage
    }, { status: 500 });
  }
}