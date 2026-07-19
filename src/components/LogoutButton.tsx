"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 px-5 py-2 rounded-full border border-maroon-flash hover:bg-maroon-flash transition-colors text-xs sm:text-sm font-semibold text-white cursor-pointer"
    >
      <LogOut size={16} /> Keluar
    </button>
  );
}