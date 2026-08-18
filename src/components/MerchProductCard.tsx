"use client";

import React from "react";
import Image from "next/image";

type Category = "Kaos" | "Totebag" | "Aksesoris";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: Category;
};

type Props = {
  p: Product;
  addToCart: (id: string) => void;
  buyNow: (id: string) => void;
  hidePrices: boolean;
  formatIDR: (n: number) => string;
};

function MerchProductCard({ p, addToCart, buyNow, hidePrices, formatIDR }: Props) {
  return (
    <article key={p.id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-sm">
      <div className="relative h-40 w-full overflow-hidden bg-black/20">
        <Image src={p.image} alt={p.name} fill className="object-cover" />
        <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full ${p.stock <= 0 ? "bg-red-500 text-white" : "bg-green-400 text-blue-marine"}`}>
          {p.stock <= 0 ? "Sold Out" : "Available"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white mb-1">{p.name}</h3>
        <p className="text-silver-shine text-sm mb-3">{hidePrices ? "Rp XXXXX" : formatIDR(p.price)}</p>

        <div className="flex gap-2">
          <button onClick={() => addToCart(p.id)} disabled={p.stock <= 0} className={`flex-1 py-2 rounded-xl font-bold ${p.stock <= 0 ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"}`}>
            Tambah ke Keranjang
          </button>
          <button onClick={() => buyNow(p.id)} disabled={p.stock <= 0} className={`py-2 px-3 rounded-xl font-bold ${p.stock <= 0 ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-white/5 text-white hover:bg-white/10"}`}>
            Beli Sekarang
          </button>
        </div>
      </div>
    </article>
  );
}

export default React.memo(MerchProductCard);
