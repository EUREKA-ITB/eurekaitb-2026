"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, ListFilter, UserRound, Wallet, FileText, Wrench, Sparkles, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, serverTimestamp, query, where } from "firebase/firestore";

type Category = "akun" | "pembayaran" | "dokumen" | "teknis";

type LiveQuestion = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

const categories: { id: Category; label: string; icon: typeof UserRound }[] = [
  { id: "akun", label: "Pendaftaran & Akun", icon: UserRound },
  { id: "pembayaran", label: "Pembayaran", icon: Wallet },
  { id: "dokumen", label: "Dokumen", icon: FileText },
  { id: "teknis", label: "Teknis & Lainnya", icon: Wrench },
];

const faqs: { question: string; answer: string; category: Category }[] = [
  {
    category: "akun",
    question: "Bagaimana cara mendaftar sebagai peserta?",
    answer: "Buat akun terlebih dahulu, lalu masuk ke dashboard dan pilih menu pendaftaran lomba. Isi data tim, unggah dokumen yang diminta, dan lanjutkan ke langkah berikutnya sesuai kompetisi yang diikuti.",
  },
  {
    category: "akun",
    question: "Apakah saya bisa mengubah data tim setelah submit?",
    answer: "Untuk kompetisi berupa tim seperti SPC dan ICC, setelah selesai melakukan registrasi, formulir akan otomatis terkunci kecuali ada catatan revisi dari admin.",
  },
  {
    category: "akun",
    question: "Apakah satu akun email bisa mendaftar lebih dari satu lomba?",
    answer: "Tidak. Sistem EUREKA saat ini hanya memperbolehkan satu akun email untuk satu pendaftaran lomba demi menghindari duplikasi data.",
  },
  {
    category: "pembayaran",
    question: "Bagaimana jika saya belum menerima verifikasi pembayaran?",
    answer: "Tim bendahara akan memeriksa bukti transfer Anda. Jika sudah diverifikasi, status akan berubah menjadi verified dan nomor peserta resmi akan muncul di dashboard.",
  },
  {
    category: "pembayaran",
    question: "Kenapa status pembayaran saya masih unpaid padahal sudah upload bukti transfer?",
    answer: "Setelah upload bukti transfer, tim bendahara akan memeriksa mutasi bank terlebih dahulu. Jika belum diverifikasi, status akan tetap unpaid atau pending sampai proses validasi selesai.",
  },
  {
    category: "pembayaran",
    question: "Bagaimana total biaya dihitung dan apa itu kode unik transfer?",
    answer: "Total biaya terdiri dari biaya pendaftaran plus kode unik tiga digit di akhir. Kode unik ini membantu sistem mengenali pembayaran Anda tanpa salah.",
  },
  {
    category: "pembayaran",
    question: "Apa yang terjadi jika saya salah memasukkan 3 digit kode unik saat transfer?",
    answer: "Jika kode unik tidak cocok, sistem mungkin tidak dapat memverifikasi pembayaran otomatis. Hubungi helpdesk dan kirimkan bukti transfer agar verifikasi dapat dilakukan manual.",
  },
  {
    category: "dokumen",
    question: "Dokumen apa saja yang harus saya unggah untuk setiap anggota tim?",
    answer: "Setiap anggota harus melampirkan pas foto ukuran 3x4, KTM atau kartu pelajar, link Instagram, bukti follow akun resmi EUREKA, bukti upload twibbon, dan bukti share poster/BC sesuai instruksi formulir.",
  },
  {
    category: "teknis",
    question: "Apa yang harus saya lakukan jika ada masalah teknis?",
    answer: "Silakan hubungi helpdesk melalui email atau nomor WhatsApp resmi EUREKA. Tim support akan membantu menyelesaikan masalah Anda secepat mungkin.",
  },
];

