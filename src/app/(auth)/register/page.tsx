"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", institution: "", level: "SMA", nisn: "", email: "", password: "", confirmPassword: "" 
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json() as { error?: string; message?: string };

      if (!res.ok) {
        toast.error(data.error || "Failed to register");
      } else {
        toast.success("Account created successfully! Redirecting...");
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          callbackUrl: "/dashboard",
        });
      }
    } catch (error) {
      toast.error("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-marine flex flex-col items-center justify-center p-6 relative overflow-hidden py-20">
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-sunlight-orange/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>

      <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-silver-shine hover:text-white transition-colors text-sm font-semibold z-10">
        <ArrowLeft size={16} /> Back to Login
      </Link>

      <div className="w-full max-w-[500px] bg-white/5 border border-white/10 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-white tracking-widest mb-2">
            CREATE <span className="text-sunlight-orange">ACCOUNT</span>
          </h1>
          <p className="text-silver-shine text-sm">Complete your data to start your journey.</p>
        </div>

        {/* GOOGLE SIGN UP BUTTON ADDED HERE */}
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

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-silver-shine text-xs uppercase tracking-wider">OR REGISTER WITH EMAIL</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">Full Name</label>
            <input 
              required type="text" placeholder="Match with your ID"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-2/3">
              <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">Institution / School</label>
              <input 
                required type="text" placeholder="e.g. SMAN 1 Bandung"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
                value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})}
              />
            </div>
            <div className="w-1/3">
              <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">Level</label>
              <select 
                className="w-full bg-[#050A1F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm appearance-none cursor-pointer"
                value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})}
              >
                <option value="SMA">High School</option>
                <option value="S1">Undergrad (S1)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">Identity Number (NISN/NIM)</label>
            <input 
              required type="text" placeholder="Enter NISN or NIM"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
              value={formData.nisn} onChange={(e) => setFormData({...formData, nisn: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">Email Address</label>
            <input 
              required type="email" placeholder="name@email.com"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">Password</label>
              <input 
                required type="password" placeholder="Min. 6 characters" minLength={6}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="w-1/2">
              <label className="text-xs font-bold text-silver-shine uppercase tracking-wider mb-2 block">Confirm Password</label>
              <input 
                required type="password" placeholder="Repeat password" minLength={6}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors text-sm"
                value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-sunlight-orange text-blue-marine font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-transform hover:scale-[1.02] mt-4 shadow-lg">
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-silver-shine mt-6">
          Already registered? <Link href="/login" className="text-sunlight-orange hover:underline font-bold">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}