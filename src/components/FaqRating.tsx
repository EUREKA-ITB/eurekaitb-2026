"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function FaqRating() {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const handleRating = (value: number) => {
    setRating(value);
    setFeedback("Terima kasih atas penilaian Anda!");
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-sm">
      <h3 className="font-display text-lg font-semibold text-white">Apakah Anda terbantu oleh Support Center?</h3>
      <p className="text-silver-shine mt-2">Beri nilai pada pelayanan kami agar kami bisa meningkatkan helpdesk.</p>
      <div className="mt-4 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => handleRating(score)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
              rating === score ? "border-sunlight-orange bg-sunlight-orange/20 text-sunlight-orange" : "border-white/10 text-silver-shine hover:border-sunlight-orange hover:text-sunlight-orange"
            }`}
            aria-label={`Rating ${score} star`}
          >
            <Star size={18} />
          </button>
        ))}
      </div>
      {feedback && <p className="mt-4 rounded-2xl bg-white/5 p-3 text-xs text-green-300">{feedback}</p>}
    </div>
  );
}
