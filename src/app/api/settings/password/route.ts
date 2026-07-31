import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    // search user di database
    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (dbUser.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const user = dbUser[0];
    const isGoogleUser = !user.password;

    // verif pw lama (sign up non-google)
    if (!isGoogleUser) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Password saat ini wajib diisi!" }, { status: 400 });
      }
      const isMatch = await compare(currentPassword, user.password!);
      if (!isMatch) {
        return NextResponse.json({ error: "Password saat ini salah!" }, { status: 400 });
      }
    }

    // Create & Update pw
    const hashedPassword = await hash(newPassword, 10);
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, session.user.email));

    return NextResponse.json({ message: "Password berhasil disimpan!" }, { status: 200 });

  } catch (error) {
    console.error("Password Update Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}