"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json() as { error?: string; message?: string };

      if (!res.ok) {
        toast.error(data.error || "Gagal mendaftar");
      } else {
        toast.success("Akun berhasil dibuat! Mengalihkan...");
        // Auto-login setelah berhasil buat akun
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          callbackUrl: "/dashboard",
        });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-marine flex flex-col items-center justify-center p-6 box-border overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070')] bg-cover bg-center opacity-10 z-0"></div>
      
      <Link href="/" className="absolute top-8 left-8 text-silver-shine hover:text-white transition-colors text-sm z-10 font-semibold">
        ← Beranda
      </Link>

      <div className="w-full max-w-md bg-blue-marine/80 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-white tracking-widest mb-2">
            DAFTAR <span className="text-sunlight-orange">AKUN</span>
          </h1>
          <p className="text-silver-shine text-sm">Buat akun untuk mendaftar EUREKA 2026</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4 mb-6">
          <div>
            <label className="text-sm font-semibold text-silver-shine mb-1 block">Nama Lengkap</label>
            <input 
              required type="text" placeholder="John Doe"
              className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-silver-shine mb-1 block">Email Aktif</label>
            <input 
              required type="email" placeholder="nama@email.com"
              className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-silver-shine mb-1 block">Password</label>
            <input 
              required type="password" placeholder="••••••••" minLength={6}
              className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-sunlight-orange text-blue-marine font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors mt-2 text-sm shadow-lg">
            {isLoading ? "Memproses..." : "Buat Akun Sekarang"}
          </button>
        </form>

        <p className="text-center text-sm text-silver-shine">
          Sudah punya akun? <Link href="/login" className="text-sunlight-orange hover:underline font-bold">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}