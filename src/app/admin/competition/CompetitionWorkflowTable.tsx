"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SubmissionType = "fullPaper" | "poster" | "presentation";
type UpdateTarget = "abstract" | "submission" | "result";

type WorkflowTeam = {
  id: string;
  teamName: string;
  compeType: string;
  abstractUrl: string | null;
  abstractStatus: string;
  statusPayment: string;
  fullPaperUrl: string | null;
  submissionStatus: string;
  submissionNotes: string | null;
  posterUrl: string | null;
  posterStatus: string;
  posterNotes: string | null;
  presentationUrl: string | null;
  presentationStatus: string;
  presentationNotes: string | null;
  resultStatus: string;
  resultNotes: string | null;
};

const submissionLabels: Record<SubmissionType, string> = {
  fullPaper: "Full paper / report",
  poster: "Poster",
  presentation: "PDF / PPT presentasi",
};

const statusLabels: Record<string, string> = {
  waiting: "Menunggu",
  passed: "Lolos",
  failed: "Tidak lolos",
  unpaid: "Belum membayar",
  pending: "Menunggu verifikasi",
  verified: "Terverifikasi",
  not_submitted: "Belum dikumpulkan",
  submitted: "Sudah dikumpulkan",
  revision: "Perlu revisi",
  accepted: "Diterima",
  rejected: "Ditolak",
  finalist: "Finalis",
  winner: "Pemenang",
  not_selected: "Tidak terpilih",
};

function labelForStatus(status: string) {
  return statusLabels[status] ?? status.replace(/_/g, " ");
}

