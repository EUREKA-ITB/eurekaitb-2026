"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

type Product = { id: string; name: string; price: number; image: string; stock: number };



export default function CheckoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { data: session } = useSession();

  const [buyerName, setBuyerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState<string>(() => (session?.user?.email ? String(session.user.email) : ""));
  const [institution, setInstitution] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"Delivery" | "PickUp">("Delivery");
  const [address, setAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "qris">("cod");
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const formatIDR = useCallback((n: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);
  }, []);

  const handleCopy = useCallback(async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(label ? `${label} disalin` : "Tersalin");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage("Gagal menyalin");
      setTimeout(() => setCopyMessage(null), 2000);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/merch")
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (!mounted) return;
        setProducts(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
    return () => {
      mounted = false;
    };
  }, []);

  const cart = useMemo(() => {
    try {
      const raw = localStorage.getItem("merch_cart");
      if (!raw) return {} as Record<string, number>;
      return JSON.parse(raw) as Record<string, number>;
    } catch {
      return {} as Record<string, number>;
    }
  }, []);

  const productsMap = useMemo(() => {
    const m: Record<string, Product> = {};
    for (const p of products) m[p.id] = p;
    return m;
  }, [products]);

  const items = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => ({ id, qty }));
  }, [cart]);

  const subtotal = useMemo(() => {
    let s = 0;
    for (const [id, qty] of Object.entries(cart)) {
      const p = productsMap[id];
      if (!p) continue;
      s += qty * p.price;
    }
    return s;
  }, [cart, productsMap]);

  const shippingCost = useMemo(() => shippingMethod === "Delivery" ? 20000 : 0, [shippingMethod]);
  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

  const formattedSubtotal = useMemo(() => formatIDR(subtotal), [subtotal, formatIDR]);
  const formattedShippingCost = useMemo(() => formatIDR(shippingCost), [shippingCost, formatIDR]);
  const formattedTotal = useMemo(() => formatIDR(total), [total, formatIDR]);

  const canShowPayment = useMemo(() => {
    if (!buyerName.trim()) return false;
    if (!whatsapp.trim()) return false;
    if (!email.trim()) return false;
    if (!institution.trim()) return false;
    if (items.length === 0) return false;
    if (shippingMethod === "Delivery" && !address.trim()) return false;
    return true;
  }, [buyerName, whatsapp, email, institution, items.length, shippingMethod, address]);

  

  const validate = useCallback(() => {
    if (!buyerName.trim()) return "Nama lengkap wajib diisi";
    if (!whatsapp.trim()) return "Nomor WhatsApp wajib diisi";
    // simple email validation
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return "Email tidak valid";
    if (!institution.trim()) return "Asal sekolah/universitas wajib diisi";
    if (items.length === 0) return "Keranjang kosong";
    if (shippingMethod === "Delivery" && !address.trim()) return "Alamat lengkap wajib diisi untuk pengiriman";
    return null;
  }, [buyerName, whatsapp, email, institution, items.length, shippingMethod, address]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        buyer: { name: buyerName, whatsapp, email, institution, shippingMethod, address: shippingMethod === "Delivery" ? address : undefined },
        items,
        shippingCost,
        subtotal,
        total,
        paymentMethod,
      };
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Checkout failed");
      // success
      localStorage.removeItem("merch_cart");
      setOrderId(data.orderId);
      if (data.expiresAt) setExpiresAt(data.expiresAt);
      if (data.qrisUrl) {
        setQrisUrl(data.qrisUrl);
        setSuccess("Pesanan dibuat. Silakan scan QRIS untuk melakukan pembayaran.");
      } else {
        setSuccess("Pesanan berhasil dibuat. Silakan lakukan pembayaran sesuai metode yang dipilih.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Gagal memproses pesanan");
    } finally {
      setSubmitting(false);
    }
  }, [validate, items, shippingCost, subtotal, total, paymentMethod, buyerName, whatsapp, email, institution, shippingMethod, address]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setCountdown("00:00:00");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${String(h).padStart(2, "0")}:
