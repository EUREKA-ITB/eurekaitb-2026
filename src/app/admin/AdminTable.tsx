"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Struktur data yang ketat (Bebas dari 'any')
interface AdminTeamData {
  id: string;
  teamName: string;
  institutionName: string;
  compeType: string;
  statusPayment: string;
  document: { urlIdentitas: string | null; urlPayment: string | null } | null;
}

export default function AdminTable({ initialData }: { initialData: AdminTeamData[] }) {
  const router = useRouter();
  const [teams, setTeams] = useState<AdminTeamData[]>(initialData);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // FUNGSI 1: EXPORT CSV MURNI JAVASCRIPT
  const handleExportCSV = () => {
    const headers = ["Nama Tim/Peserta", "Institusi", "Kategori Lomba", "Status", "Link KTM", "Link Bukti Bayar"];
    const rows = teams.map(t => [
      `"${t.teamName}"`, 
      `"${t.institutionName}"`, 
      t.compeType, 
      t.statusPayment, 
      t.document?.urlIdentitas || "Kosong", 
      t.document?.urlPayment || "Kosong"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Peserta_Eureka_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Berkas CSV berhasil diunduh!");
  };

  // FUNGSI 2: VERIFIKASI STATUS (Memanggil API)
  const handleVerify = async (teamId: string, currentStatus: string) => {
    const newStatus = currentStatus === "verified" ? "unpaid" : "verified";
    setIsProcessing(teamId);

    try {
      // Perhatikan URL di sini sudah disesuaikan langsung ke /api/verify
      const res = await fetch("/api/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, newStatus }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status");

      // Update UI langsung tanpa memuat ulang halaman
      setTeams(teams.map(t => t.id === teamId ? { ...t, statusPayment: newStatus } : t));
      toast.success(`Status diubah menjadi ${newStatus.toUpperCase()}`);
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      toast.error("Gagal memverifikasi peserta.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="w-full box-border">
      
      {/* Tombol Export CSV */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleExportCSV} 
          className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors shadow-lg"
        >
          ↓ Export Data to Excel/CSV
        </button>
      </div>

      {/* Tabel Utama yang Estetik (Sesuai aslinya) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 text-silver-shine text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Nama Tim / Peserta</th>
              <th className="p-4 font-semibold">Institusi</th>
              <th className="p-4 font-semibold text-center">Berkas Dokumen</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Aksi Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-silver-shine">
                  Belum ada peserta yang mendaftar.
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                  <td className="p-4">
                    <p className="font-bold text-sunlight-orange">{team.teamName}</p>
                    <p className="text-xs text-silver-shine capitalize">{team.compeType.replace("_", " ")}</p>
                  </td>
                  <td className="p-4">{team.institutionName}</td>
                  <td className="p-4 text-center space-x-3">
                    {team.document?.urlIdentitas ? (
                      <a href={team.document.urlIdentitas} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs">Lihat KTM</a>
                    ) : (
                      <span className="text-red-400 text-xs">Kosong</span>
                    )}
                    <span className="text-white/20">|</span>
                    {team.document?.urlPayment ? (
                      <a href={team.document.urlPayment} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs">Lihat Bayar</a>
                    ) : (
                      <span className="text-red-400 text-xs">Kosong</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${team.statusPayment === "verified" ? "bg-green-500/20 text-green-400" : "bg-sunlight-orange/20 text-sunlight-orange"}`}>
                      {team.statusPayment}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      disabled={isProcessing === team.id}
                      onClick={() => handleVerify(team.id, team.statusPayment)}
                      className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${team.statusPayment === "verified" ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}
                    >
                      {isProcessing === team.id ? "Loading..." : team.statusPayment === "verified" ? "Batalkan" : "Verifikasi"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}