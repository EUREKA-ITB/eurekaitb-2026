"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

interface CloudinaryResult {
  info?: string | {
    secure_url?: string;
  };
}

interface MemberInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  grade: string;       
  photoUrl: string;    
  ktmUrl: string;      
  igAccountLink: string;
  proofFollowUrl: string; // TAMBAHAN: Bukti Follow
  proofShareUrl: string;  // TAMBAHAN: Bukti Share
  isLeader: boolean;   
}

interface FormData {
  compeType: "physics_olympiad" | "science_project" | "industrial_case" | "";
  teamName: string;
  institutionName: string;
  members: MemberInput[]; 
}

const createEmptyMember = (isLeader: boolean): MemberInput => ({
  fullName: "",
  email: "",
  phoneNumber: "",
  grade: "",
  photoUrl: "",
  ktmUrl: "", 
  igAccountLink: "",
  proofFollowUrl: "",
  proofShareUrl: "",
  isLeader: isLeader,
});

export default function RegisterLombaPage() {
  const router = useRouter();
  
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<FormData>({
    compeType: "",
    teamName: "",
    institutionName: "",
    members: [createEmptyMember(true)], 
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockedCompeName, setLockedCompeName] = useState<string>("");

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const response = await fetch("/api/teams");
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.team) {
            if (data.team.statusPayment !== "unpaid") {
              setIsLocked(true);
              setLockedCompeName(data.team.compeType.replace("_", " "));
              setIsFetching(false);
              return; 
            }

            setIsEditMode(true);
            
            let validMembers: Partial<MemberInput>[] = 
              Array.isArray(data.members) && data.members.length > 0 
                ? data.members 
                : [createEmptyMember(true)];

            validMembers = validMembers.sort(
              (a: Partial<MemberInput>, b: Partial<MemberInput>) => 
                Number(b.isLeader || false) - Number(a.isLeader || false)
            );

            const processedMembers: MemberInput[] = validMembers.map((m: Partial<MemberInput>) => ({
              fullName: m.fullName || "",
              email: m.email || "",
              phoneNumber: m.phoneNumber || "",
              grade: m.grade || "",       
              photoUrl: m.photoUrl || "", 
              ktmUrl: m.ktmUrl || "",     
              igAccountLink: m.igAccountLink || "",
              proofFollowUrl: m.proofFollowUrl || "",
              proofShareUrl: m.proofShareUrl || "",
              isLeader: m.isLeader ?? false,
            }));

            if (
              (data.team.compeType === "science_project" || data.team.compeType === "industrial_case") &&
              processedMembers.length < 2
            ) {
              processedMembers.push(createEmptyMember(false));
            }

            setFormData({
              compeType: data.team.compeType || "",
              teamName: data.team.teamName || "",
              institutionName: data.team.institutionName || "",
              members: processedMembers,
            });
          }
        }
      } catch (error: unknown) {
        console.error("Gagal menarik data lama:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchExistingData();
  }, []);

  const handleCompeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value as FormData["compeType"];
    
    setFormData((prev) => {
      const currentLeader = prev.members[0] || createEmptyMember(true);
      currentLeader.grade = ""; 
      
      let newMembers: MemberInput[] = [currentLeader];
      
      if (selectedType === "science_project" || selectedType === "industrial_case") {
        if (prev.members.length < 2) {
          newMembers.push(createEmptyMember(false));
        } else {
          newMembers = prev.members.map(m => ({...m, grade: ""}));
        }
      }

      return {
        ...prev,
        compeType: selectedType,
        members: newMembers,
      };
    });
  };

  const handleMemberChange = (index: number, field: keyof MemberInput, value: string) => {
    setFormData((prev) => {
      const updatedMembers = [...prev.members];
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      return { ...prev, members: updatedMembers };
    });
  };

  const addMemberSlot = () => {
    setFormData((prev) => {
      if (prev.members.length < 3) {
        return { ...prev, members: [...prev.members, createEmptyMember(false)] };
      }
      return prev;
    });
  };

  const removeMemberSlot = (index: number) => {
    if (index === 0) return; 
    setFormData((prev) => {
      const updatedMembers = prev.members.filter((_, i) => i !== index);
      return { ...prev, members: updatedMembers };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const hasMissingPhotos = formData.members.some((m) => m.photoUrl === "");
      const hasMissingKTM = formData.members.some((m) => m.ktmUrl === "");
      const hasMissingIgLink = formData.members.some((m) => m.igAccountLink.trim() === "");
      const hasMissingFollow = formData.members.some((m) => m.proofFollowUrl === "");
      const hasMissingShare = formData.members.some((m) => m.proofShareUrl === "");
      
      if (hasMissingPhotos || hasMissingKTM || hasMissingIgLink || hasMissingFollow || hasMissingShare) {
        alert("PENTING: Harap lengkapi seluruh dokumen dan link Instagram (Pas Foto, KTM, Link IG, Bukti Follow, & Bukti Share) untuk SETIAP anggota!");
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json() as { error?: string; message?: string };

      if (!response.ok) {
        alert(`Gagal: ${data.error ?? "Terjadi kesalahan"}`);
      } else {
        alert(isEditMode ? "Pembaruan Data Sukses!" : "Pendaftaran Kompetisi Sukses!");
        router.push("/dashboard");
        router.refresh(); 
      }
    } catch (error: unknown) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const isTeamCompetition = formData.compeType === "science_project" || formData.compeType === "industrial_case";
  const isMahasiswa = formData.compeType === "industrial_case";

  if (isFetching) {
    return (
      <div className="min-h-screen bg-blue-marine flex items-center justify-center text-white font-display text-xl tracking-widest">
        MEMUAT DATA...
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 flex items-center justify-center box-border">
        <div className="bg-white/5 border border-white/10 p-8 sm:p-12 rounded-3xl text-center max-w-lg shadow-2xl backdrop-blur-sm">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400 font-bold text-2xl">!</div>
          <h2 className="font-display text-2xl font-bold mb-4">Akses Form Terkunci</h2>
          <p className="text-silver-shine text-sm leading-relaxed mb-8">
            Akun Anda saat ini sudah terdaftar pada kompetisi <span className="text-white font-bold capitalize">{lockedCompeName}</span> dan sedang dalam tahap verifikasi/lunas. 
            <br/><br/>
            Sistem EUREKA membatasi 1 Akun Email hanya untuk 1 Pendaftaran Lomba.
          </p>
          <Link href="/dashboard" className="inline-block bg-sunlight-orange text-blue-marine font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden pt-28">
      <div className="max-w-4xl mx-auto w-full">
        
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="inline-flex items-center text-silver-shine hover:text-white mb-6 transition-colors text-sm sm:text-base bg-transparent border-none p-0 cursor-pointer"
        >
          <span className="mr-2">←</span> Batal & Kembali
        </button>

        <h1 className="font-display text-2xl sm:text-4xl font-bold text-sunlight-orange mb-3 break-words">
          {isEditMode ? "Edit Data Pendaftaran" : "Pendaftaran Kompetisi"}
        </h1>
        <p className="text-silver-shine text-xs sm:text-sm mb-8 max-w-xl">
          Lengkapi formulir di bawah ini. Pastikan data seluruh anggota valid beserta kelengkapan berkas administrasi.
        </p>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-sm w-full box-border">
          
          {/* BAGIAN 1: INFORMASI UMUM TIM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 border-b border-white/10 pb-10">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Kategori Lomba</label>
              <select 
                required
                className="w-full bg-blue-marine border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors"
                value={formData.compeType}
                onChange={handleCompeTypeChange}
              >
                <option value="" disabled>-- Pilih Kategori Lomba --</option>
                <option value="physics_olympiad">Physics Olympiad (SMA - Individu)</option>
                <option value="science_project">Science Project (SMA - Tim)</option>
                <option value="industrial_case">Industrial Case (Mahasiswa S1 - Tim)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {formData.compeType === "physics_olympiad" ? "Nama Lengkap Peserta" : "Nama Tim / Kelompok"}
              </label>
              <input 
                required
                type="text"
                placeholder={formData.compeType === "physics_olympiad" ? "Contoh: Albert Einstein" : "Contoh: Tim Gamma ITB"}
                className="w-full bg-blue-marine border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors"
                value={formData.teamName}
                onChange={(e) => setFormData((prev) => ({...prev, teamName: e.target.value}))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Asal Institusi</label>
              <input 
                required
                type="text"
                placeholder="Contoh: SMA Negeri 3 Bandung"
                className="w-full bg-blue-marine border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors"
                value={formData.institutionName}
                onChange={(e) => setFormData((prev) => ({...prev, institutionName: e.target.value}))}
              />
            </div>
          </div>

          {/* BAGIAN 2: BIODATA PERSONIL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h3 className="font-display text-xl font-bold text-sunlight-orange">Biodata Personil</h3>
            
            {isTeamCompetition && formData.members.length < 3 && (
              <button
                type="button"
                onClick={addMemberSlot}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg self-start sm:self-auto transition-colors"
              >
                + Tambah Anggota ({formData.members.length}/3 Orang)
              </button>
            )}
          </div>

          <div className="space-y-6">
            {formData.members.map((member, index) => (
              <div key={index} className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl w-full box-border relative">
                
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-sunlight-orange bg-sunlight-orange/10 px-3 py-1.5 rounded-md uppercase tracking-widest">
                    {member.isLeader ? "★ Ketua Tim / Individu" : `Anggota Tambahan ${index}`}
                  </span>
                  
                  {!member.isLeader && (
                    <button
                      type="button"
                      onClick={() => removeMemberSlot(index)}
                      className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                    >
                      Hapus Anggota
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  
                  {/* KOLOM KIRI: PAS FOTO & KTM (2 Kolom) */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4 h-max">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-3 bg-black/20">
                       {member.photoUrl ? (
                         <Image src={member.photoUrl} alt="Pas Foto" width={320} height={128} unoptimized className="w-full h-32 object-cover rounded-md mb-3 border border-white/20 shadow-lg" />
                       ) : (
                         <div className="w-full h-32 bg-white/5 rounded-md mb-3 flex items-center justify-center text-xs text-silver-shine text-center px-2">Pas Foto 3x4</div>
                      )}
                      <CldUploadWidget 
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} 
                        onSuccess={(res: CloudinaryResult) => { 
                          if(typeof res.info === "object" && res.info?.secure_url) {
                            handleMemberChange(index, "photoUrl", res.info.secure_url);
                          }
                        }}
                      >
                        {({ open }) => (
                          <button type="button" onClick={() => open()} className="text-[10px] bg-sunlight-orange text-blue-marine font-bold px-2 py-2 rounded-md w-full hover:bg-yellow-400 transition-colors">
                            {member.photoUrl ? "Ganti Foto" : "Unggah Foto"}
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-3 bg-black/20">
                       {member.ktmUrl ? (
                         <Image src={member.ktmUrl} alt="KTM" width={320} height={128} unoptimized className="w-full h-32 object-cover rounded-md mb-3 border border-white/20 shadow-lg" />
                       ) : (
                         <div className="w-full h-32 bg-white/5 rounded-md mb-3 flex items-center justify-center text-xs text-silver-shine text-center px-2">KTM / Pelajar</div>
                      )}
                      <CldUploadWidget 
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} 
                        onSuccess={(res: CloudinaryResult) => { 
                          if(typeof res.info === "object" && res.info?.secure_url) {
                            handleMemberChange(index, "ktmUrl", res.info.secure_url);
                          }
                        }}
                      >
                        {({ open }) => (
                          <button type="button" onClick={() => open()} className="text-[10px] bg-sunlight-orange text-blue-marine font-bold px-2 py-2 rounded-md w-full hover:bg-yellow-400 transition-colors">
                            {member.ktmUrl ? "Ganti KTM" : "Unggah KTM"}
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>

                  {/* KOLOM KANAN: INPUT BIODATA (3 Kolom) */}
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5 h-max">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-silver-shine mb-2">Nama Lengkap Sesuai Identitas</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors"
                        value={member.fullName}
                        onChange={(e) => handleMemberChange(index, "fullName", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-silver-shine mb-2">Email Aktif</label>
                      <input
                        required
                        type="email"
                        placeholder="nama@email.com"
                        className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors"
                        value={member.email}
                        onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-silver-shine mb-2">No. WhatsApp</label>
                      <input
                        required
                        type="tel"
                        placeholder="08xxxxxxxx"
                        className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors"
                        value={member.phoneNumber}
                        onChange={(e) => handleMemberChange(index, "phoneNumber", e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-silver-shine mb-2">Kelas / Semester</label>
                      {/* DROPDOWN DINAMIS BERDASARKAN KATEGORI LOMBA */}
                      <select
                        required
                        disabled={formData.compeType === ""}
                        className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors disabled:opacity-50"
                        value={member.grade}
                        onChange={(e) => handleMemberChange(index, "grade", e.target.value)}
                      >
                        <option value="" disabled>-- Pilih Kelas / Semester --</option>
                        {!isMahasiswa ? (
                          <>
                            <option value="Kelas 10">Kelas 10 (SMA/MA/SMK)</option>
                            <option value="Kelas 11">Kelas 11 (SMA/MA/SMK)</option>
                            <option value="Kelas 12">Kelas 12 (SMA/MA/SMK)</option>
                            <option value="Lainnya (SMA Sederajat)">Lainnya (Tingkat SMA Sederajat)</option>
                          </>
                        ) : (
                          <>
                            <option value="Semester 1">Semester 1</option>
                            <option value="Semester 2">Semester 2</option>
                            <option value="Semester 3">Semester 3</option>
                            <option value="Semester 4">Semester 4</option>
                            <option value="Semester 5">Semester 5</option>
                            <option value="Semester 6">Semester 6</option>
                            <option value="Semester 7">Semester 7</option>
                            <option value="Semester 8">Semester 8</option>
                            <option value="Lainnya (S1)">Lainnya (Tingkat S1)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-silver-shine mb-2">Link Profil Instagram Peserta</label>
                      <input
                        required
                        type="url"
                        placeholder="https://instagram.com/username"
                        className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors"
                        value={member.igAccountLink}
                        onChange={(e) => handleMemberChange(index, "igAccountLink", e.target.value)}
                      />
                    </div>

                    {/* TOMBOL UPLOAD BUKTI (TANPA PREVIEW FOTO) */}
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <CldUploadWidget 
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} 
                        onSuccess={(res: CloudinaryResult) => { 
                          if(typeof res.info === "object" && res.info?.secure_url) {
                            handleMemberChange(index, "proofFollowUrl", res.info.secure_url);
                          }
                        }}
                      >
                        {({ open }) => (
                          <button 
                            type="button" 
                            onClick={() => open()} 
                            className={`w-full text-xs font-bold px-4 py-3 rounded-lg transition-colors border ${
                              member.proofFollowUrl 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : "bg-white/5 text-silver-shine border-white/20 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {member.proofFollowUrl ? "✓ Bukti Follow Instagram (Selesai)" : "Upload Bukti Follow IG EUREKA"}
                          </button>
                        )}
                      </CldUploadWidget>

                      <CldUploadWidget 
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} 
                        onSuccess={(res: CloudinaryResult) => { 
                          if(typeof res.info === "object" && res.info?.secure_url) {
                            handleMemberChange(index, "proofShareUrl", res.info.secure_url);
                          }
                        }}
                      >
                        {({ open }) => (
                          <button 
                            type="button" 
                            onClick={() => open()} 
                            className={`w-full text-xs font-bold px-4 py-3 rounded-lg transition-colors border ${
                              member.proofShareUrl 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : "bg-white/5 text-silver-shine border-white/20 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {member.proofShareUrl ? "✓ Bukti Share Poster (Selesai)" : "Upload Bukti Share Poster & BC"}
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-sunlight-orange text-blue-marine font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 mt-10 text-sm sm:text-base shadow-lg"
          >
            {isSaving 
              ? "Menyimpan Proses..." 
              : isEditMode 
                ? "Simpan Pembaruan Data" 
                : "Daftarkan Tim & Lanjutkan"}
          </button>
        </form>
      </div>
    </div>
  );
}