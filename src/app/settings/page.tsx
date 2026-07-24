import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Camera, KeyRound, Mail, Save, Shield, User, GraduationCap, IdCard } from "lucide-react";
import Image from "next/image";

export default async function SettingsPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "profile";

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (dbUser.length === 0) redirect("/login");

  const userData = dbUser[0];

  return (
    <div className="min-h-screen bg-blue-marine text-white font-sans p-4 sm:p-8 md:p-12 box-border overflow-x-hidden pt-24 pb-20">
      <div className="max-w-4xl mx-auto w-full">
        
        <Link href="/dashboard" className="inline-flex items-center text-silver-shine hover:text-white transition-colors w-max text-sm font-semibold mb-8">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>

        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-silver-shine text-sm">Manage your profile information and account preferences here.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
          
          <div className="flex flex-col gap-2">
            <Link 
              href="?tab=profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                activeTab === "profile" ? "bg-white/10 border border-white/20 text-white shadow-lg" : "bg-transparent hover:bg-white/5 border border-transparent text-silver-shine hover:text-white"
              }`}
            >
              <User size={18} className={activeTab === "profile" ? "text-sunlight-orange" : ""} /> Public Profile
            </Link>
            <Link 
              href="?tab=security" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                activeTab === "security" ? "bg-white/10 border border-white/20 text-white shadow-lg" : "bg-transparent hover:bg-white/5 border border-transparent text-silver-shine hover:text-white"
              }`}
            >
              <Shield size={18} className={activeTab === "security" ? "text-sunlight-orange" : ""} /> Security
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-sm relative overflow-hidden min-h-[400px]">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-sunlight-orange/10 blur-3xl rounded-full z-0 pointer-events-none"></div>
            
            <div className="relative z-10">
              
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <>
                  <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/10">
                    <div className="relative group cursor-pointer">
                      {userData.image || session.user?.image ? (
                        <Image src={userData.image || session.user?.image || ""} alt="Profile" width={96} height={96} unoptimized className="w-24 h-24 rounded-full border-2 border-white/20 object-cover group-hover:opacity-50 transition-opacity" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-sunlight-orange text-blue-marine flex items-center justify-center font-bold text-3xl group-hover:opacity-80 transition-opacity">
                          {userData.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Profile Picture</h3>
                      <p className="text-xs text-silver-shine mb-3">Supported formats: JPG, PNG, or GIF (Max. 2MB)</p>
                      <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-white/10">Change Picture</button>
                    </div>
                  </div>

                  <form className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-white flex items-center gap-2"><User size={16} className="text-sunlight-orange" /> Full Name</label>
                      <input type="text" defaultValue={userData.name || ""} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-white flex items-center gap-2"><Mail size={16} className="text-sunlight-orange" /> Email Address</label>
                      <input type="email" defaultValue={userData.email || ""} disabled className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-silver-shine cursor-not-allowed opacity-70" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 pt-6 border-t border-white/10">
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2"><GraduationCap size={16} className="text-sunlight-orange" /> Institution / School</label>
                        <input type="text" placeholder="e.g. SMAN 1 Bandung" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2"><IdCard size={16} className="text-sunlight-orange" /> Identity Number</label>
                        <input type="text" placeholder="NISN or NIM" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2"><User size={16} className="text-sunlight-orange" /> Education Level</label>
                        <select className="w-full bg-[#0a102b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sunlight-orange appearance-none">
                          <option value="SMA">High School</option>
                          <option value="S1">Undergraduate (S1)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 mt-4">
                      <button type="button" className="flex items-center gap-2 bg-sunlight-orange text-blue-marine px-6 py-3 rounded-xl text-sm font-bold hover:bg-yellow-400 transition-colors shadow-lg">
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <>
                  <div className="mb-8 pb-8 border-b border-white/10">
                    <h3 className="font-display font-bold text-2xl mb-2 flex items-center gap-3"><KeyRound className="text-sunlight-orange" /> Change Password</h3>
                    <p className="text-sm text-silver-shine leading-relaxed">Ensure your account uses a strong password (minimum 8 characters) and is not used on other sites.</p>
                  </div>
                  <form className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2"><label className="text-sm font-bold text-white">Current Password</label><input type="password" placeholder="Enter old password" className="w-full bg-black/30 border border-white/10 focus:border-sunlight-orange rounded-xl px-4 py-3 text-sm text-white focus:outline-none" /></div>
                    <div className="flex flex-col gap-2"><label className="text-sm font-bold text-white">New Password</label><input type="password" placeholder="Enter new password" className="w-full bg-black/30 border border-white/10 focus:border-sunlight-orange rounded-xl px-4 py-3 text-sm text-white focus:outline-none" /></div>
                    <div className="flex flex-col gap-2"><label className="text-sm font-bold text-white">Confirm New Password</label><input type="password" placeholder="Repeat new password" className="w-full bg-black/30 border border-white/10 focus:border-sunlight-orange rounded-xl px-4 py-3 text-sm text-white focus:outline-none" /></div>
                    <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-white/10">
                      <button type="button" className="flex items-center gap-2 bg-sunlight-orange text-blue-marine px-6 py-3 rounded-xl text-sm font-bold hover:bg-yellow-400 transition-colors shadow-lg">
                        <Save size={16} /> Update Password
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}