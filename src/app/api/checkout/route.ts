import { NextResponse } from "next/server";
import { createOrder, cancelExpiredOrders } from "@/lib/orders";

export async function POST(req: Request) {
  try {
    cancelExpiredOrders();
    const body = await req.json();
    // body should contain buyer, items, paymentMethod, subtotal, total
    const order = createOrder({ buyer: body.buyer, items: body.items || [], paymentMethod: body.paymentMethod, total: body.total });

    return NextResponse.json({ success: true, orderId: order.id, qrisUrl: order.qrisUrl || null, expiresAt: order.expiresAt });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Invalid payload." }, { status: 400 });
  }
}
