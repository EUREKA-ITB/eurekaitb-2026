"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, X, LayoutDashboard, Settings } from "lucide-react";
import type { Session } from "next-auth";
import LogoutModal from "./LogoutModal";

export default function Navbar({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileCompeOpen, setIsMobileCompeOpen] = useState<boolean>(false);

  const competitionLinks = [
    { label: "Physics Olympiad", href: "/competition/physics_olympiad" },
    { label: "Science Project", href: "/competition/science_project" },
    { label: "Industrial Case", href: "/competition/industrial_case" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-blue-marine/85 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/10 bg-white/5 text-white hover:text-sunlight-orange hover:bg-white/10 transition-colors shrink-0"
              aria-label="Buka menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="flex flex-col leading-none min-w-0">
              <span className="font-display font-bold text-lg sm:text-xl tracking-widest text-white truncate">
                EUREKA! <span className="text-sunlight-orange">ITB 2026</span>
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-silver-shine">ITB Official Event</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <Link href="/" className="px-4 py-2 rounded-full text-sm font-bold text-white hover:text-sunlight-orange hover:bg-white/5 transition-colors">Home</Link>
            
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white hover:text-sunlight-orange hover:bg-white/5 transition-colors">
                Competitions <ChevronDown size={16} />
              </button>
              <div className="absolute top-full right-0 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="w-[320px] rounded-2xl border border-white/10 bg-[#0a102b]/95 backdrop-blur-2xl p-3 shadow-2xl">
                  <div className="flex flex-col gap-1">
                    {competitionLinks.map((item) => (
                      <Link key={item.href} href={item.href} className="px-3 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link href="/faq" className="px-4 py-2 rounded-full text-sm font-bold text-white hover:text-sunlight-orange hover:bg-white/5 transition-colors">FAQ</Link>
            <Link href="/side-event" className="px-4 py-2 rounded-full text-sm font-bold text-white hover:text-sunlight-orange hover:bg-white/5 transition-colors">Side Event</Link>

            {session && (
              <Link href="/dashboard" className="px-4 py-2 rounded-full text-sm font-bold text-sunlight-orange bg-sunlight-orange/10 hover:bg-sunlight-orange/20 transition-colors ml-1">
                Dashboard
              </Link>
            )}

            {session ? (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1.5 pr-4 gap-3 ml-2 hover:bg-white/10 transition-colors">
                <Link href="/dashboard" className="flex items-center gap-3 group" title="Buka Dashboard">
                  {session.user?.image ? (
                    <Image src={session.user.image} alt="User" width={32} height={32} unoptimized className="w-8 h-8 rounded-full border border-sunlight-orange object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sunlight-orange text-blue-marine flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                      {session.user?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col text-left mr-2">
                    <span className="text-[10px] text-silver-shine uppercase tracking-wider group-hover:text-white transition-colors">Masuk sebagai</span>
                    <span className="text-sm font-bold text-sunlight-orange leading-tight">{session.user?.name}</span>
                  </div>
                </Link>
                <div className="w-px h-6 bg-white/20"></div>
                <Link href="/settings" className="text-silver-shine hover:text-white transition-colors" title="Pengaturan Akun"><Settings size={18} /></Link>
                <button 
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold text-maroon-flash hover:text-red-400 transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:flex px-6 py-2.5 rounded-full bg-sunlight-orange text-blue-marine hover:bg-yellow-400 transition-all text-sm font-bold">
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>

        {/* Dropdown Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full md:w-[420px] bg-[#0a102b]/96 backdrop-blur-2xl border-b border-white/10 shadow-2xl md:min-h-[calc(100vh-80px)] overflow-y-auto transition-all">
            <div className="p-6 md:p-8 flex flex-col h-full gap-6">
              <div className="md:hidden">
                {session ? (
                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="User" width={48} height={48} unoptimized className="w-12 h-12 rounded-full border-2 border-sunlight-orange object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-sunlight-orange text-blue-marine flex items-center justify-center font-bold text-xl">{session.user?.name?.charAt(0)}</div>
                      )}
                      <div className="text-left flex-1 overflow-hidden">
                        <p className="text-silver-shine text-xs uppercase tracking-wider mb-1">Masuk sebagai</p>
                        <p className="text-white font-bold text-lg leading-tight truncate">{session.user?.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setIsOpen(false); setIsLogoutModalOpen(true); }}
                      className="flex items-center gap-2 text-sm font-bold text-maroon-flash hover:text-red-400 transition-colors ml-1"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="pb-6 mb-6 border-b border-white/10">
                    <Link href="/login" className="w-full flex justify-center py-3.5 bg-sunlight-orange text-blue-marine font-bold rounded-xl hover:bg-yellow-400 transition-colors" onClick={() => setIsOpen(false)}>Sign In / Sign Up</Link>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {session && (
                  <>
                    <Link href="/dashboard" className="w-full text-left p-4 rounded-2xl font-bold text-blue-marine bg-sunlight-orange hover:bg-yellow-400 transition-colors shadow-lg flex justify-between items-center" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-2"><LayoutDashboard size={18} /><span>Dashboard Peserta</span></div><span>→</span>
                    </Link>
                    <Link href="/settings" className="w-full text-left p-4 rounded-2xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex justify-between items-center" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-2"><Settings size={18} /><span>Pengaturan Akun</span></div>
                    </Link>
                  </>
                )}
                <p className="px-2 pt-2 mt-2 text-[10px] uppercase tracking-[0.35em] text-silver-shine">Navigation</p>
<Link href="/" className="w-full text-left p-4 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" onClick={() => setIsOpen(false)}>Home</Link>

{/* BAGIAN COMPETITIONS UNTUK MOBILE (DROPDOWN) */}
<div className="w-full flex flex-col">
  <button 
    onClick={() => setIsMobileCompeOpen(!isMobileCompeOpen)}
    className="w-full text-left p-4 rounded-xl font-bold text-white/80 hover:bg-white/5 flex justify-between items-center transition-colors"
  >
    <span>Competitions</span>
    <ChevronDown size={16} className={`transition-transform ${isMobileCompeOpen ? "rotate-180" : ""}`} />
  </button>
  
  {isMobileCompeOpen && (
    <div className="flex flex-col pl-4 border-l border-white/10 ml-6 gap-1 mb-2 mt-1">
      <Link href="/competition/physics_olympiad" className="w-full text-left p-3 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsOpen(false)}>Physics Olympiad</Link>
      <Link href="/competition/science_project" className="w-full text-left p-3 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsOpen(false)}>Science Project</Link>
      <Link href="/competition/industrial_case" className="w-full text-left p-3 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsOpen(false)}>Industrial Case</Link>
    </div>
  )}
</div>

<Link href="/faq" className="w-full text-left p-4 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" onClick={() => setIsOpen(false)}>FAQ Umum</Link>
<Link href="/side-event" className="w-full text-left p-4 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" onClick={() => setIsOpen(false)}>Side Event</Link>
              </div>
              <div className="hidden md:block mt-8 pt-6 border-t border-white/10 text-xs text-silver-shine text-center">© 2026 EUREKA ITB. All rights reserved.</div>
            </div>
          </div>
        )}
      </nav>
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </>
  );
}