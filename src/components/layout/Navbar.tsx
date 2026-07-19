"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Globe, LogOut } from "lucide-react";
import type { Session } from "next-auth";

export default function Navbar({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);

  // Fungsi DOM Hijacking Google Translate
  const changeLanguage = (langCode: string) => {
    const selectField = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (selectField) {
      selectField.value = langCode;
      selectField.dispatchEvent(new Event("change"));
    }
    setLangMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-blue-marine/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* KIRI: Hamburger Menu (Sekarang muncul di semua layar) & Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            // md:hidden sudah dihapus!
            className="text-white hover:text-sunlight-orange transition-colors p-1"
          >
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>

          <Link href="/" className="font-display font-bold text-xl md:text-2xl text-white tracking-widest">
            EUREKA<span className="text-sunlight-orange">2026</span>
          </Link>
        </div>

        {/* KANAN: Fitur Bahasa & Auth */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Tombol Translate */}
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)} 
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-silver-shine hover:text-white transition-all"
              aria-label="Pilih Bahasa"
            >
              <Globe size={20} />
            </button>
            
            {/* Dropdown Bahasa */}
            {langMenuOpen && (
              <div className="absolute top-12 right-0 bg-blue-marine/95 backdrop-blur-md border border-white/10 rounded-xl p-2 flex flex-col gap-1 w-36 shadow-2xl z-50">
                <button onClick={() => changeLanguage('id')} className="text-left px-4 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors font-medium">🇮🇩 Indonesia</button>
                <button onClick={() => changeLanguage('en')} className="text-left px-4 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors font-medium">🇬🇧 English</button>
                <button onClick={() => changeLanguage('ko')} className="text-left px-4 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors font-medium">🇰🇷 한국어</button>
                <button onClick={() => changeLanguage('ja')} className="text-left px-4 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors font-medium">🇯🇵 日本語</button>
                <button onClick={() => changeLanguage('zh-CN')} className="text-left px-4 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors font-medium">🇨🇳 中文</button>
              </div>
            )}
          </div>

          {/* User Info & Tombol Auth (Desktop) */}
          {session ? (
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full p-1.5 pr-5 gap-4">
              {/* Avatar Profile */}
              {session.user?.image ? (
                <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-sunlight-orange object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sunlight-orange text-blue-marine flex items-center justify-center font-bold text-sm">
                  {session.user?.name?.charAt(0)}
                </div>
              )}
              
              {/* Teks Identitas */}
              <div className="flex flex-col text-left mr-2">
                <span className="text-[10px] text-silver-shine uppercase tracking-wider">Masuk sebagai</span>
                <span className="text-sm font-bold text-sunlight-orange leading-tight">{session.user?.name}</span>
              </div>

              {/* Garis Pembatas Vertikal */}
              <div className="w-px h-6 bg-white/20"></div>

              {/* Tombol Logout Ramping */}
              <Link 
                href="/api/auth/signout" 
                className="flex items-center gap-2 text-sm font-bold text-maroon-flash hover:text-red-400 transition-colors"
              >
                <LogOut size={16} /> Keluar
              </Link>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="hidden md:flex px-6 py-2.5 rounded-full bg-sunlight-orange text-blue-marine hover:bg-yellow-400 transition-all text-sm font-bold"
            >
              Sign In / Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* HAMBURGER MENU - BISA DIBUKA DI DESKTOP & MOBILE            */}
      {/* ========================================================= */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full md:w-[400px] bg-blue-marine/95 backdrop-blur-xl border-b md:border-r md:border-b-0 border-white/10 shadow-2xl md:min-h-[calc(100vh-80px)] overflow-y-auto transition-all">
          <div className="p-6 md:p-8 flex flex-col h-full">
            
            {/* SEKSI 1: AUTHENTICATION & PROFIL (Muncul di Mobile saja karena Desktop sudah ada di Navbar atas) */}
            <div className="md:hidden">
              {session ? (
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="User" className="w-12 h-12 rounded-full border-2 border-sunlight-orange object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-sunlight-orange text-blue-marine flex items-center justify-center font-bold text-xl">
                        {session.user?.name?.charAt(0)}
                      </div>
                    )}
                    <div className="text-left flex-1 overflow-hidden">
                      <p className="text-silver-shine text-xs uppercase tracking-wider mb-1">Masuk sebagai</p>
                      <p className="text-white font-bold text-lg leading-tight truncate">{session.user?.name}</p>
                    </div>
                  </div>
                  <Link 
                    href="/api/auth/signout" 
                    className="bg-maroon-flash/20 text-red-400 border border-maroon-flash/30 px-4 py-2 rounded-lg text-sm font-bold hover:bg-maroon-flash/40 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Logout
                  </Link>
                </div>
              ) : (
                <div className="pb-6 mb-6 border-b border-white/10">
                  <Link 
                    href="/login" 
                    className="w-full flex justify-center py-3.5 bg-sunlight-orange text-blue-marine font-bold rounded-xl hover:bg-yellow-400 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In / Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* SEKSI 2: MENU UTAMA */}
            <div className="flex flex-col gap-3 flex-1">
              {/* Jika Desktop & Sudah Login, pastikan tombol Dashboard tetap ada di atas */}
              {session && (
                <Link 
                  href="/dashboard" 
                  className="w-full text-left p-4 rounded-xl font-bold text-blue-marine bg-sunlight-orange hover:bg-yellow-400 transition-colors mb-4 md:mb-6 shadow-lg flex justify-between items-center" 
                  onClick={() => setIsOpen(false)}
                >
                  <span>Dashboard Peserta</span>
                  <span>→</span>
                </Link>
              )}
              
              <Link 
                href="/#informasi" 
                className="w-full text-left p-4 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" 
                onClick={() => setIsOpen(false)}
              >
                Informasi Umum
              </Link>
              
              <Link 
                href="/#timeline" 
                className="w-full text-left p-4 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" 
                onClick={() => setIsOpen(false)}
              >
                Timeline Kegiatan
              </Link>
              
              <Link 
                href="/#lomba" 
                className="w-full text-left p-4 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" 
                onClick={() => setIsOpen(false)}
              >
                Kategori Lomba
              </Link>
              
              <Link 
                href="/#kontak" 
                className="w-full text-left p-4 rounded-xl font-semibold text-silver-shine hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" 
                onClick={() => setIsOpen(false)}
              >
                Narahubung & Sponsor
              </Link>
            </div>
            
            {/* Footer Menu di Desktop Panel */}
            <div className="hidden md:block mt-8 pt-6 border-t border-white/10 text-xs text-silver-shine text-center">
              © 2026 EUREKA ITB. All rights reserved.
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}