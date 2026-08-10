"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Search, X, Users, FileText, CheckCircle2, Clock, MessageCircle, DownloadCloud, ShieldCheck } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface TeamMember {
  id: string; fullName: string; email: string; phoneNumber: string; isLeader: boolean | null; grade: string;
  photoUrl: string | null; ktmUrl: string | null; proofFollowUrl: string | null; proofShareUrl: string | null; igAccountLink: string | null;
}

interface AdminTeamData {
  id: string; teamName: string; institutionName: string; compeType: string;
  statusPayment: string; abstractStatus: string; abstractUrl: string | null; caseChoice: string | null;
  document: { urlPayment: string | null };
  leaderContact: { name: string; email: string; phone: string };
  members: TeamMember[];
  verifiedBy?: string | null; 
}

export default function AdminTable({ initialData }: { initialData: AdminTeamData[] }) {
  const router = useRouter();
  const [teams, setTeams] = useState<AdminTeamData[]>(initialData);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<AdminTeamData | null>(null);

  const filteredTeams = teams.filter(t => {
    const matchTab = activeTab === "ALL" || t.compeType === activeTab;
    const matchSearch = t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.institutionName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total: filteredTeams.length,
    lolosAbstrak: filteredTeams.filter(t => t.abstractStatus === "passed").length,
    lunas: filteredTeams.filter(t => t.statusPayment === "verified").length,
    pending: filteredTeams.filter(t => t.statusPayment === "pending").length,
  };

  const handleExportCSV = () => {
    const headers = ["Team Name", "Institution", "Category", "Team Leader", "WhatsApp", "Email", "Abstract Status", "Payment Status", "Admin Verifier", "Abstract Link", "Payment Link"];
    const rows = filteredTeams.map(t => [
      `"${t.teamName}"`, `"${t.institutionName}"`, t.compeType, 
      `"${t.leaderContact.name}"`, `"${t.leaderContact.phone}"`, `"${t.leaderContact.email}"`,
      t.abstractStatus, t.statusPayment, t.verifiedBy || "-", t.abstractUrl || "Empty", t.document.urlPayment || "Empty"
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

  const sendWhatsApp = (team: AdminTeamData, type: "tagih" | "revisi") => {
    let phone = team.leaderContact.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const txtTagih = `Hello Team Leader of *${team.teamName}*!\n\nWe are from the EUREKA ITB 2026 Committee. We noticed that your team has not completed the registration administration/payment. Please secure your team's slot before the phase closes!\n\nYou can check the portal at: https://eurekaitb.com/dashboard/payment \n\nWarm regards,\nEUREKA ITB Committee`;
    const txtRevisi = `Hello Team Leader of *${team.teamName}*!\n\nWe are from the EUREKA ITB 2026 Committee. We apologize, but after our Admin reviewed your submission, we found that your *Payment Receipt* is unclear or invalid.\n\nPlease RE-UPLOAD a clearer payment receipt via the portal immediately: https://eurekaitb.com/dashboard/payment\n\nThank you for your cooperation!`;
    
    const message = encodeURIComponent(type === "tagih" ? txtTagih : txtRevisi);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleVerify = async (teamId: string, target: "abstract" | "payment", newStatus: string) => {
    setIsProcessing(teamId);
    try {
      const res = await fetch("/api/verify", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, updateTarget: target, newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setTeams(teams.map(t => {
        if (t.id === teamId) {
          if (target === "abstract") return { ...t, abstractStatus: newStatus };
          if (target === "payment") return { ...t, statusPayment: newStatus };
        }
        return t;
      }));
      toast.success(`Success! Data updated.`);
      router.refresh();
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsProcessing(null);
      if (selectedTeam?.id === teamId) setSelectedTeam(null);
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

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {["ALL", "physics_olympiad", "science_project", "industrial_case"].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-colors ${activeTab === tab ? "bg-sunlight-orange text-blue-marine shadow-md" : "text-silver-shine hover:text-white"}`}
            >
              {tab === "ALL" ? "All Categories" : tab.replace("_", " ")}
            </button>
          ))}
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-shine" size={16} />
            <input 
              type="text" placeholder="Search team or institution..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sunlight-orange"
            />
          </div>
          <button onClick={handleExportZIP} disabled={isZipping} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shrink-0 flex items-center gap-2">
            {isZipping ? "Processing ZIP..." : <><DownloadCloud size={16}/> ZIP Photos</>}
          </button>
          <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shrink-0">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-white/10 text-silver-shine text-xs uppercase tracking-wider bg-black/20">
              <th className="p-5 font-semibold">Team Profile</th>
              <th className="p-5 font-semibold">Leader Contact</th>
              <th className="p-5 font-semibold text-center">Abstract Status</th>
              <th className="p-5 font-semibold text-center">Payment Status</th>
              <th className="p-5 font-semibold text-right">Actions & Verification</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-silver-shine">No data found.</td></tr>
            ) : (
              filteredTeams.map((team) => (
                <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                  <td className="p-5">
                    <p className="font-bold text-sunlight-orange text-base">{team.teamName}</p>
                    <p className="text-xs text-silver-shine capitalize">{team.institutionName} • {team.compeType.replace("_", " ")}</p>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-white">{team.leaderContact.name}</p>
                    <p className="text-xs text-silver-shine">{team.leaderContact.phone}</p>
                  </td>
                  <td className="p-5 text-center">
                    {team.compeType === "physics_olympiad" ? (
                      <span className="text-silver-shine text-xs">-</span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${team.abstractStatus === "passed" ? "bg-green-500/20 text-green-400" : team.abstractStatus === "failed" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"}`}>
                        {team.abstractStatus}
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${team.statusPayment === "verified" ? "bg-green-500/20 text-green-400" : team.statusPayment === "pending" ? "bg-yellow-500/20 text-yellow-500" : "bg-white/10 text-white"}`}>
                      {team.statusPayment}
                    </span>
                    {team.statusPayment === "verified" && team.verifiedBy && (
                      <p className="text-[9px] text-silver-shine mt-1 flex items-center justify-center gap-1"><ShieldCheck size={10}/> {team.verifiedBy}</p>
                    )}
                  </td>
                  <td className="p-5 text-right whitespace-nowrap">
                    <div className="flex flex-col items-end gap-3">
                      <button onClick={() => setSelectedTeam(team)} className="text-xs font-bold px-4 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                        View Details
                      </button>
                      
                      {(team.compeType === "science_project" || team.compeType === "industrial_case") && (
                        <div className="flex items-center gap-2 border border-white/10 p-1.5 rounded-lg bg-black/20">
                          <span className="text-[9px] text-silver-shine font-bold uppercase mr-1">Abstract:</span>
                          {team.abstractStatus === "waiting" ? (
                            <>
                              <button disabled={isProcessing === team.id} onClick={() => handleVerify(team.id, "abstract", "passed")} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-md text-[10px] font-bold hover:bg-green-500/30">Pass</button>
                              <button disabled={isProcessing === team.id} onClick={() => handleVerify(team.id, "abstract", "failed")} className="bg-red-500/20 text-red-400 px-3 py-1 rounded-md text-[10px] font-bold hover:bg-red-500/30">Reject</button>
                            </>
                          ) : (
                            <button disabled={isProcessing === team.id} onClick={() => handleVerify(team.id, "abstract", "waiting")} className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-md text-[10px] font-bold hover:bg-gray-500/30">Cancel {team.abstractStatus === "passed" ? "Pass" : "Reject"}</button>
                          )}
                        </div>
                      )}

                      {(team.compeType === "physics_olympiad" || team.abstractStatus === "passed") && (
                         <div className="flex items-center gap-2 border border-white/10 p-1.5 rounded-lg bg-black/20">
                            <span className="text-[9px] text-silver-shine font-bold uppercase mr-1">Payment:</span>
                            <button disabled={isProcessing === team.id} onClick={() => handleVerify(team.id, "payment", team.statusPayment === "verified" ? "unpaid" : "verified")} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${team.statusPayment === "verified" ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}>
                              {isProcessing === team.id ? "..." : team.statusPayment === "verified" ? "Cancel Verify" : "Verify Payment"}
                            </button>
                         </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTeam(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-blue-marine border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="font-display text-2xl font-bold text-sunlight-orange">{selectedTeam.teamName}</h2>
                <p className="text-sm text-silver-shine capitalize">{selectedTeam.institutionName} • {selectedTeam.compeType.replace("_", " ")}</p>
              </div>
              <div className="flex gap-3 items-center">
                <button onClick={() => sendWhatsApp(selectedTeam, "tagih")} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors" title="Send Payment Reminder (WA)">
                  <MessageCircle size={20} />
                </button>
                <button onClick={() => setSelectedTeam(null)} className="p-2 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={18} className="text-sunlight-orange"/> Files & Administration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(selectedTeam.compeType === "science_project" || selectedTeam.compeType === "industrial_case") && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs text-silver-shine mb-1">Abstract Document</p>
                      {selectedTeam.abstractUrl ? <a href={selectedTeam.abstractUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-bold text-sm">Open Abstract PDF ↗</a> : <span className="text-red-400 text-sm">Not Uploaded</span>}
                    </div>
                  )}
                  {selectedTeam.caseChoice && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs text-silver-shine mb-1">Case Choice (ICC)</p>
                      <p className="font-bold text-sunlight-orange text-sm">{selectedTeam.caseChoice}</p>
                    </div>
                  )}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs text-silver-shine mb-1">Payment Proof</p>
                      {selectedTeam.document.urlPayment ? <a href={selectedTeam.document.urlPayment} target="_blank" rel="noreferrer" className="text-green-400 hover:underline font-bold text-sm">View Receipt ↗</a> : <span className="text-red-400 text-sm">None</span>}
                    </div>
                    {selectedTeam.document.urlPayment && selectedTeam.statusPayment !== "verified" && (
                       <button onClick={() => sendWhatsApp(selectedTeam, "revisi")} className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/30">Request Revision (WA)</button>
                    )}
                  </div>
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
                        {member.photoUrl ? <a href={member.photoUrl} target="_blank" className="bg-blue-500/20 text-blue-400 py-1.5 rounded-lg text-center hover:bg-blue-500/30">Photo</a> : <span className="text-red-400 text-center py-1.5">No Photo</span>}
                        {member.ktmUrl ? <a href={member.ktmUrl} target="_blank" className="bg-blue-500/20 text-blue-400 py-1.5 rounded-lg text-center hover:bg-blue-500/30">ID Card</a> : <span className="text-red-400 text-center py-1.5">No ID</span>}
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