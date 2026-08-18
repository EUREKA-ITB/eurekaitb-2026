"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MerchProductCard from "../../components/MerchProductCard";

type Category = "Kaos" | "Totebag" | "Aksesoris";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: Category;
};



// Data akan diambil dari API /api/merch

export default function MerchPage() {
  // Tampilkan harga asli produk di UI
  const HIDE_PRICES = false;    

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [cartOpen, setCartOpen] = useState(false);
  // cart stores only qtys per product id to avoid duplicating product objects in memory
  const [cart, setCart] = useState<Record<string, number>>({});
  const router = useRouter();

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  // create a lookup map to avoid repeated array scans
  const productsMap = useMemo(() => {
    const m: Record<string, Product> = {};
    for (const p of products) m[p.id] = p;
    return m;
  }, [products]);

  const cartCount = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);
  const subtotal = useMemo(() => {
    let s = 0;
    for (const [id, q] of Object.entries(cart)) {
      const p = productsMap[id];
      if (!p) continue;
      s += q * p.price;
    }
    return s;
  }, [cart, productsMap]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/merch")
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (!mounted) return;
        setProducts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Load cart qtys (id -> qty) from localStorage
  useEffect(() => {
    if (loading) return;
    try {
      const raw = localStorage.getItem("merch_cart");
      if (!raw) return;
      const parsed: Record<string, number> = JSON.parse(raw);
      // keep only ids that exist in productsMap
      const slim: Record<string, number> = {};
      for (const [id, q] of Object.entries(parsed)) if (productsMap[id]) slim[id] = q;
      Promise.resolve().then(() => setCart(slim));
    } catch {
      // ignore
    }
  }, [loading, productsMap]);

  // Persist cart qtys to localStorage (debounced to avoid frequent writes)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem("merch_cart", JSON.stringify(cart));
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [cart]);

  const addToCart = useCallback((productId: string) => {
    const p = productsMap[productId];
    if (!p || p.stock <= 0) return;
    setCart((c) => ({ ...c, [productId]: (c[productId] || 0) + 1 }));
  }, [productsMap]);

  const buyNow = useCallback((productId: string) => {
    addToCart(productId);
    setCartOpen(true);
  }, [addToCart]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((c) => {
      const copy = { ...c };
      delete copy[productId];
      return copy;
    });
  }, []);

  const changeQty = useCallback((productId: string, qty: number) => {
    setCart((c) => {
      if (qty <= 0) {
        const copy = { ...c };
        delete copy[productId];
        return copy;
      }
      return { ...c, [productId]: qty };
    });
  }, []);

  const formatIDR = useCallback((n: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);
  }, []);

  // add/remove body class so Navbar can hide when cart is open
  useEffect(() => {
    try {
      if (cartOpen) document.body.classList.add("cart-open");
      else document.body.classList.remove("cart-open");
    } catch {}
  }, [cartOpen]);

  const handleCartToggle = useCallback(() => setCartOpen(prev => !prev), []);
  const handleCategoryChange = useCallback((category: string) => setActiveCategory(category), []);

  return (
    <div className="min-h-screen p-6 pt-24 bg-blue-marine text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Merchandise</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={handleCartToggle}
                aria-label="Open cart"
                className="bg-white/5 hover:bg-white/10 rounded-full p-3 flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
                  <path d="M6 6h15l-1.5 9h-12z" />
                  <circle cx="10" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
                <span className="text-sm font-bold">{cartCount}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => handleCategoryChange(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${activeCategory === c ? "bg-sunlight-orange text-blue-marine" : "bg-white/5 text-white"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center text-silver-shine py-12">Loading produk...</div>
          ) : (
            filtered.map((p) => (
              <MerchProductCard key={p.id} p={p} addToCart={addToCart} buyNow={buyNow} hidePrices={HIDE_PRICES} formatIDR={formatIDR} />
            ))
          )}
        </section>
      </div>

      {/* Floating view cart button */}
      <button
        onClick={handleCartToggle}
        aria-label="Lihat Keranjang"
        className="fixed right-6 bottom-6 z-50 inline-flex items-center gap-3 bg-sunlight-orange text-blue-marine px-4 py-3 rounded-full shadow-2xl font-bold"
      >
        Keranjang ({cartCount})
      </button>

      {/* Cart Drawer - responsive: bottom sheet on small screens, right drawer on desktop */}
      <div aria-hidden={!cartOpen} style={{ zIndex: 60 }} className={`fixed inset-0 ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        {/* overlay */}
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${cartOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setCartOpen(false)} />

        {/* panel */}
        <div
          className={`fixed left-0 right-0 bottom-0 bg-blue-marine text-white p-6 overflow-y-auto transform transition-transform ${
            cartOpen ? "translate-y-0" : "translate-y-full"
          } md:fixed md:top-0 md:right-0 md:bottom-auto md:left-auto md:w-96 md:h-full ${cartOpen ? "md:translate-x-0" : "md:translate-x-full"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">Keranjang</h2>
          </div>

          {/* note removed per request; keep UI clean */}

          {cartCount === 0 ? (
            <div className="flex items-center justify-center py-20 text-silver-shine">
              <span className="font-display text-lg">Keranjang kosong.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(cart).map(([id, qty]) => {
                const prod = productsMap[id];
                if (!prod) return null;
                return (
                  <div key={id} className="flex items-start gap-3">
                    <div className="w-16 h-12 relative rounded-md overflow-hidden">
                      <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold">{prod.name}</div>
                          <div className="text-xs text-silver-shine">{HIDE_PRICES ? "Rp XXXXX" : formatIDR(prod.price)}</div>
                        </div>
                        <button onClick={() => removeFromCart(id)} className="text-sm text-white/60">Hapus</button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => changeQty(id, qty - 1)} className="px-2 py-1 bg-white/5 rounded">−</button>
                        <div className="px-3 py-1 bg-white/5 rounded">{qty}</div>
                        <button onClick={() => changeQty(id, qty + 1)} className="px-2 py-1 bg-white/5 rounded">+</button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-white/10 pt-4 pb-24">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-silver-shine">Subtotal</div>
                  <div className="font-bold">{HIDE_PRICES ? "Rp XXXXX" : formatIDR(subtotal)}</div>
                </div>
                <div className="w-full">
                  <button onClick={() => { setCartOpen(false); router.push('/merch/checkout'); }} className="w-full py-3 rounded-xl bg-sunlight-orange text-blue-marine font-bold">Checkout</button>
                </div>
              </div>
              {/* bottom sticky close area to avoid being hidden by top navbar */}
              <div className="fixed left-0 right-0 bottom-0 md:relative md:bottom-auto md:left-auto md:right-auto md:flex md:justify-end bg-blue-marine p-4 border-t border-white/5">
                <div className="max-w-7xl mx-auto w-full md:w-auto flex justify-between md:justify-end gap-3">
                  <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="px-4 py-2 rounded-xl bg-white/5 text-white font-bold">X</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
