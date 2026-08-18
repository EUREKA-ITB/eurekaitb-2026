import { NextResponse } from "next/server";
import { getProducts } from "@/lib/merch-data";

export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}
