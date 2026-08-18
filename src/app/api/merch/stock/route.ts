import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateStock } from "@/lib/merch-data";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only allow admins to update stock in this demo endpoint
  const role = session.user.role;
  if (role !== "admin" && role !== "admin_se") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, stock } = body as { id: string; stock: number };
    if (!id || typeof stock !== "number") return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const updated = updateStock(id, stock);
    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ success: true, product: updated });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
