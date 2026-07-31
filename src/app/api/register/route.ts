import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, institution, level, nisn } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nama, email, dan password wajib diisi!" }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email ini sudah terdaftar. Silakan login." }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      name: name,
      email: email,
      password: hashedPassword,
      role: "participant",
      institution: institution, 
      educationLevel: level, 
      identityNumber: nisn, 
    });

    return NextResponse.json({ message: "Akun berhasil dibuat!" }, { status: 201 });
  } catch (error: unknown) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}