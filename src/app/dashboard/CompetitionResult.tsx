export default function CompetitionResult({
  resultStatus,
  resultNotes,
}: {
  resultStatus: string;
  resultNotes: string | null;
}) {
  if (resultStatus === "pending") return null;

  const title =
    resultStatus === "winner"
      ? "Selamat, tim kamu menjadi pemenang!"
      : resultStatus === "finalist"
        ? "Tim kamu terpilih sebagai finalis."
        : "Hasil seleksi telah diumumkan.";

  return (
    <section
      aria-live="polite"
      className="mb-6 min-w-0 rounded-2xl border border-sunlight-orange/30 bg-sunlight-orange/10 p-5 sm:p-6"
    >
      <h2 className="break-words text-lg font-bold text-sunlight-orange">{title}</h2>
      {resultStatus === "not_selected" && (
        <p className="mt-2 text-sm text-white">
          Terima kasih sudah mengikuti EUREKA! ITB 2026.
        </p>
      )}
      {resultNotes && (
        <p className="mt-3 break-words text-sm leading-relaxed text-silver-shine">
          {resultNotes}
        </p>
      )}
    </section>
  );
}