"use client";

import { useState } from "react";

const EMAIL = "officialeurekaitb@gmail.com";
const SUBJECT = "Tanya EUREKA 2026";

export default function EmailHelpButton() {
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = async () => {
    const subject = encodeURIComponent(SUBJECT);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `mailto:${EMAIL}?subject=${subject}`;
    } else {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${subject}`;
      window.open(gmailUrl, "_blank");
    }

    try {
      await navigator.clipboard.writeText(EMAIL);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    } catch (error) {
      console.warn("Unable to copy email to clipboard", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex w-full justify-center rounded-full border border-sunlight-orange/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      {isCopied ? "Hubungi via Email (tersalin)" : "Hubungi via Email"}
    </button>
  );
}
