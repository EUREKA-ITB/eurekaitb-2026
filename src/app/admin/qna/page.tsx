"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

type Question = {
  id: string;
  category: string;
  question: string;
  answer: string;
  status: "pending" | "answered";
  createdAt?: unknown;
};

export default function AdminQnAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [filter, setFilter] = useState("pending"); // 'pending', 'answered', 'all'

  useEffect(() => {
    const q = query(collection(db, "qna_board"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qnaData: Question[] = [];
      snapshot.forEach((doc) => {
        qnaData.push({ id: doc.id, ...doc.data() } as Question);
      });
      setQuestions(qnaData);
    });
    return () => unsubscribe();
  }, []);

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const docRef = doc(db, "qna_board", id);
      await updateDoc(docRef, {
        answer: replyText,
        status: "answered",
        answeredAt: new Date(),
      });
      setReplyText("");
      setActiveReplyId(null);
      alert("Jawaban berhasil diupload");
    } catch (error) {
      console.error("Error replying:", error);
      alert("Gagal membalas pertanyaan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pertanyaan ini?")) return;
    try {
      await deleteDoc(doc(db, "qna_board", id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const filteredQuestions = questions.filter(q => filter === "all" ? true : q.status === filter);

  return (
    <div className="min-h-screen bg-blue-marine text-white p-8 pt-24 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-sunlight-orange mb-6">Live Q&A Admin Dashboard</h1>
        
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${filter === "pending" ? "bg-sunlight-orange text-blue-marine" : "bg-white/10 hover:bg-white/20"}`}>Menunggu Jawaban ({questions.filter(q => q.status === "pending").length})</button>
          <button onClick={() => setFilter("answered")} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${filter === "answered" ? "bg-green-500 text-white" : "bg-white/10 hover:bg-white/20"}`}>Sudah Dijawab ({questions.filter(q => q.status === "answered").length})</button>
          <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${filter === "all" ? "bg-white/30 text-white" : "bg-white/10 hover:bg-white/20"}`}>Semua</button>
        </div>

        {/* QnA List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 && (
            <div className="text-center py-10 text-silver-shine">Tidak ada pertanyaan di kategori ini.</div>
          )}
          
          {filteredQuestions.map((item) => (
            <div key={item.id} className={`p-6 rounded-2xl border ${item.status === "pending" ? "bg-white/5 border-sunlight-orange/50" : "bg-black/20 border-white/10"}`}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-widest bg-blue-900 text-blue-200 px-3 py-1 rounded-full">{item.category}</span>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-300">Hapus</button>
              </div>
              
              <p className="font-bold text-lg mb-4 text-white">Q: {item.question}</p>
              
              {item.status === "answered" ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                  <p className="text-green-400 font-bold text-sm mb-1">A: Jawaban EUREKA!</p>
                  <p className="text-silver-shine text-sm">{item.answer}</p>
                </div>
              ) : (
                <div className="mt-4">
                  {activeReplyId === item.id ? (
                    <div className="flex flex-col gap-3">
                      <textarea 
                        className="w-full bg-blue-marine border border-white/20 rounded-xl p-3 text-sm focus:border-sunlight-orange outline-none" 
                        rows={3} 
                        placeholder="Tulis jawabanmu di sini..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => {setActiveReplyId(null); setReplyText("");}} className="px-4 py-2 text-sm text-silver-shine hover:text-white">Batal</button>
                        <button onClick={() => handleReply(item.id)} className="px-6 py-2 bg-sunlight-orange text-blue-marine font-bold rounded-lg text-sm hover:bg-yellow-400">Kirim Jawaban</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => {setActiveReplyId(item.id); setReplyText("");}} className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">Beri Jawaban</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}