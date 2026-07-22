"use client";

import { signOut } from "next-auth/react";

export default function LogoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a102b] border border-white/10 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Sign Out</h3>
        <p className="text-silver-shine text-sm mb-8">Are you sure you want to sign out of EUREKA 2026?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors">
            Cancel
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}