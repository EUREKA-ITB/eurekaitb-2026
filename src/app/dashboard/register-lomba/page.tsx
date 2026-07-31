"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { getCurrentPhase, getPrice, formatIDR, PHASE_NAMES } from "@/lib/competition-config";
import type { CompeType } from "@/lib/competition-config";

interface CloudinaryResult {
  info?: string | { secure_url?: string; };
}

interface MemberInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  grade: string;       
  photoUrl: string;    
  ktmUrl: string;      
  igAccountLink: string;
  proofFollowUrl: string;
  proofShareUrl: string; 
  isLeader: boolean;   
}

interface FormData {
  compeType: CompeType | "";
  teamName: string;
  institutionName: string;
  members: MemberInput[]; 
}

const createEmptyMember = (isLeader: boolean): MemberInput => ({
  fullName: "", email: "", phoneNumber: "", grade: "", photoUrl: "", ktmUrl: "", 
  igAccountLink: "", proofFollowUrl: "", proofShareUrl: "", isLeader: isLeader,
});

export default function RegisterLombaPage() {
  const router = useRouter();
  
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<FormData>({
    compeType: "", teamName: "", institutionName: "", members: [createEmptyMember(true)], 
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockedCompeName, setLockedCompeName] = useState<string>("");

  const currentPhase = getCurrentPhase();
  const currentPhaseName = PHASE_NAMES[currentPhase];

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
            
            let validMembers: Partial<MemberInput>[] = Array.isArray(data.members) && data.members.length > 0 ? data.members : [createEmptyMember(true)];

            validMembers = validMembers.sort((a: Partial<MemberInput>, b: Partial<MemberInput>) => Number(b.isLeader || false) - Number(a.isLeader || false));

            const processedMembers: MemberInput[] = validMembers.map((m: Partial<MemberInput>) => ({
              fullName: m.fullName || "", email: m.email || "", phoneNumber: m.phoneNumber || "", grade: m.grade || "",       
              photoUrl: m.photoUrl || "", ktmUrl: m.ktmUrl || "", igAccountLink: m.igAccountLink || "",
              proofFollowUrl: m.proofFollowUrl || "", proofShareUrl: m.proofShareUrl || "", isLeader: m.isLeader ?? false,
            }));

            if ((data.team.compeType === "science_project" || data.team.compeType === "industrial_case") && processedMembers.length < 2) {
              processedMembers.push(createEmptyMember(false));
            }

            setFormData({
              compeType: data.team.compeType || "", teamName: data.team.teamName || "",
              institutionName: data.team.institutionName || "", members: processedMembers,
            });
          }
        }
      } catch (error: unknown) {
        /* Silently handle error */
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
        if (prev.members.length < 2) newMembers.push(createEmptyMember(false));
        else newMembers = prev.members.map(m => ({...m, grade: ""}));
      }

      return { ...prev, compeType: selectedType, members: newMembers };
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
      if (prev.members.length < 3) return { ...prev, members: [...prev.members, createEmptyMember(false)] };
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
        alert("IMPORTANT: Please complete all documents and links (Photo, Student ID, IG Link, Proof of Follow & Share) for EVERY member!");
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/teams", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
      });

      const data = await response.json() as { error?: string; message?: string };

      if (!response.ok) alert(`Failed: ${data.error ?? "An error occurred"}`);
      else {
        alert(isEditMode ? "Data Successfully Updated!" : "Competition Registration Successful!");
        router.push("/dashboard");
        router.refresh(); 
      }
    } catch (error: unknown) {
      alert("Network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const isTeamCompetition = formData.compeType === "science_project" || formData.compeType === "industrial_case";
  const isMahasiswa = formData.compeType === "industrial_case";

  if (isFetching) return <div className="min-h-screen bg-blue-marine flex items-center justify-center text-white font-display text-xl tracking-widest">LOADING DATA...</div>;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 flex items-center justify-center box-border">
        <div className="bg-white/5 border border-white/10 p-8 sm:p-12 rounded-3xl text-center max-w-lg shadow-2xl backdrop-blur-sm">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400 font-bold text-2xl">!</div>
          <h2 className="font-display text-2xl font-bold mb-4">Form Access Locked</h2>
          <p className="text-silver-shine text-sm leading-relaxed mb-8">
            Your account is currently registered for <span className="text-white font-bold capitalize">{lockedCompeName}</span> and is undergoing payment verification or has been verified. 
            <br/><br/>
            EUREKA limits 1 Email Account to 1 Competition Registration.
          </p>
          <Link href="/dashboard" className="inline-block bg-sunlight-orange text-blue-marine font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden pt-28">
      <div className="max-w-4xl mx-auto w-full">
        
        <button type="button" onClick={() => router.back()} className="inline-flex items-center text-silver-shine hover:text-white mb-6 transition-colors text-sm sm:text-base bg-transparent border-none p-0 cursor-pointer">
          <span className="mr-2">←</span> Cancel & Return
        </button>

        <h1 className="font-display text-2xl sm:text-4xl font-bold text-sunlight-orange mb-3 break-words">
          {isEditMode ? "Edit Registration Data" : "Competition Registration"}
        </h1>
        <p className="text-silver-shine text-xs sm:text-sm mb-8 max-w-xl">
          Complete the form below. Ensure all member data and administrative documents are valid.
        </p>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-sm w-full box-border">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 border-b border-white/10 pb-10">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Competition Category</label>
              <select required className="w-full bg-blue-marine border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors" value={formData.compeType} onChange={handleCompeTypeChange}>
                <option value="" disabled>-- Select Competition --</option>
                <option value="physics_olympiad">Physics Olympiad (High School - Individual)</option>
                <option value="science_project">Science Project (High School - Team)</option>
                <option value="industrial_case">Industrial Case (Undergraduate - Team)</option>
              </select>
              
              {formData.compeType !== "" && (
                <div className="mt-4 bg-sunlight-orange/10 border border-sunlight-orange/30 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-sunlight-orange font-bold uppercase tracking-widest mb-1">Current Registration Phase</p>
                    <p className="text-white font-bold">{currentPhaseName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-silver-shine mb-1">Registration Fee</p>
                    <p className="text-xl font-display font-bold text-sunlight-orange">{formatIDR(getPrice(formData.compeType as CompeType, currentPhase))}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{formData.compeType === "physics_olympiad" ? "Full Participant Name" : "Team Name"}</label>
              <input required type="text" placeholder={formData.compeType === "physics_olympiad" ? "e.g. Albert Einstein" : "e.g. Gamma Team ITB"} className="w-full bg-blue-marine border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors" value={formData.teamName} onChange={(e) => setFormData((prev) => ({...prev, teamName: e.target.value}))} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Institution / School</label>
              <input required type="text" placeholder="e.g. SMAN 3 Bandung" className="w-full bg-blue-marine border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sunlight-orange transition-colors" value={formData.institutionName} onChange={(e) => setFormData((prev) => ({...prev, institutionName: e.target.value}))} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h3 className="font-display text-xl font-bold text-sunlight-orange">Personnel Data</h3>
            {isTeamCompetition && formData.members.length < 3 && (
              <button type="button" onClick={addMemberSlot} className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg self-start sm:self-auto transition-colors">
                + Add Member ({formData.members.length}/3)
              </button>
            )}
          </div>

          <div className="space-y-6">
            {formData.members.map((member, index) => (
              <div key={index} className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl w-full box-border relative">
                
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-sunlight-orange bg-sunlight-orange/10 px-3 py-1.5 rounded-md uppercase tracking-widest">
                    {member.isLeader ? "★ Team Leader / Individual" : `Additional Member ${index}`}
                  </span>
                  {!member.isLeader && <button type="button" onClick={() => removeMemberSlot(index)} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">Remove Member</button>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-2 grid grid-cols-2 gap-4 h-max">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-3 bg-black/20">
                       {member.photoUrl ? (
                         <Image src={member.photoUrl} alt="Photo" width={320} height={128} unoptimized className="w-full h-32 object-cover rounded-md mb-3 border border-white/20 shadow-lg" />
                       ) : (
                         <div className="w-full h-32 bg-white/5 rounded-md mb-3 flex items-center justify-center text-xs text-silver-shine text-center px-2">3x4 Photo</div>
                      )}
                      <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} onSuccess={(res: CloudinaryResult) => { if(typeof res.info === "object" && res.info?.secure_url) handleMemberChange(index, "photoUrl", res.info.secure_url); }}>
                        {({ open }) => <button type="button" onClick={() => open()} className="text-[10px] bg-sunlight-orange text-blue-marine font-bold px-2 py-2 rounded-md w-full hover:bg-yellow-400 transition-colors">{member.photoUrl ? "Change Photo" : "Upload Photo"}</button>}
                      </CldUploadWidget>
                    </div>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-3 bg-black/20">
                       {member.ktmUrl ? (
                         <Image src={member.ktmUrl} alt="Student ID" width={320} height={128} unoptimized className="w-full h-32 object-cover rounded-md mb-3 border border-white/20 shadow-lg" />
                       ) : (
                         <div className="w-full h-32 bg-white/5 rounded-md mb-3 flex items-center justify-center text-xs text-silver-shine text-center px-2">Student ID</div>
                      )}
                      <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} onSuccess={(res: CloudinaryResult) => { if(typeof res.info === "object" && res.info?.secure_url) handleMemberChange(index, "ktmUrl", res.info.secure_url); }}>
                        {({ open }) => <button type="button" onClick={() => open()} className="text-[10px] bg-sunlight-orange text-blue-marine font-bold px-2 py-2 rounded-md w-full hover:bg-yellow-400 transition-colors">{member.ktmUrl ? "Change ID" : "Upload ID"}</button>}
                      </CldUploadWidget>
                    </div>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5 h-max">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-silver-shine mb-2">Full Name (as per ID)</label>
                      <input required type="text" className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors" value={member.fullName} onChange={(e) => handleMemberChange(index, "fullName", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-silver-shine mb-2">Active Email</label>
                      <input required type="email" placeholder="name@email.com" className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors" value={member.email} onChange={(e) => handleMemberChange(index, "email", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-silver-shine mb-2">WhatsApp Number</label>
                      <input required type="tel" placeholder="08xxxxxxxx" className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors" value={member.phoneNumber} onChange={(e) => handleMemberChange(index, "phoneNumber", e.target.value)} />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-silver-shine mb-2">Grade / Semester</label>
                      <select required disabled={formData.compeType === ""} className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors disabled:opacity-50" value={member.grade} onChange={(e) => handleMemberChange(index, "grade", e.target.value)}>
                        <option value="" disabled>-- Select Grade / Semester --</option>
                        {!isMahasiswa ? (
                          <>
                            <option value="10th Grade">10th Grade</option>
                            <option value="11th Grade">11th Grade</option>
                            <option value="12th Grade">12th Grade</option>
                            <option value="Other (High School)">Other (High School Level)</option>
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
                            <option value="Other (Undergraduate)">Other (Undergraduate Level)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-silver-shine mb-2">Instagram Profile Link</label>
                      <input required type="url" placeholder="https://instagram.com/username" className="w-full bg-blue-marine border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange transition-colors" value={member.igAccountLink} onChange={(e) => handleMemberChange(index, "igAccountLink", e.target.value)} />
                    </div>

                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} onSuccess={(res: CloudinaryResult) => { if(typeof res.info === "object" && res.info?.secure_url) handleMemberChange(index, "proofFollowUrl", res.info.secure_url); }}>
                        {({ open }) => (
                          <button type="button" onClick={() => open()} className={`w-full text-xs font-bold px-4 py-3 rounded-lg transition-colors border ${member.proofFollowUrl ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-white/5 text-silver-shine border-white/20 hover:bg-white/10 hover:text-white"}`}>
                            {member.proofFollowUrl ? "✓ IG Follow Proof (Done)" : "Upload EUREKA IG Follow Proof"}
                          </button>
                        )}
                      </CldUploadWidget>

                      <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET} onSuccess={(res: CloudinaryResult) => { if(typeof res.info === "object" && res.info?.secure_url) handleMemberChange(index, "proofShareUrl", res.info.secure_url); }}>
                        {({ open }) => (
                          <button type="button" onClick={() => open()} className={`w-full text-xs font-bold px-4 py-3 rounded-lg transition-colors border ${member.proofShareUrl ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-white/5 text-silver-shine border-white/20 hover:bg-white/10 hover:text-white"}`}>
                            {member.proofShareUrl ? "✓ Poster Share Proof (Done)" : "Upload Poster & BC Share Proof"}
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-sunlight-orange text-blue-marine font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 mt-10 text-sm sm:text-base shadow-lg">
            {isSaving ? "Saving Process..." : isEditMode ? "Save Data Updates" : "Register Team & Proceed"}
          </button>
        </form>
      </div>
    </div>
  );
}