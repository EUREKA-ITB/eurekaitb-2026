"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({
  text,
  ariaLabel,
  className,
}: {
  text: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel ?? `Copy ${text}`}
      className={`ml-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${className ?? "bg-white/5 text-silver-shine hover:bg-white/10"}`}
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      <span>{copied ? "Tersalin" : "Salin"}</span>
    </button>
  );
}
