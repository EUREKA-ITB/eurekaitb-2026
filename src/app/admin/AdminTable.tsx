"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Search, X, Users, FileText, CheckCircle2, Clock, MessageCircle, DownloadCloud, ShieldCheck, Key, AlertTriangle, ArrowUpDown } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface TeamMember {
  id: string; fullName: string; email: string; phoneNumber: string; isLeader: boolean | null; grade: string;
  photoUrl: string | null; ktmUrl: string | null; proofFollowUrl: string | null; proofShareUrl: string | null;
  proofStoryCompeUrl: string | null; proofTwibbonUrl: string | null; igAccountLink: string | null;
}

interface AdminTeamData {
  id: string; teamName: string; institutionName: string; compeType: string;
  registrationPhase: string; createdAt: string;
  statusPayment: string; abstractStatus: string; abstractUrl: string | null; caseChoice: string | null;
  documentStatus: string; adminNotes: string | null;
  document: { urlPayment: string | null };
  leaderContact: { name: string; email: string; phone: string };
  members: TeamMember[];
  verifiedBy?: string | null; 
  participantNumber?: string | null;
  cbtPassword?: string | null;
}

export default function AdminTable({ initialData }: { initialData: AdminTeamData[] }) {
  const router = useRouter();
  const [teams, setTeams] = useState<AdminTeamData[]>(initialData);
  const [prevInitialData, setPrevInitialData] = useState<AdminTeamData[]>(initialData);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [phaseFilter, setPhaseFilter] = useState<string>("ALL");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "createdAt", direction: "desc" });
  
  const [selectedTeam, setSelectedTeam] = useState<AdminTeamData | null>(null);
  const [tempNotes, setTempNotes] = useState<string>("");

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setTeams(initialData);
    if (selectedTeam) {
      const updatedSelected = initialData.find(t => t.id === selectedTeam.id);
      if (updatedSelected) {
        setSelectedTeam(updatedSelected);
        setTempNotes(updatedSelected.adminNotes || "");
      }
    }
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split("|");
    setSortConfig({ key, direction: direction as "asc" | "desc" });
  };

  const filteredTeams = teams.filter(t => {
    const dbType = t.compeType.replace(/_/g, "-");
    const matchTab = activeTab === "ALL" || dbType === activeTab;
    const matchPhase = phaseFilter === "ALL" || t.registrationPhase === phaseFilter;
    const matchSearch = t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.institutionName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchPhase && matchSearch;
  }).sort((a, b) => {
    if (sortConfig.key === "createdAt") {
      return sortConfig.direction === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortConfig.key === "teamName") {
      return sortConfig.direction === "asc"
        ? a.teamName.localeCompare(b.teamName)
        : b.teamName.localeCompare(a.teamName);
    }
    if (sortConfig.key === "statusPayment") {
      return sortConfig.direction === "asc"
        ? a.statusPayment.localeCompare(b.statusPayment)
        : b.statusPayment.localeCompare(a.statusPayment);
    }
    return 0;
  });

  const stats = {
    total: filteredTeams.length,
    lolosAbstrak: filteredTeams.filter(t => t.abstractStatus === "passed").length,
    lunas: filteredTeams.filter(t => t.statusPayment === "verified").length,
    pending: filteredTeams.filter(t => t.statusPayment === "pending").length,
  };

  const handleExportCSV = () => {
    const headers = [
      "Team Name", "Institution", "Category", "Phase", "Registration Date", "Team Leader", "WhatsApp", "Email", 
      "Doc Status", "Abstract Status", "Payment Status", "Admin Verifier", 
      "CBT Username (Reg Num)", "CBT Password",
      "Abstract Link", "Payment Link"
    ];
    
    const rows = filteredTeams.map(t => [
      `"${t.teamName}"`, `"${t.institutionName}"`, t.compeType.replace(/_/g, "-"), t.registrationPhase, t.createdAt,
      `"${t.leaderContact.name}"`, `"${t.leaderContact.phone}"`, `"${t.leaderContact.email}"`,
      t.documentStatus, t.abstractStatus, t.statusPayment, t.verifiedBy || "-", 
      `"${t.participantNumber || "-"}"`, `"${t.cbtPassword || "-"}"`, 
      t.abstractUrl || "Empty", t.document.urlPayment || "Empty"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EUREKA2026_${activeTab}_Data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file successfully downloaded!");
  };

  const handleExportZIP = async () => {
    setIsZipping(true);
    const toastId = toast.loading("Downloading and compressing photos... (Do not close this page)");
    try {
      const zip = new JSZip();
      const folder = zip.folder(`Photos_${activeTab}`);
      
      const fetchPromises: Promise<void>[] = [];

      filteredTeams.forEach((team) => {
        team.members.forEach((member, index) => {
          if (member.photoUrl) {
            const ext = member.photoUrl.split('.').pop()?.split('?')[0] || "jpg";
            const fileName = `${team.teamName.replace(/[^a-z0-9]/gi, '_')}_${member.fullName.replace(/[^a-z0-9]/gi, '_')}_${index + 1}.${ext}`;
            
            const promise = fetch(member.photoUrl)
              .then(res => res.blob())
              .then(blob => { folder?.file(fileName, blob); })
              .catch(err => console.error("Failed to download:", member.photoUrl));
            
            fetchPromises.push(promise);
          }
        });
      });

      await Promise.all(fetchPromises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `EUREKA2026_Photos_${activeTab}.zip`);
      toast.success("Photos ZIP file successfully downloaded!", { id: toastId });
    } catch (error) {
      toast.error("Failed to create ZIP file.", { id: toastId });
    } finally {
      setIsZipping(false);
    }
  };

  const sendWhatsApp = (team: AdminTeamData, type: "tagih" | "revisi" | "berkas") => {
    let phone = team.leaderContact.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const txtTagih = `Halo *${team.teamName}*!\n\nKami dari Panitia EUREKA ITB 2026. Kami perhatikan tim kamu belum menyelesaikan administrasi/pembayaran. Yuk amankan slot tim kamu sebelum fase ditutup!\n\nCek portal: https://eurekaitb.com/dashboard/payment`;
    const txtRevisi = `Halo *${team.teamName}*!\n\nKami dari Panitia EUREKA ITB 2026. Mohon maaf, setelah Admin mengecek, *Bukti Pembayaran* tim kamu kurang jelas/tidak valid.\n\nHarap RE-UPLOAD bukti bayar yang benar melalui portal: https://eurekaitb.com/dashboard/payment`;
    const txtBerkas = `Halo *${team.teamName}*!\n\nKami dari Panitia EUREKA ITB 2026. Berdasarkan pengecekan, terdapat *berkas pendaftaran anggota* yang kurang sesuai. Cek catatan Admin dan segera lakukan perbaikan data di: https://eurekaitb.com/dashboard`;
    
    const msg = type === "tagih" ? txtTagih : type === "berkas" ? txtBerkas : txtRevisi;
    const message = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleVerify = async (teamId: string, target: "abstract" | "payment" | "document", newStatus: string, notes?: string) => {
    setIsProcessing(teamId);
    
    setTeams(prevTeams => prevTeams.map(t => {
      if (t.id === teamId) {
        if (target === "document") {
          return { ...t, documentStatus: newStatus, adminNotes: notes || null };
        }
        if (target === "abstract") {
          const isCanceled = newStatus === "waiting" || newStatus === "failed";
          return {
            ...t, abstractStatus: newStatus,
            statusPayment: isCanceled ? "unpaid" : t.statusPayment, 
            verifiedBy: isCanceled ? null : t.verifiedBy
          };
        }
        if (target === "payment") {
          return { ...t, statusPayment: newStatus };
        }
      }
      return t;
    }));

    try {
      const res = await fetch("/api/verify", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, updateTarget: target, newStatus, adminNotes: notes }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Success! Data updated.`);
      router.refresh(); 
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      setTeams(initialData); 
    } finally {
      setIsProcessing(null);
    } 
  };

  return (
    <div className="w-full box-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <p className="text-xs text-silver-shine font-bold uppercase tracking-wider mb-1">Total Registrants</p>
          <p className="text-3xl font-display font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <p className="text-xs text-silver-shine font-bold uppercase tracking-wider mb-1">Passed Abstract</p>
          <p className="text-3xl font-display font-bold text-sunlight-orange">{stats.lolosAbstrak}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl">
          <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-1">Fully Paid</p>
          <p className="text-3xl font-display font-bold text-green-400">{stats.lunas}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-2xl">
          <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1">Pending Payment</p>
          <p className="text-3xl font-display font-bold text-yellow-500">{stats.pending}</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl w-full xl:w-auto overflow-x-auto">
          {["ALL", "physics-olympiad", "science-project", "industrial-case"].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-colors ${activeTab === tab ? "bg-sunlight-orange text-blue-marine shadow-md" : "text-silver-shine hover:text-white"}`}
            >
              {tab === "ALL" ? "All Categories" : tab.replace(/-/g, " ")}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap w-full xl:w-auto gap-3 items-center">
          <select 
            value={phaseFilter} 
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sunlight-orange"
          >
            <option value="ALL" className="bg-blue-marine">All Waves</option>
            <option value="early_bird" className="bg-blue-marine">Wave 1 (Early Bird)</option>
            <option value="normal" className="bg-blue-marine">Wave 2 (Normal)</option>
            <option value="late" className="bg-blue-marine">Wave 3 (Late)</option>
          </select>

          <select 
            value={`${sortConfig.key}|${sortConfig.direction}`} 
            onChange={handleSortChange}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sunlight-orange"
          >
            <option value="createdAt|desc" className="bg-blue-marine">Newest First</option>
            <option value="createdAt|asc" className="bg-blue-marine">Oldest First</option>
            <option value="teamName|asc" className="bg-blue-marine">Name (A-Z)</option>
            <option value="teamName|desc" className="bg-blue-marine">Name (Z-A)</option>
            <option value="statusPayment|desc" className="bg-blue-marine">Payment (Paid First)</option>
          </select>

          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-shine" size={16} />
            <input 
              type="text" placeholder="Search team..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sunlight-orange"
            />
          </div>

          <button onClick={handleExportZIP} disabled={isZipping} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shrink-0 flex items-center gap-2">
            {isZipping ? "ZIP..." : <><DownloadCloud size={16}/> ZIP</>}
          </button>
          <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shrink-0">
            CSV
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-white/10 text-silver-shine text-xs uppercase tracking-wider bg-black/20">
              <th className="p-5 font-semibold">Team Profile</th>
              <th className="p-5 font-semibold">Leader Contact</th>
              <th className="p-5 font-semibold text-center">Doc Status</th>
              {activeTab !== "physics-olympiad" && (
                <th className="p-5 font-semibold text-center">Abstract</th>
              )}
              <th className="p-5 font-semibold text-center">Payment</th>
              <th className="p-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={activeTab !== "physics-olympiad" ? 6 : 5} className="p-10 text-center text-silver-shine">No data found.</td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
                <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                  <td className="p-5">
                    <p className="font-bold text-sunlight-orange text-base">{team.teamName}</p>
                    <p className="text-xs text-silver-shine capitalize">{team.institutionName} • {team.compeType.replace(/_/g, "-")}</p>
                    <p className="text-[10px] bg-white/10 text-white inline-block px-2 py-0.5 rounded mt-1">{team.registrationPhase}</p>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-white">{team.leaderContact.name}</p>
                    <p className="text-xs text-silver-shine">{team.leaderContact.phone}</p>
                  </td>
                  
                  <td className="p-5 text-center">
                     <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${team.documentStatus === "passed" ? "bg-green-500/20 text-green-400" : team.documentStatus === "revision" ? "bg-yellow-500/20 text-yellow-500" : "bg-white/10 text-white"}`}>
                       {team.documentStatus}
                     </span>
                  </td>

                  {activeTab !== "physics-olympiad" && (
                    <td className="p-5 text-center">
                      {team.compeType === "physics-olympiad" ? (
                        <span className="text-silver-shine text-xs">-</span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${team.abstractStatus === "passed" ? "bg-green-500/20 text-green-400" : team.abstractStatus === "failed" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"}`}>
                          {team.abstractStatus}
                        </span>
                      )}
                    </td>
                  )}

                  <td className="p-5 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${team.statusPayment === "verified" ? "bg-green-500/20 text-green-400" : team.statusPayment === "pending" ? "bg-yellow-500/20 text-yellow-500" : "bg-white/10 text-white"}`}>
                      {team.statusPayment}
                    </span>
                    {team.statusPayment === "verified" && team.verifiedBy && (
                      <p className="text-[9px] text-silver-shine mt-1 flex items-center justify-center gap-1"><ShieldCheck size={10}/> {team.verifiedBy}</p>
                    )}
                  </td>
                  <td className="p-5 text-right whitespace-nowrap">
                    <button onClick={() => { setSelectedTeam(team); setTempNotes(team.adminNotes || ""); }} className="text-xs font-bold px-4 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTeam && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-24 p-4 sm:p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTeam(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-blue-marine border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-10">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="font-display text-2xl font-bold text-sunlight-orange">{selectedTeam.teamName}</h2>
                <p className="text-sm text-silver-shine capitalize">{selectedTeam.institutionName} • {selectedTeam.compeType.replace(/_/g, "-")}</p>
              </div>
              <div className="flex gap-3 items-center">
                <button onClick={() => sendWhatsApp(selectedTeam, "tagih")} className="bg-green-500/20 text-green-400 border border-green-500/40 p-2 rounded-full hover:bg-green-500/30 transition-colors" title="WA: Tagih Pembayaran">
                  <MessageCircle size={20} />
                </button>
                <button onClick={() => setSelectedTeam(null)} className="p-2 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {selectedTeam.statusPayment === "verified" && selectedTeam.participantNumber && (
                <div className="bg-gradient-to-r from-sunlight-orange/20 to-transparent p-5 rounded-2xl border border-sunlight-orange/40 shadow-[0_0_15px_rgba(255,184,0,0.1)]">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-sunlight-orange"><Key size={18}/> CBT Credentials (Indolat)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-silver-shine mb-1">CBT Username</p>
                      <p className="font-mono font-bold text-white text-lg tracking-wider">{selectedTeam.participantNumber}</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-silver-shine mb-1">CBT Password</p>
                      <p className="font-mono font-bold text-white text-lg tracking-wider">{selectedTeam.cbtPassword || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={18} className="text-sunlight-orange"/> Files & Administration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2 bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 flex flex-col gap-3">
                     <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2"><AlertTriangle size={16}/> Tahap 1: Verifikasi Dokumen Tim</h4>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${selectedTeam.documentStatus === "passed" ? "bg-green-500/20 text-green-400" : selectedTeam.documentStatus === "revision" ? "bg-yellow-500/20 text-yellow-500" : "bg-white/10 text-white"}`}>
                          STATUS: {selectedTeam.documentStatus}
                        </span>
                     </div>
                     <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Tulis catatan (contoh: Foto KTM anggota 2 buram, mohon upload ulang)..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-20"
                     />
                     <div className="flex gap-2 items-center flex-wrap">
                        <button disabled={isProcessing === selectedTeam.id} onClick={() => handleVerify(selectedTeam.id, "document", "passed", tempNotes)} className="bg-green-600/30 text-green-400 border border-green-500/40 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-600/50 transition-colors">Pass Dokumen</button>
                        <button disabled={isProcessing === selectedTeam.id} onClick={() => handleVerify(selectedTeam.id, "document", "revision", tempNotes)} className="bg-yellow-600/30 text-yellow-500 border border-yellow-500/40 px-4 py-2 rounded-lg text-xs font-bold hover:bg-yellow-600/50 transition-colors">Request Revisi (Buka Form)</button>
                        <button onClick={() => sendWhatsApp(selectedTeam, "berkas")} className="ml-auto text-[10px] bg-white/5 text-silver-shine px-3 py-2 rounded-lg hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-1"><MessageCircle size={12}/> Info WA Revisi</button>
                     </div>
                  </div>

                  {(selectedTeam.compeType === "science-project" || selectedTeam.compeType === "industrial-case") && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-silver-shine mb-1">Abstract Document</p>
                        {selectedTeam.abstractUrl ? <a href={selectedTeam.abstractUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-bold text-sm">Open Abstract PDF ↗</a> : <span className="text-red-400 text-sm">Not Uploaded</span>}
                      </div>
                      <div className="flex gap-2 mt-4">
                         {selectedTeam.abstractStatus === "waiting" ? (
                           <>
                             <button disabled={isProcessing === selectedTeam.id} onClick={() => handleVerify(selectedTeam.id, "abstract", "passed")} className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-md text-[10px] font-bold hover:bg-green-500/30 flex-1">Pass Abstract</button>
                             <button disabled={isProcessing === selectedTeam.id} onClick={() => handleVerify(selectedTeam.id, "abstract", "failed")} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-md text-[10px] font-bold hover:bg-red-500/30 flex-1">Reject</button>
                           </>
                         ) : (
                           <button disabled={isProcessing === selectedTeam.id} onClick={() => handleVerify(selectedTeam.id, "abstract", "waiting")} className="bg-gray-500/20 text-gray-400 px-3 py-1.5 rounded-md text-[10px] font-bold hover:bg-gray-500/30 w-full">Cancel {selectedTeam.abstractStatus}</button>
                         )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-silver-shine mb-1">Payment Proof</p>
                      {selectedTeam.document.urlPayment ? <a href={selectedTeam.document.urlPayment} target="_blank" rel="noreferrer" className="text-green-400 hover:underline font-bold text-sm mb-2 inline-block">View Receipt ↗</a> : <span className="text-red-400 text-sm mb-2 block">None</span>}
                    </div>
                    <div className="flex gap-2 mt-2">
                       <button disabled={isProcessing === selectedTeam.id} onClick={() => handleVerify(selectedTeam.id, "payment", selectedTeam.statusPayment === "verified" ? "unpaid" : "verified")} className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors ${selectedTeam.statusPayment === "verified" ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}>
                         {selectedTeam.statusPayment === "verified" ? "Cancel Verify" : "Verify Payment"}
                       </button>
                       {selectedTeam.document.urlPayment && selectedTeam.statusPayment !== "verified" && (
                         <button onClick={() => sendWhatsApp(selectedTeam, "revisi")} className="flex-1 text-[10px] bg-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg hover:bg-yellow-500/30 font-bold">WA: Confirm</button>
                       )}
                    </div>
                  </div>
                  
                  {selectedTeam.caseChoice && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 md:col-span-2">
                      <p className="text-xs text-silver-shine mb-1">Case Choice (ICC)</p>
                      <p className="font-bold text-sunlight-orange text-sm">{selectedTeam.caseChoice}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={18} className="text-sunlight-orange"/> Team Member Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedTeam.members.map((member, idx) => (
                    <div key={member.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                      <span className={`self-start text-[10px] font-bold uppercase px-2 py-1 rounded-md ${member.isLeader ? "bg-sunlight-orange/20 text-sunlight-orange" : "bg-white/10 text-silver-shine"}`}>
                        {member.isLeader ? "★ Leader" : `Member ${idx}`}
                      </span>
                      <div>
                        <p className="font-bold text-white text-sm">{member.fullName}</p>
                        <p className="text-xs text-silver-shine mt-0.5">{member.email}</p>
                        <p className="text-xs text-silver-shine">{member.phoneNumber}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/10 text-[10px] font-bold">
                        {member.photoUrl ? <a href={member.photoUrl} target="_blank" className="bg-blue-500/20 text-blue-400 py-1.5 rounded-lg text-center hover:bg-blue-500/30">Photo</a> : <span className="text-red-400 text-center py-1.5 bg-red-500/10">No Photo</span>}
                        {member.ktmUrl ? <a href={member.ktmUrl} target="_blank" className="bg-blue-500/20 text-blue-400 py-1.5 rounded-lg text-center hover:bg-blue-500/30">ID Card</a> : <span className="text-red-400 text-center py-1.5 bg-red-500/10">No ID</span>}
                        {member.proofFollowUrl ? <a href={member.proofFollowUrl} target="_blank" className="bg-green-500/20 text-green-400 py-1.5 rounded-lg text-center hover:bg-green-500/30 mt-1">Follow IG</a> : <span className="text-red-400 text-center py-1.5 mt-1 bg-red-500/10">No Follow</span>}
                        {member.proofShareUrl ? <a href={member.proofShareUrl} target="_blank" className="bg-green-500/20 text-green-400 py-1.5 rounded-lg text-center hover:bg-green-500/30 mt-1">Main Story</a> : <span className="text-red-400 text-center py-1.5 mt-1 bg-red-500/10">No Main Sty</span>}
                        {member.proofStoryCompeUrl ? <a href={member.proofStoryCompeUrl} target="_blank" className="bg-green-500/20 text-green-400 py-1.5 rounded-lg text-center hover:bg-green-500/30 mt-1">Compe Story</a> : <span className="text-red-400 text-center py-1.5 mt-1 bg-red-500/10">No Cmp Sty</span>}
                        {member.proofTwibbonUrl ? <a href={member.proofTwibbonUrl} target="_blank" className="bg-green-500/20 text-green-400 py-1.5 rounded-lg text-center hover:bg-green-500/30 mt-1">Twibbon</a> : <span className="text-red-400 text-center py-1.5 mt-1 bg-red-500/10">No Twibbon</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}