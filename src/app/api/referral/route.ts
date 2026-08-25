import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { referralCodes, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0 || dbUser[0].role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const codes = await db.select().from(referralCodes).orderBy(desc(referralCodes.createdAt));
  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (dbUser.length === 0 || dbUser[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { partnerName, tier } = await req.json();
    if (!partnerName || !tier) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    let discountVal = 0;
    let baseCode = "";
    let amountToGenerate = 0;

    if (tier === "Quantum") {
      discountVal = 5;
      baseCode = "ALPHA-EUREKA5";
      amountToGenerate = 1;
    } else if (tier === "Photon") {
      discountVal = 10;
      baseCode = "BETA-EUREKA10";
      amountToGenerate = 2;
    } else if (tier === "Electron") {
      discountVal = 15;
      baseCode = "GAMMA-EUREKA15";
      amountToGenerate = 3;
    } else {
      return NextResponse.json({ error: "Tier tidak valid" }, { status: 400 });
    }

    const cleanPartnerName = partnerName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const generatedCodes = [];

    for (let i = 0; i < amountToGenerate; i++) {
      const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
      const finalCode = `${baseCode}-${cleanPartnerName}-${randomStr}`;
      
      generatedCodes.push({
        code: finalCode,
        partnerName: partnerName,
        tier: tier as "Quantum" | "Photon" | "Electron",
        discountVal: discountVal,
        createdBy: session.user.email,
      });
    }

    await db.insert(referralCodes).values(generatedCodes);

    return NextResponse.json({ message: "Kode berhasil dibuat" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (dbUser.length === 0 || dbUser[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await db.delete(referralCodes).where(eq(referralCodes.id, id));

    return NextResponse.json({ message: "Kode berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}