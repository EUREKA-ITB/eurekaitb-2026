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

    return (
      <section
        key={type}
        className="min-w-0 rounded-xl border border-white/10 bg-black/15 p-4"
      >
        <h4 className="font-semibold">{submissionLabels[type]}</h4>
        <p className="mt-1 text-xs text-silver-shine">Status: {status}</p>

        {url ? (
          <a
            className="mt-3 block break-all text-sm text-sky-300 underline"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Buka berkas
          </a>
        ) : (
          <p className="mt-3 text-sm text-silver-shine">Belum dikumpulkan.</p>
        )}

        <textarea
          value={notes[noteKey] ?? savedNotes ?? ""}
          onChange={(event) =>
            setNotes((current) => ({
              ...current,
              [noteKey]: event.target.value,
            }))
          }
          placeholder="Catatan untuk revisi atau penolakan"
          className="mt-3 min-h-20 w-full resize-y rounded-lg border border-white/15 bg-black/20 p-3 text-sm outline-none focus:border-sunlight-orange"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busyId === team.id || !url}
            onClick={() => update(team, "submission", "revision", type)}
            className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold disabled:opacity-50"
          >
            Minta revisi
          </button>
          <button
            type="button"
            disabled={busyId === team.id || !url}
            onClick={() => update(team, "submission", "accepted", type)}
            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold disabled:opacity-50"
          >
            Terima
          </button>
          <button
            type="button"
            disabled={busyId === team.id || !url}
            onClick={() => update(team, "submission", "rejected", type)}
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold disabled:opacity-50"
          >
            Tolak
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {error && (
        <p
          role="alert"
          className="break-words rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama tim"
          className="min-w-0 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-sunlight-orange"
        />

        <select
          value={competitionFilter}
          onChange={(event) => setCompetitionFilter(event.target.value)}
          className="min-w-0 rounded-xl border border-white/15 bg-blue-marine px-4 py-3 text-sm text-white outline-none focus:border-sunlight-orange"
        >
          <option value="all">Semua lomba</option>
          <option value="science-project">Science Project</option>
          <option value="industrial-case">Industrial Case</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="min-w-0 rounded-xl border border-white/15 bg-blue-marine px-4 py-3 text-sm text-white outline-none focus:border-sunlight-orange"
        >
          <option value="all">Semua status</option>
          <option value="waiting">Menunggu abstrak</option>
          <option value="passed">Abstrak lolos</option>
          <option value="failed">Abstrak tidak lolos</option>
          <option value="unpaid">Belum membayar</option>
          <option value="pending">Pembayaran diperiksa</option>
          <option value="verified">Pembayaran terverifikasi</option>
          <option value="submitted">Submission masuk</option>
          <option value="revision">Perlu revisi</option>
          <option value="accepted">Submission diterima</option>
          <option value="rejected">Submission ditolak</option>
          <option value="finalist">Finalis</option>
          <option value="winner">Pemenang</option>
          <option value="not_selected">Tidak terpilih</option>
        </select>
      </div>

      {visibleTeams.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-silver-shine">
          Tidak ada tim yang cocok dengan pencarian atau filter.
        </div>
      ) : (
        visibleTeams.map((team) => {
          const isSPC =
            team.compeType.replace(/_/g, "-") === "science-project";
          const isBusy = busyId === team.id;
          const noteKey = `${team.id}:result`;
          const requiredSubmissionsAccepted = isSPC
            ? team.submissionStatus === "accepted" &&
              team.posterStatus === "accepted" &&
              team.presentationStatus === "accepted"
            : team.submissionStatus === "accepted";

          return (
            <article
              key={team.id}
              className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6"
            >
              <header className="flex min-w-0 flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-bold">{team.teamName}</h2>
                  <p className="mt-1 break-words text-xs uppercase tracking-wider text-silver-shine">
                    {team.compeType.replace(/_/g, " ").replace(/-/g, " ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    Abstrak: {team.abstractStatus}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    Pembayaran: {team.statusPayment}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    Hasil: {team.resultStatus}
                  </span>
                </div>
              </header>

              <div className="mt-5 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
                <section className="min-w-0 space-y-3">
                  <h3 className="font-semibold">Seleksi abstrak</h3>

                  {team.abstractUrl ? (
                    <a
                      className="block break-all text-sm text-sky-300 underline"
                      href={team.abstractUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka abstrak
                    </a>
                  ) : (
                    <p className="text-sm text-silver-shine">
                      Belum ada file abstrak.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => update(team, "abstract", "passed")}
                      className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold disabled:opacity-50"
                    >
                      Lolos
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => update(team, "abstract", "failed")}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold disabled:opacity-50"
                    >
                      Tidak lolos
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => update(team, "abstract", "waiting")}
                      className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold disabled:opacity-50"
                    >
                      Kembalikan ke menunggu
                    </button>
                  </div>

                  <p className="text-xs text-silver-shine">
                    Verifikasi pembayaran dilakukan dari halaman admin utama.
                  </p>
                </section>

                <section className="min-w-0 space-y-3">
                  <h3 className="font-semibold">Submission kompetisi</h3>

                  {team.abstractStatus !== "passed" ||
                  team.statusPayment !== "verified" ? (
                    <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-silver-shine">
                      Submission dibuka setelah abstrak lolos dan pembayaran
                      terverifikasi.
                    </p>
                  ) : (
                    <div className="space-y-3">
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
              </div>

              <section className="mt-5 min-w-0 border-t border-white/10 pt-5">
                <h3 className="font-semibold">Hasil akhir · {team.resultStatus}</h3>
                <textarea
                  value={notes[noteKey] ?? team.resultNotes ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({
                      ...current,
                      [noteKey]: event.target.value,
                    }))
                  }
                  placeholder="Catatan pengumuman hasil"
                  className="mt-3 min-h-20 w-full resize-y rounded-lg border border-white/15 bg-black/20 p-3 text-sm outline-none focus:border-sunlight-orange"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isBusy || !requiredSubmissionsAccepted}
                    onClick={() => update(team, "result", "finalist")}
                    className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-bold disabled:opacity-50"
                  >
                    Finalis
                  </button>
                  <button
                    type="button"
                    disabled={isBusy || !requiredSubmissionsAccepted}
                    onClick={() => update(team, "result", "winner")}
                    className="rounded-lg bg-sunlight-orange px-3 py-2 text-xs font-bold text-blue-marine disabled:opacity-50"
                  >
                    Pemenang
                  </button>
                  <button
                    type="button"
                    disabled={isBusy || !requiredSubmissionsAccepted}
                    onClick={() => update(team, "result", "not_selected")}
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold disabled:opacity-50"
                  >
                    Tidak terpilih
                  </button>
                </div>
              </section>
            </article>
          );
        })
      )}
    </section>
  );
}