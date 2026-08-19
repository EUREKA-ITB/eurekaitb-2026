"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock3,
  CheckCircle2,
  XCircle,
  Hourglass,
  Upload,
  Mail,
  Headphones,
  MapPin,
  Truck,
  Sparkles,
} from "lucide-react";
import CopyButton from "@/components/CopyButton";
import EmailHelpButton from "@/components/EmailHelpButton";
import { Button } from "@/components/ui/button";

// ============================================================================
// TIPE DATA - mengikuti draft schema (merchOrders, merchOrderItems)
// TODO: ganti dengan tipe hasil query drizzle yang sesungguhnya begitu
// tabel merchOrders/merchOrderItems sudah ada di src/db/schema.ts
// ============================================================================
type PaymentStatus = "unpaid" | "pending" | "verified" | "rejected";

type OrderItem = {
  productName: string;
  variant?: string;
  quantity: number;
  priceAtOrder: number;
};

type Order = {
  id: string;
  statusPayment: PaymentStatus;
  totalAmount: number; // sudah termasuk kode unik
  proofUrl?: string | null;
  paymentStartedAt: string | null; // ISO string
  adminNotes?: string | null;
  shippingMethod: "pickup" | "delivery";
  shippingAddress?: string | null;
  createdAt: string;
  items: OrderItem[];
};

// ============================================================================
// MOCK DATA - TODO: ganti dengan fetch ke database berdasarkan params.id
// contoh nanti: const order = await db.query.merchOrders.findFirst({ where: eq(merchOrders.id, id), with: { items: true } })
// ============================================================================
function getMockOrder(id: string): Order {
  return {
    id,
    statusPayment: "unpaid",
    totalAmount: 175123,
    proofUrl: null,
    paymentStartedAt: new Date().toISOString(),
    adminNotes: null,
    shippingMethod: "pickup",
    shippingAddress: null,
    createdAt: new Date().toISOString(),
    items: [
      { productName: "Kaos EUREKA! ITB 2026", variant: "L", quantity: 1, priceAtOrder: 120000 },
      { productName: "Totebag EUREKA! ITB 2026", variant: undefined, quantity: 1, priceAtOrder: 55000 },
    ],
  };
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; icon: typeof Clock3; color: string; bg: string; description: string }
> = {
  unpaid: {
    label: "Menunggu Pembayaran",
    icon: Clock3,
    color: "text-sunlight-orange",
    bg: "bg-sunlight-orange/10 border-sunlight-orange/30",
    description: "Selesaikan pembayaran sebelum batas waktu habis agar pesanan tidak otomatis dibatalkan.",
  },
  pending: {
    label: "Menunggu Verifikasi",
    icon: Hourglass,
    color: "text-blue-300",
    bg: "bg-blue-500/10 border-blue-400/30",
    description: "Bukti pembayaran kamu sedang diperiksa oleh tim kami. Proses ini biasanya memakan waktu 1x24 jam.",
  },
  verified: {
    label: "Pembayaran Terverifikasi",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-400/30",
    description: "Pesanan kamu sudah dikonfirmasi. Terima kasih sudah berbelanja merchandise EUREKA! ITB 2026.",
  },
  rejected: {
    label: "Pembayaran Ditolak",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-400/30",
    description: "Bukti pembayaran kamu belum bisa diverifikasi. Silakan cek catatan admin dan unggah ulang bukti yang valid.",
  },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

function useCountdown(startedAt: string | null, durationMinutes = 180) {
  const deadline = useMemo(() => {
    if (!startedAt) return null;
    return new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
  }, [startedAt, durationMinutes]);

  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => setRemainingMs(Math.max(deadline - Date.now(), 0));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (remainingMs === null) return null;
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, expired: remainingMs <= 0 };
}

