"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard", 
    });
  };

  return (
    <div className="min-h-screen bg-blue-marine flex flex-col items-center justify-center p-6" suppressHydrationWarning>
      <Link href="/" className="absolute top-8 left-8 text-silver-shine hover:text-white transition-colors text-sm">
        ← Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-lg shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-white tracking-widest mb-2">
            EUREKA<span className="text-sunlight-orange">2026</span>
          </h1>
          <p className="text-silver-shine text-sm">Masuk atau daftar untuk melanjutkan</p>
        </div>

        {/* Tambahkan suppressHydrationWarning di form agar kebal dari extension browser */}
        <form onSubmit={handleManualLogin} className="flex flex-col gap-4 mb-6" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <label className="text-sm text-silver-shine mb-1 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-blue-marine border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors"
              placeholder="nama@email.com"
              required
              suppressHydrationWarning
            />
          </div>
          <div suppressHydrationWarning>
            <label className="text-sm text-silver-shine mb-1 block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-blue-marine border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors"
              placeholder="••••••••"
              required
              suppressHydrationWarning
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-sunlight-orange text-blue-marine font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors mt-2"
            suppressHydrationWarning
          >
            Masuk dengan Email
          </button>
        </form>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-silver-shine text-sm">Atau</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full bg-white text-blue-marine font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Lanjutkan dengan Google
        </button>
      </div>
    </div>
  );
}