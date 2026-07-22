"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-blue-marine flex flex-col items-center justify-center p-6 relative overflow-hidden" suppressHydrationWarning>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sunlight-orange/20 blur-[150px] rounded-full z-0 pointer-events-none"></div>
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-silver-shine hover:text-white transition-colors text-sm font-semibold z-10">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-white tracking-widest mb-2">
            EUREKA<span className="text-sunlight-orange">!</span>
          </h1>
          <p className="text-silver-shine text-sm">Sign in to access the participant portal</p>
        </div>

        <form onSubmit={handleManualLogin} className="flex flex-col gap-5 mb-6" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
              placeholder="name@email.com"
              required
            />
          </div>
          <div suppressHydrationWarning>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-silver-shine uppercase tracking-wider block">Password</label>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full bg-sunlight-orange text-blue-marine font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-transform hover:scale-[1.02] mt-2 shadow-lg">
            Sign In Now
          </button>
        </form>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-silver-shine text-xs uppercase tracking-wider">OR</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-3 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-silver-shine">
          Don`t have an account? <Link href="/register" className="text-sunlight-orange hover:underline font-bold">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}