function statusStyle(status: string) {
  if (["passed", "verified", "accepted", "winner"].includes(status)) {
    return "border-green-500/30 bg-green-500/10 text-green-300";
  }

  if (["failed", "rejected", "not_selected"].includes(status)) {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  if (["pending", "waiting", "revision", "finalist"].includes(status)) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-white/10 bg-white/5 text-silver-shine";
}

function competitionLabel(compeType: string) {
  const normalized = compeType.replace(/_/g, "-");

  if (normalized === "science-project") return "Science Project";
  if (normalized === "industrial-case") return "Industrial Case";

  return normalized.replace(/-/g, " ");
}

function getSubmissionUrl(team: WorkflowTeam, type: SubmissionType) {
  if (type === "poster") return team.posterUrl;
  if (type === "presentation") return team.presentationUrl;
  return team.fullPaperUrl;
}

function getSubmissionStatus(team: WorkflowTeam, type: SubmissionType) {
  if (type === "poster") return team.posterStatus;
  if (type === "presentation") return team.presentationStatus;
  return team.submissionStatus;
}

function getSubmissionNotes(team: WorkflowTeam, type: SubmissionType) {
  if (type === "poster") return team.posterNotes;
  if (type === "presentation") return team.presentationNotes;
  return team.submissionNotes;
}

export default function CompetitionWorkflowTable({
  initialTeams,
}: {
  initialTeams: WorkflowTeam[];
}) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const visibleTeams = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return teams.filter((team) => {
      const competition = team.compeType.replace(/_/g, "-");
      const matchesCompetition =
        competitionFilter === "all" || competition === competitionFilter;

      const matchesSearch =
        !normalizedSearch ||
        team.teamName.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        team.abstractStatus === statusFilter ||
        team.statusPayment === statusFilter ||
        team.submissionStatus === statusFilter ||
        team.posterStatus === statusFilter ||
        team.presentationStatus === statusFilter ||
        team.resultStatus === statusFilter;

      return matchesCompetition && matchesSearch && matchesStatus;
    });
  }, [teams, search, competitionFilter, statusFilter]);

  const selectedTeam =
    teams.find((team) => team.id === selectedTeamId) ?? null;

  const counts = useMemo(
    () => ({
      total: teams.length,
      spc: teams.filter(
        (team) => team.compeType.replace(/_/g, "-") === "science-project"
      ).length,
      icc: teams.filter(
        (team) => team.compeType.replace(/_/g, "-") === "industrial-case"
      ).length,
      needsReview: teams.filter(
        (team) =>
          team.abstractStatus === "waiting" ||
          team.statusPayment === "pending" ||
          team.submissionStatus === "submitted" ||
          team.posterStatus === "submitted" ||
          team.presentationStatus === "submitted"
      ).length,
    }),
    [teams]
  );

  async function update(
    team: WorkflowTeam,
    target: UpdateTarget,
    status: string,
    type?: SubmissionType
  ) {
    const noteKey = `${team.id}:${type ?? target}`;
    const notesValue = notes[noteKey] ?? "";

    setError("");
    setBusyId(team.id);

    try {
      const response = await fetch("/api/admin/competition", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          target,
          status,
          ...(type ? { type } : {}),
          notes: notesValue,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan perubahan.");
        return;
      }

      setTeams((current) =>
        current.map((item) => {
          if (item.id !== team.id) return item;

          if (target === "abstract") {
            return { ...item, abstractStatus: status };
          }

          if (target === "result") {
            return {
              ...item,
              resultStatus: status,
              resultNotes: notesValue || null,
            };
          }

          if (type === "poster") {
            return {
              ...item,
              posterStatus: status,
              posterNotes: notesValue || null,
            };
          }

          if (type === "presentation") {
            return {
              ...item,
              presentationStatus: status,
              presentationNotes: notesValue || null,
            };
          }

          return {
            ...item,
            submissionStatus: status,
            submissionNotes: notesValue || null,
          };
        })
      );

      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setBusyId(null);
    }
  }

  function renderSubmission(team: WorkflowTeam, type: SubmissionType) {
    const url = getSubmissionUrl(team, type);
    const status = getSubmissionStatus(team, type);
    const noteKey = `${team.id}:${type}`;
    const savedNotes = getSubmissionNotes(team, type);
    const currentNotes = notes[noteKey] ?? savedNotes ?? "";
    const requiresNote = currentNotes.trim().length > 0;
    const isBusy = busyId === team.id;

    return (
      <section
        key={type}
        className="min-w-0 rounded-2xl border border-white/10 bg-[#0b1022]/80 p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h4 className="font-semibold text-white">
              {submissionLabels[type]}
            </h4>
            <p className="mt-1 text-sm text-silver-shine">
              {url ? "Berkas sudah dikumpulkan." : "Berkas belum dikumpulkan."}
            </p>
          </div>
          <span
            className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(status)}`}
          >
            {labelForStatus(status)}
          </span>
        </div>

        {url ? (
          <a
            className="mt-4 inline-flex max-w-full break-all rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-300 transition-colors hover:bg-sky-500/20"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Buka berkas
          </a>
        ) : (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-silver-shine">
            Belum ada file untuk ditinjau.
          </p>
        )}

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-silver-shine">
          Catatan revisi atau penolakan
          <textarea
            value={currentNotes}
            onChange={(event) =>
              setNotes((current) => ({
                ...current,
                [noteKey]: event.target.value,
              }))
            }
            placeholder="Isi catatan jika meminta revisi atau menolak berkas."
            className="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/20 p-3 text-sm font-normal normal-case tracking-normal text-white outline-none transition-colors placeholder:text-silver-shine/60 focus:border-sunlight-orange"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isBusy || !url || !requiresNote}
            onClick={() => update(team, "submission", "revision", type)}
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Minta revisi
          </button>
          <button
            type="button"
            disabled={isBusy || !url}
            onClick={() => update(team, "submission", "accepted", type)}
            className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-300 transition-colors hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Terima
          </button>
          <button
            type="button"
            disabled={isBusy || !url || !requiresNote}
            onClick={() => update(team, "submission", "rejected", type)}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tolak
          </button>
        </div>
      </section>
    );
  }

  function renderTeamDetails(team: WorkflowTeam) {
    const isSPC = team.compeType.replace(/_/g, "-") === "science-project";
    const isBusy = busyId === team.id;
    const resultNoteKey = `${team.id}:result`;
    const requiredSubmissionsAccepted = isSPC
      ? team.submissionStatus === "accepted" &&
        team.posterStatus === "accepted" &&
        team.presentationStatus === "accepted"
      : team.submissionStatus === "accepted";

    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-sm text-blue-300">
                  1
                </span>
                Seleksi abstrak
              </h3>
              <p className="mt-2 text-sm text-silver-shine">
                Tentukan apakah abstrak tim ini lolos ke tahap berikutnya.
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(team.abstractStatus)}`}
            >
              {labelForStatus(team.abstractStatus)}
            </span>
          </div>

          {team.abstractUrl ? (
            <a
              className="mt-4 inline-flex max-w-full break-all rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-300 transition-colors hover:bg-sky-500/20"
              href={team.abstractUrl}
              target="_blank"
              rel="noreferrer"
            >
              Buka abstrak
            </a>
          ) : (
            <p className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-silver-shine">
              Belum ada file abstrak.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => update(team, "abstract", "passed")}
              className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-300 transition-colors hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lolos
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => update(team, "abstract", "failed")}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Tidak lolos
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => update(team, "abstract", "waiting")}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-silver-shine transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Kembalikan ke menunggu
            </button>
          </div>

          <p className="mt-4 text-xs text-silver-shine">
            Verifikasi pembayaran tetap dilakukan dari halaman Admin utama.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-bold text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sunlight-orange/15 text-sm text-sunlight-orange">
                  2
                </span>
                Submission kompetisi
              </h3>
              <p className="mt-2 text-sm text-silver-shine">
                Tinjau file dan berikan keputusan untuk setiap submission.
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${
                team.abstractStatus === "passed" &&
                team.statusPayment === "verified"
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-white/10 bg-white/5 text-silver-shine"
              }`}
            >
              {team.abstractStatus === "passed" &&
              team.statusPayment === "verified"
                ? "Siap ditinjau"
                : "Menunggu syarat"}
            </span>
          </div>

          {team.abstractStatus !== "passed" ||
          team.statusPayment !== "verified" ? (
            <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-silver-shine">
              Submission dapat ditinjau setelah abstrak lolos dan pembayaran
              terverifikasi.
            </p>
          ) : (
            <div
              className={`grid min-w-0 grid-cols-1 gap-3 ${
                isSPC ? "xl:grid-cols-2" : ""
              }`}
            >
              {renderSubmission(team, "fullPaper")}
              {isSPC && (
                <>
                  {renderSubmission(team, "poster")}
                  {renderSubmission(team, "presentation")}
                </>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-sunlight-orange/20 bg-sunlight-orange/[0.04] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-bold text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sunlight-orange/15 text-sm text-sunlight-orange">
                  3
                </span>
                Hasil akhir
              </h3>
              <p className="mt-2 text-sm text-silver-shine">
                Keputusan hasil aktif setelah seluruh submission wajib diterima.
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(team.resultStatus)}`}
            >
              {labelForStatus(team.resultStatus)}
            </span>
          </div>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-silver-shine">
            Catatan pengumuman hasil
            <textarea
              value={notes[resultNoteKey] ?? team.resultNotes ?? ""}
              onChange={(event) =>
                setNotes((current) => ({
                  ...current,
                  [resultNoteKey]: event.target.value,
                }))
              }
              placeholder="Catatan tambahan untuk pengumuman hasil, jika ada."
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/20 p-3 text-sm font-normal normal-case tracking-normal text-white outline-none transition-colors placeholder:text-silver-shine/60 focus:border-sunlight-orange"
            />
          </label>

          {!requiredSubmissionsAccepted && (
            <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-sm text-amber-200">
              Hasil akhir belum bisa ditetapkan. Terima semua submission wajib
              terlebih dahulu.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isBusy || !requiredSubmissionsAccepted}
              onClick={() => update(team, "result", "finalist")}
              className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-300 transition-colors hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Finalis
            </button>
            <button
              type="button"
              disabled={isBusy || !requiredSubmissionsAccepted}
              onClick={() => update(team, "result", "winner")}
              className="rounded-lg border border-sunlight-orange/40 bg-sunlight-orange px-4 py-2 text-xs font-bold text-blue-marine transition-colors hover:bg-sunlight-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Pemenang
            </button>
            <button
              type="button"
              disabled={isBusy || !requiredSubmissionsAccepted}
              onClick={() => update(team, "result", "not_selected")}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-silver-shine transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Tidak terpilih
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="break-words">{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="w-fit rounded-lg border border-red-300/20 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/10"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-silver-shine">
            Total tim
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{counts.total}</p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
            Science Project
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-200">{counts.spc}</p>
        </div>
        <div className="rounded-2xl border border-sunlight-orange/20 bg-sunlight-orange/[0.05] p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-sunlight-orange">
            Industrial Case
          </p>
          <p className="mt-2 text-3xl font-bold text-sunlight-orange">
            {counts.icc}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Perlu ditinjau
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-200">
            {counts.needsReview}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-silver-shine">
              Cari tim
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ketik nama tim..."
              className="w-full min-w-0 rounded-xl border border-white/10 bg-[#0b1022] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-silver-shine/60 focus:border-sunlight-orange"
            />
          </label>

          <label className="min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-silver-shine">
              Kompetisi
            </span>
            <select
              value={competitionFilter}
              onChange={(event) => setCompetitionFilter(event.target.value)}
              className="w-full min-w-0 rounded-xl border border-white/10 bg-[#0b1022] px-4 py-3 text-sm text-white outline-none focus:border-sunlight-orange"
            >
              <option value="all">Semua lomba</option>
              <option value="science-project">Science Project</option>
              <option value="industrial-case">Industrial Case</option>
            </select>
          </label>

          <label className="min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-silver-shine">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full min-w-0 rounded-xl border border-white/10 bg-[#0b1022] px-4 py-3 text-sm text-white outline-none focus:border-sunlight-orange"
            >
              <option value="all">Semua status</option>
              <option value="waiting">Menunggu abstrak</option>
              <option value="passed">Abstrak lolos</option>
              <option value="failed">Abstrak tidak lolos</option>
              <option value="unpaid">Belum membayar</option>
              <option value="pending">Pembayaran diperiksa</option>
              <option value="verified">Pembayaran terverifikasi</option>
              <option value="not_submitted">Belum mengumpulkan</option>
              <option value="submitted">Submission masuk</option>
              <option value="revision">Perlu revisi</option>
              <option value="accepted">Submission diterima</option>
              <option value="rejected">Submission ditolak</option>
              <option value="finalist">Finalis</option>
              <option value="winner">Pemenang</option>
              <option value="not_selected">Tidak terpilih</option>
            </select>
          </label>
        </div>

        <p className="mt-4 text-xs text-silver-shine">
          Menampilkan {visibleTeams.length} dari {teams.length} tim.
        </p>
      </div>

      {visibleTeams.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h2 className="font-bold text-white">Tim tidak ditemukan</h2>
          <p className="mt-2 text-sm text-silver-shine">
            Coba ubah kata pencarian atau filter yang dipilih.
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleTeams.map((team) => (
            <article
              key={team.id}
              className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/10"
            >
              <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:p-5 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-sunlight-orange">
                    {competitionLabel(team.compeType)}
                  </p>
                  <h2 className="mt-1 break-words text-lg font-bold text-white sm:text-xl">
                    {team.teamName}
                  </h2>
                  <p className="mt-1 break-all text-[11px] text-silver-shine">
                    ID: {team.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setError("");
                  }}
                  className="inline-flex w-full shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-300 transition-colors hover:bg-blue-500/20 md:w-auto"
                >
                  Lihat detail
                </button>
              </div>

              <div className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-3">
                <div className="bg-[#0b1022]/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-silver-shine">
                    Abstrak
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle(team.abstractStatus)}`}
                  >
                    {labelForStatus(team.abstractStatus)}
                  </span>
                </div>
                <div className="bg-[#0b1022]/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-silver-shine">
                    Pembayaran
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle(team.statusPayment)}`}
                  >
                    {labelForStatus(team.statusPayment)}
                  </span>
                </div>
                <div className="bg-[#0b1022]/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-silver-shine">
                    Hasil akhir
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle(team.resultStatus)}`}
                  >
                    {labelForStatus(team.resultStatus)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 p-4 sm:p-5">
                <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-silver-shine">
                  Full paper: {labelForStatus(team.submissionStatus)}
                </span>
                {team.compeType.replace(/_/g, "-") === "science-project" && (
                  <>
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-silver-shine">
                      Poster: {labelForStatus(team.posterStatus)}
                    </span>
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-silver-shine">
                      Presentasi: {labelForStatus(team.presentationStatus)}
                    </span>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedTeam && (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTeamId(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="competition-team-title"
            className="my-4 w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-blue-marine shadow-2xl sm:my-8 sm:rounded-3xl"
          >
            <header className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-sunlight-orange">
                  {competitionLabel(selectedTeam.compeType)}
                </p>
                <h2
                  id="competition-team-title"
                  className="mt-1 break-words font-display text-xl font-bold text-white sm:text-2xl"
                >
                  {selectedTeam.teamName}
                </h2>
                <p className="mt-1 break-all text-xs text-silver-shine">
                  ID: {selectedTeam.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeamId(null)}
                className="w-fit rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-silver-shine transition-colors hover:bg-white/10 hover:text-white"
              >
                Tutup detail
              </button>
            </header>

            <div className="space-y-5 p-4 sm:p-6">
              {renderTeamDetails(selectedTeam)}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}