export default function FaqPageV2() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "semua">("semua");

  const [liveQuestions, setLiveQuestions] = useState<LiveQuestion[]>([]);
  const [newLiveQuestion, setNewLiveQuestion] = useState("");
  const [liveCategory, setLiveCategory] = useState("General");
  const [isSubmittingLive, setIsSubmittingLive] = useState(false);

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "semua" || faq.category === activeCategory;
      const matchesQuery =
        searchQuery.trim().length === 0 ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, activeCategory]);

  // --- FIREBASE: AMBIL DATA TANPA ORDERBY AGAR TIDAK BUTUH INDEX KHUSUS ---
  useEffect(() => {
    const q = query(collection(db, "qna_board"), where("status", "==", "answered"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qnaData: LiveQuestion[] = [];
      snapshot.forEach((doc) => {
        qnaData.push({ id: doc.id, ...doc.data() } as LiveQuestion);
      });
      setLiveQuestions(qnaData);
    }, (error) => {
      console.error("Firestore Error:", error);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiveQuestion.trim()) return;
    setIsSubmittingLive(true);
    
    try {
      await addDoc(collection(db, "qna_board"), {
        category: liveCategory,
        question: newLiveQuestion,
        answer: "",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setNewLiveQuestion("");
      alert("Pertanyaanmu berhasil dikirim! Menunggu balasan admin.");
    } catch (error) {
      console.error("Error adding doc:", error);
      alert("Gagal mengirim pertanyaan. Pastikan Rules Firebase sudah di-publish.");
    } finally {
      setIsSubmittingLive(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-28 pb-20 text-white selection:bg-sunlight-orange selection:text-blue-marine overflow-x-hidden">
      <div className="mx-auto max-w-4xl w-full">
        {/* HERO + SEARCH */}
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 backdrop-blur-sm shadow-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-1 py-1.5 text-s font-bold uppercase tracking-[0.35em] text-sunlight-orange mb-5">
            General FAQ
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mx-auto max-w-2xl">
            Cari jawaban lebih cepat lewat pencarian
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-silver-shine">
            Ketik kata kunci atau pilih kategori pertanyaan di bawah untuk langsung menemukan jawaban yang kamu butuhkan.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 max-w-3xl mx-auto">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-shine" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pertanyaan, misalnya: pembayaran, dokumen, kode unik..."
                className="w-full rounded-full border border-white/15 bg-black/20 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-silver-shine/60 outline-none focus:border-sunlight-orange/60"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                onClick={() => setActiveCategory("semua")}
                variant={activeCategory === "semua" ? "default" : "outline"}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                  activeCategory === "semua"
                    ? "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <ListFilter size={14} /> Semua
              </Button>
              {categories.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategory(id)}
                  variant={activeCategory === id ? "default" : "outline"}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                    activeCategory === id
                      ? "bg-sunlight-orange text-blue-marine hover:bg-yellow-400"
                      : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={14} /> {label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* STATIC CONTENT */}
        <section className="mt-8 w-full">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md w-full box-border">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-display text-lg font-semibold text-white">Tidak ada hasil ditemukan</p>
                <p className="mt-2 text-sm text-silver-shine">
                  Coba kata kunci lain atau hubungi helpdesk melalui form Q&A di bawah.
                </p>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                {filtered.map((faq) => {
                  const CategoryIcon = categories.find((c) => c.id === faq.category)?.icon ?? Sparkles;
                  return (
                    <details
                      key={faq.question}
                      className="group rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:bg-white/5 w-full cursor-pointer"
                    >
                      <summary className="list-none text-sm sm:text-base font-semibold text-white flex gap-4 outline-none w-full items-center">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunlight-orange/10 text-sunlight-orange">
                          <CategoryIcon size={18} />
                        </span>
                        <span className="pt-1 break-words flex-1 leading-tight">{faq.question}</span>
                      </summary>
                      <p className="mt-4 ml-14 text-sm leading-relaxed text-silver-shine border-t border-white/10 pt-4 break-words">
                        {faq.answer}
                      </p>
                    </details>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* --- LIVE Q&A SECTION DARI FIREBASE --- */}
        <section className="mt-16 w-full pt-10 border-t border-white/10">
          <div className="text-center mb-10">
             <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-sunlight-orange mb-4">
                <MessageCircleQuestion size={18} /> Live Q&A Board
             </div>
             <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Got a Question? Ask It Here</h2>
             <p className="text-silver-shine text-sm sm:text-base max-w-2xl mx-auto">
               Our team responds periodically. Answers are visible to all participants.
             </p>
          </div>
          
          {/* Form Tanya */}
          <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl mb-12 backdrop-blur-sm shadow-xl">
            <form onSubmit={handleLiveSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <select 
                  value={liveCategory} 
                  onChange={(e) => setLiveCategory(e.target.value)}
                  className="bg-black/40 border border-white/20 rounded-xl p-4 text-sm focus:border-sunlight-orange outline-none text-white md:w-1/3"
                >
                  <option value="General">General / System</option>
                  <option value="Physics Olympiad">Physics Olympiad</option>
                  <option value="Science Project">Science Project</option>
                  <option value="Industrial Case">Industrial Case</option>
                </select>
                <input 
                  type="text" 
                  value={newLiveQuestion}
                  onChange={(e) => setNewLiveQuestion(e.target.value)}
                  placeholder="Enter your question here..."
                  className="bg-black/40 border border-white/20 rounded-xl p-4 text-sm focus:border-sunlight-orange outline-none text-white w-full"
                  required
                />
              </div>
              <button type="submit" disabled={isSubmittingLive} className="bg-sunlight-orange text-blue-marine font-bold py-3.5 px-8 rounded-xl self-end hover:bg-yellow-400 transition-colors disabled:opacity-50 text-sm shadow-[0_0_15px_rgba(255,184,0,0.3)]">
                {isSubmittingLive ? "Submitting..." : "Submit Question"}
              </button>
            </form>
          </div>

          {/* List Jawaban Live */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold mb-4 text-white">Latest Open Discussions</h3>
            
            {liveQuestions.length === 0 ? (
              <div className="bg-white/5 border border-white/10 p-10 rounded-3xl text-center">
                <p className="text-silver-shine">No open discussions available at the moment.</p>
              </div>
            ) : (
              liveQuestions.map((item) => (
                <div key={item.id} className="bg-black/30 border border-white/10 p-6 rounded-2xl hover:bg-white/5 transition-colors shadow-lg">
                  <div className="inline-block bg-blue-900/50 text-blue-200 text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-widest mb-4">
                    {item.category}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-4 flex gap-3 items-start">
                    <span className="text-sunlight-orange shrink-0">Q:</span> <span className="pt-0.5 leading-snug">{item.question}</span>
                  </h4>
                  <div className="bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl flex gap-3 items-start">
                    <span className="text-green-400 font-bold shrink-0">A:</span>
                    <p className="text-silver-shine text-sm leading-relaxed pt-0.5">{item.answer}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}