export default function MerchOrderStatusPage() {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  // TODO: ganti mock ini dengan data asli hasil fetch server-side/API route
  const [order] = useState<Order>(() => getMockOrder(orderId));
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const countdown = useCountdown(order.statusPayment === "unpaid" ? order.paymentStartedAt : null);
  const config = statusConfig[order.statusPayment];
  const StatusIcon = config.icon;

  const subtotal = order.items.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
  const uniqueCode = order.totalAmount - subtotal;

  const whatsappNumber = process.env.NEXT_PUBLIC_HELPDESK_WHATSAPP ?? "(Nomor WA belum tersedia)";
  const whatsappTemplate = encodeURIComponent(
    `Halo tim helpdesk EUREKA 2026, saya ingin menanyakan status pesanan merch dengan ID ${order.id}.`
  );

  const handleUploadProof = () => {
    if (!selectedFile) return;
    setUploading(true);
    // TODO: ganti dengan pemanggilan API/server action sesungguhnya untuk upload bukti pembayaran
    // contoh: await fetch(`/api/merch/order/${order.id}/proof`, { method: "POST", body: formData })
    setTimeout(() => {
      setUploading(false);
      alert("Simulasi unggah berhasil. Sambungkan ke API upload yang sesungguhnya di sini.");
    }, 1200);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-28 pb-20 text-white selection:bg-sunlight-orange selection:text-blue-marine overflow-x-hidden">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.35em] text-silver-shine mb-5">
            <Sparkles size={14} className="text-sunlight-orange" /> Status Pesanan Merch
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Pesanan #{order.id.slice(0, 8).toUpperCase()}</h1>
              <p className="mt-2 text-sm text-silver-shine">
                Dibuat pada {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${config.bg} ${config.color}`}>
              <StatusIcon size={18} />
              {config.label}
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-silver-shine">{config.description}</p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* KOLOM KIRI */}
          <div className="space-y-6">
            {/* PEMBAYARAN - hanya tampil kalau unpaid atau rejected */}
            {(order.statusPayment === "unpaid" || order.statusPayment === "rejected") && (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md">
                <div className="mb-6 flex items-center gap-3">
                  <Package className="text-sunlight-orange" size={22} />
                  <h2 className="font-display text-xl font-semibold text-white">Instruksi Pembayaran</h2>
                </div>

                {order.statusPayment === "rejected" && order.adminNotes && (
                  <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                    <p className="font-semibold text-red-300 mb-1">Catatan dari admin:</p>
                    {order.adminNotes}
                  </div>
                )}

                {order.statusPayment === "unpaid" && countdown && !countdown.expired && (
                  <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sunlight-orange/30 bg-sunlight-orange/10 p-4">
                    <Clock3 className="text-sunlight-orange shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-silver-shine">Selesaikan pembayaran dalam</p>
                      <p className="font-display text-lg font-bold text-sunlight-orange">
                        {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                )}

                {order.statusPayment === "unpaid" && countdown?.expired && (
                  <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                    Batas waktu pembayaran sudah habis. Silakan hubungi helpdesk untuk membuat pesanan ulang.
                  </div>
                )}

                <div className="space-y-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-silver-shine">Transfer ke rekening</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="font-display text-lg font-bold text-white">BCA 1234567890 a.n. EUREKA ITB</p>
                      <CopyButton text="1234567890" ariaLabel="Copy nomor rekening" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-silver-shine">Total pembayaran (termasuk kode unik)</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="font-display text-xl font-bold text-sunlight-orange">{formatRupiah(order.totalAmount)}</p>
                      <CopyButton text={String(order.totalAmount)} ariaLabel="Copy total pembayaran" />
                    </div>
                    <p className="mt-1 text-xs text-silver-shine">
                      Subtotal {formatRupiah(subtotal)} + kode unik {formatRupiah(uniqueCode)}. Transfer sesuai nominal persis agar mudah diverifikasi.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-white mb-3">Unggah Bukti Pembayaran</p>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-black/20 p-8 text-center cursor-pointer hover:border-sunlight-orange/40 transition-colors">
                    <Upload className="text-sunlight-orange" size={24} />
                    <span className="text-sm text-silver-shine">
                      {selectedFile ? selectedFile.name : "Klik untuk pilih file (JPG/PNG/PDF, maks 5MB)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <Button
                    type="button"
                    disabled={!selectedFile || uploading}
                    onClick={handleUploadProof}
                    className="mt-4 w-full rounded-full bg-sunlight-orange px-6 py-3.5 text-sm font-bold text-blue-marine hover:bg-yellow-400 disabled:opacity-50"
                  >
                    {uploading ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
                  </Button>
                </div>
              </div>
            )}

            {/* PENDING */}
            {order.statusPayment === "pending" && (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md text-center">
                <Hourglass className="mx-auto text-blue-300" size={32} />
                <p className="mt-4 font-display text-lg font-semibold text-white">Bukti pembayaran sedang diperiksa</p>
                <p className="mt-2 text-sm text-silver-shine max-w-md mx-auto">
                  Tim kami akan memverifikasi pembayaran kamu secepatnya. Kamu akan mendapat notifikasi begitu status berubah.
                </p>
              </div>
            )}

            {/* VERIFIED */}
            {order.statusPayment === "verified" && (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md">
                <div className="mb-6 flex items-center gap-3">
                  {order.shippingMethod === "pickup" ? (
                    <MapPin className="text-emerald-400" size={22} />
                  ) : (
                    <Truck className="text-emerald-400" size={22} />
                  )}
                  <h2 className="font-display text-xl font-semibold text-white">
                    {order.shippingMethod === "pickup" ? "Informasi Pengambilan" : "Informasi Pengiriman"}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-silver-shine">
                  {order.shippingMethod === "pickup"
                    ? "Merchandise bisa diambil di secretariat HIMAFI ITB pada jam kerja. Tunjukkan halaman ini atau ID pesanan kamu ke panitia."
                    : `Merchandise akan dikirim ke: ${order.shippingAddress ?? "alamat belum diisi"}. Nomor resi akan diinfokan menyusul.`}
                </p>
              </div>
            )}

            {/* DAFTAR ITEM */}
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md">
              <h2 className="font-display text-xl font-semibold text-white mb-4">Rincian Pesanan</h2>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.productName}</p>
                      <p className="text-xs text-silver-shine">
                        {item.variant ? `Varian: ${item.variant} · ` : ""}Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-white">{formatRupiah(item.priceAtOrder * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <p className="text-sm font-semibold text-silver-shine">Total</p>
                <p className="font-display text-lg font-bold text-sunlight-orange">{formatRupiah(order.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* SIDEBAR HELPDESK */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sunlight-orange/15 to-white/5 p-6 shadow-xl backdrop-blur-md">
              <div className="mb-4 flex items-center gap-3">
                <Headphones className="text-sunlight-orange" size={22} />
                <h2 className="font-display text-xl font-semibold text-white">Butuh Bantuan?</h2>
              </div>
              <p className="text-sm leading-relaxed text-silver-shine mb-5">
                Ada kendala dengan pesanan atau pembayaran kamu? Hubungi tim support kami.
              </p>
              <div className="flex flex-col gap-3">
                <EmailHelpButton />
                <Button
                  asChild
                  className="w-full rounded-full border border-sunlight-orange/40 bg-sunlight-orange px-4 py-2 text-sm font-semibold text-blue-marine hover:bg-yellow-400"
                >
                  <a href={`https://wa.me/${whatsappNumber}?text=${whatsappTemplate}`} target="_blank" rel="noreferrer">
                    Hubungi via WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
              <div className="mb-3 flex items-center gap-3">
                <Mail className="text-sunlight-orange" size={20} />
                <p className="font-semibold text-white text-sm">Email Support</p>
              </div>
              <a href="mailto:officialeurekaitb@gmail.com" className="text-sm text-silver-shine hover:text-white transition-colors">
                officialeurekaitb@gmail.com
              </a>
            </div>

            <Link
              href="/merch"
              className="block text-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Kembali ke Katalog Merch
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
