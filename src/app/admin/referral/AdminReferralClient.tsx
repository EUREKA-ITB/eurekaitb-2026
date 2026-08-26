"use client";

import { useState } from "react";
import { PlusCircle, Loader2, Copy, CheckCircle2, Ticket, Users, Info, ShieldAlert, Trash2 } from "lucide-react";

interface ReferralData {
  id: string;
  code: string;
  partnerName: string;
  tier: string;
  discountVal: number;
  isUsed: boolean;
}

export default function AdminReferralClient({ initialCodes }: { initialCodes: ReferralData[] }) {
  const [codes, setCodes] = useState<ReferralData[]>(initialCodes);
  const [partnerName, setPartnerName] = useState<string>("");
  const [tier, setTier] = useState<string>("Quantum");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const refreshCodes = async () => {
    try {
      const res = await fetch("/api/referral");
      if (res.ok) {
        const data: ReferralData[] = await res.json();
        setCodes(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerName, tier }),
      });

      if (res.ok) {
        setPartnerName("");
        setTier("Quantum");
        await refreshCodes();
      } else {
        alert("Failed to generate code");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete referral code ${code}?`)) return;

    try {
      const res = await fetch("/api/referral", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        await refreshCodes();
      } else {
        alert("Failed to delete code");
      }
    } catch (e) {
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full pt-28">
        
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="bg-sunlight-orange p-3.5 rounded-2xl text-blue-marine shadow-lg">
            <Ticket size={32} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Referral Management</h1>
            <p className="text-silver-shine text-sm">Central hub for generating and tracking exclusive discount codes for Partners & Media Partners.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sunlight-orange font-bold text-sm mb-1">
              <Info size={16} /> Quantum Tier
            </div>
            <p className="text-xs text-silver-shine mb-2">5% discount for a maximum of 1 participant team.</p>
            <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-white">Prefix: ALPHA-EUREKA5</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sunlight-orange font-bold text-sm mb-1">
              <Info size={16} /> Photon Tier
            </div>
            <p className="text-xs text-silver-shine mb-2">10% discount for a maximum of 2 participant teams.</p>
            <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-white">Prefix: BETA-EUREKA10</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sunlight-orange font-bold text-sm mb-1">
              <Info size={16} /> Electron Tier
            </div>
            <p className="text-xs text-silver-shine mb-2">15% discount for a maximum of 3 participant teams.</p>
            <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-white">Prefix: GAMMA-EUREKA15</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={handleGenerate} className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
              <h2 className="font-display text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">Generate New Code</h2>
              
              <div className="mb-5">
                <label className="block text-xs font-bold text-silver-shine uppercase tracking-wider mb-2">Partner / Media Partner Name</label>
                <input 
                  type="text" 
                  required
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Example: BEM UI"
                  className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors"
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-silver-shine uppercase tracking-wider mb-2">Tier Package</label>
                <select 
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors cursor-pointer"
                >
                  <option value="Quantum" className="bg-blue-marine text-white">Quantum (5% Discount - 1 Code)</option>
                  <option value="Photon" className="bg-blue-marine text-white">Photon (10% Discount - 2 Codes)</option>
                  <option value="Electron" className="bg-blue-marine text-white">Electron (15% Discount - 3 Codes)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isGenerating || !partnerName}
                className="w-full bg-sunlight-orange text-blue-marine font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                {isGenerating ? "Generating Code..." : "Generate Referral Code"}
              </button>
            </form>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm text-xs text-silver-shine leading-relaxed">
              <p className="font-bold text-white mb-2 flex items-center gap-1.5"><ShieldAlert size={14} className="text-sunlight-orange"/> Petunjuk Penggunaan:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>Sistem otomatis membuat kode unik sesuai kuota tier.</li>
                <li>Setiap kode bersifat <span className="text-white font-semibold">single-use</span> (hanya bisa dipakai 1 kali).</li>
                <li>Gunakan tombol hapus jika ada kode keliru yang ingin ditarik kembali.</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-sunlight-orange" /> Generated Codes List
                </h2>
                <span className="text-xs text-silver-shine font-mono">Total: {codes.length} Codes</span>
              </div>
              
              <div className="overflow-x-auto">
                {codes.length === 0 ? (
                  <div className="p-16 text-center text-silver-shine text-sm">
                    No referral codes generated yet. Please create one using the form.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-silver-shine tracking-wider bg-black/20">
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Unique Code</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Partner</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Tier</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-white/5">
                      {codes.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-white whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 text-sunlight-orange select-all">{item.code}</span>
                              <button onClick={() => handleCopy(item.code)} className="text-silver-shine hover:text-white transition-colors" title="Copy Code">
                                {copiedCode === item.code ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{item.partnerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                              {item.tier} <span className="text-silver-shine">(-{item.discountVal}%)</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.isUsed ? (
                              <span className="inline-block bg-red-500/25 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold text-center">
                                USED
                              </span>
                            ) : (
                              <span className="inline-block bg-green-500/25 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold text-center">
                                AVAILABLE
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <button 
                              onClick={() => handleDelete(item.id, item.code)} 
                              className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-xl border border-red-500/20 transition-colors inline-flex items-center justify-center"
                              title="Delete Code"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}