${String(m).padStart(2, "0")}:
${String(s).padStart(2, "0")}`.replace(/\n/g, ""));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <div className="min-h-screen p-6 pt-24 bg-blue-marine text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-bold mb-3">Data Pembeli</h2>
            <label className="block text-sm text-silver-shine mb-2">Nama lengkap</label>
            <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" />

            <label className="block text-sm text-silver-shine mt-4 mb-2">Nomor WhatsApp</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" />

            <label className="block text-sm text-silver-shine mt-4 mb-2">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" />

            <label className="block text-sm text-silver-shine mt-4 mb-2">Asal sekolah / universitas</label>
            <input value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" />

            <h2 className="font-bold mt-6 mb-3">Metode Pengambilan</h2>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="shipping" checked={shippingMethod === "Delivery"} onChange={() => setShippingMethod("Delivery")} />
                <span className="ml-2">Delivery — Kirim via ekspedisi (isi alamat)</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="shipping" checked={shippingMethod === "PickUp"} onChange={() => setShippingMethod("PickUp")} />
                <span className="ml-2">PickUp — Ambil langsung di booth EUREKA (ITB)</span>
              </label>
            </div>

            {shippingMethod === "Delivery" ? (
              <div className="mt-4">
                <label className="block text-sm text-silver-shine mb-2">Alamat lengkap</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" rows={4} />
              </div>
            ) : (
              <div className="mt-4 text-sm text-silver-shine">
                Ambil langsung di booth EUREKA, Kampus ITB (alamat pengambilan akan diinformasikan lebih lanjut).
              </div>
            )}

            <h2 className="font-bold mt-6 mb-3">Metode Pembayaran</h2>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                <span className="ml-2">COD — Bayar saat pengambilan</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="payment" checked={paymentMethod === "qris"} onChange={() => setPaymentMethod("qris")} />
                <span className="ml-2">E-money / QRIS — Scan QR untuk membayar</span>
              </label>
            </div>
            {!canShowPayment && (
              <div className="text-sm text-silver-shine mt-2">Isi semua data pembeli dan alamat (jika pengiriman) serta pastikan keranjang tidak kosong untuk melihat alternatif pembayaran dan QRIS.</div>
            )}
          </div>

          <div>
            <h2 className="font-bold mb-3">Ringkasan Pesanan</h2>

            <div className="space-y-3 mb-4">
              {items.length === 0 ? (
                <div className="text-silver-shine">Keranjang kosong.</div>
              ) : (
                items.map(({ id, qty }) => {
                  const p = productsMap[id];
                  if (!p) return null;
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <div className="w-16 h-12 relative rounded overflow-hidden">
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold">{p.name}</div>
                        <div className="text-xs text-silver-shine">{qty} × {formatIDR(p.price)}</div>
                      </div>
                      <div className="font-bold">{formatIDR(p.price * qty)}</div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex items-center justify-between text-silver-shine">
                <span>Subtotal</span>
                <span>{formattedSubtotal}</span>
              </div>
              <div className="flex items-center justify-between text-silver-shine">
                <span>Biaya Ongkir</span>
                <span>{formattedShippingCost}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-white text-lg">
                <span>Total</span>
                <span>{formattedTotal}</span>
              </div>
            </div>

            {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
            {success && <div className="mt-3 text-sm text-green-400">{success}</div>}
            {orderId && (
              <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                <div className="text-sm">ID Pesanan: <span className="font-mono">{orderId}</span></div>
                {expiresAt && (
                  <div className="text-sm mt-1">Batas pembayaran: <span className="font-semibold">{new Date(expiresAt).toLocaleString()}</span></div>
                )}
                {countdown && (
                  <div className="text-sm mt-1">Waktu tersisa: <span className="font-bold">{countdown}</span></div>
                )}
              </div>
            )}
            {copyMessage && <div className="mt-2 text-sm text-green-300">{copyMessage}</div>}
            {qrisUrl && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="text-sm text-silver-shine">QRIS Pembayaran:</div>
                <Image 
  src={qrisUrl} 
  alt="QRIS" 
  width={56} 
  height={56} 
  className="object-cover bg-white rounded"
/>
              </div>
            )}
            {orderId && (
              <div className="mt-6 p-4 bg-white/5 rounded border border-white/10">
                <div className="font-bold mb-2">Alternatif Pembayaran</div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between px-3 py-2 bg-white/3 rounded">
                    <div>
                      <div className="font-semibold">Bank Transfer (contoh: BCA)</div>
                      <div className="text-xs text-silver-shine">Nama Rekening: —</div>
                      <div className="text-xs text-silver-shine">No. Rekening: —</div>
                    </div>
                    <button onClick={() => handleCopy("—", "No. Rekening")} className="text-xs px-2 py-1 rounded bg-white/5">Copy</button>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 bg-white/3 rounded">
                    <div>
                      <div className="font-semibold">GoPay</div>
                      <div className="text-xs text-silver-shine">Nomor / ID: —</div>
                    </div>
                    <button onClick={() => handleCopy("—", "GoPay ID")} className="text-xs px-2 py-1 rounded bg-white/5">Copy</button>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 bg-white/3 rounded">
                    <div>
                      <div className="font-semibold">DANA</div>
                      <div className="text-xs text-silver-shine">Nomor / ID: —</div>
                    </div>
                    <button onClick={() => handleCopy("—", "DANA ID")} className="text-xs px-2 py-1 rounded bg-white/5">Copy</button>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 bg-white/3 rounded">
                    <div>
                      <div className="font-semibold">OVO</div>
                      <div className="text-xs text-silver-shine">Nomor / ID: —</div>
                    </div>
                    <button onClick={() => handleCopy("—", "OVO ID")} className="text-xs px-2 py-1 rounded bg-white/5">Copy</button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button disabled={submitting} type="submit" className="w-full py-3 rounded-xl bg-sunlight-orange text-blue-marine font-bold">
                {submitting ? "Memproses..." : "Konfirmasi & Buat Pesanan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
