"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  KeyRound,
  Mail,
} from "lucide-react";

type ExamLoginGuideProps = {
  username: string;
  password: string;
};

export default function ExamLoginGuide({
  username,
  password,
}: ExamLoginGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  const loginEmail = `${username.toLowerCase()}@eurekaitb.com`;
  const loginPassword = password.toUpperCase();

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-left transition-colors hover:bg-white/10"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-lg bg-sunlight-orange/15 text-sunlight-orange flex items-center justify-center shrink-0">
            <BookOpen size={18} />
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-bold text-white">
              Login Guide
            </span>
            <span className="block text-xs text-silver-shine mt-0.5">
              Step-by-step login ke Exam Platform
            </span>
          </span>
        </span>

        <ChevronDown
          size={18}
          className={`text-silver-shine shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-sunlight-orange mb-2">
                How to Login
              </p>
              <h4 className="text-base sm:text-lg font-bold text-white">
                Panduan Login ke EUREKA Exam Platform
              </h4>
              <p className="text-xs sm:text-sm text-silver-shine mt-2 leading-relaxed">
                Ikuti langkah berikut untuk mengakses Try Out melalui
                exam.eurekaitb.com.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sunlight-orange text-blue-marine font-bold text-sm flex items-center justify-center shrink-0">
                  1
                </div>

                <div className="min-w-0">
                  <h5 className="font-bold text-white text-sm sm:text-base">
                    Catat credentials kamu
                  </h5>
                  <p className="text-xs sm:text-sm text-silver-shine mt-1 leading-relaxed">
                    Peserta dapat melihat Username dan Password yang
                    digunakan untuk login pada bagian credentials di atas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sunlight-orange text-blue-marine font-bold text-sm flex items-center justify-center shrink-0">
                  2
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-white text-sm sm:text-base">
                    Login ke Exam Platform
                  </h5>

                  <p className="text-xs sm:text-sm text-silver-shine mt-1 leading-relaxed">
                    Klik tombol{" "}
                    <span className="font-semibold text-white">
                      Enter Exam Platform
                    </span>{" "}
                    di bawah panduan ini, lalu login menggunakan credentials
                    dengan format berikut:
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-silver-shine mb-2">
                        <Mail size={15} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Email Address
                        </span>
                      </div>

                      <p className="font-mono text-xs sm:text-sm font-bold text-white break-all">
                        {loginEmail}
                      </p>

                      <p className="text-[11px] text-silver-shine mt-2 leading-relaxed">
                        Username harus menggunakan huruf nonkapital, kemudian
                        tambahkan{" "}
                        <span className="font-mono text-white">
                          @eurekaitb.com
                        </span>
                        .
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-silver-shine mb-2">
                        <KeyRound size={15} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Password
                        </span>
                      </div>

                      <p className="font-mono text-xs sm:text-sm font-bold text-white break-all">
                        {loginPassword}
                      </p>

                      <p className="text-[11px] text-silver-shine mt-2 leading-relaxed">
                        Password digunakan dalam huruf kapital.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-sunlight-orange/20 bg-sunlight-orange/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sunlight-orange mb-2">
                      Contoh Format
                    </p>

                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <p className="text-silver-shine break-all">
                        <span className="text-white font-semibold">
                          Email Address:
                        </span>{" "}
                        e26-po-xxxx@eurekaitb.com
                      </p>

                      <p className="text-silver-shine break-all">
                        <span className="text-white font-semibold">
                          Password:
                        </span>{" "}
                        XXXXXX
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sunlight-orange text-blue-marine font-bold text-sm flex items-center justify-center shrink-0">
                  3
                </div>

                <div className="min-w-0">
                  <h5 className="font-bold text-white text-sm sm:text-base">
                    Mulai Try Out
                  </h5>

                  <p className="text-xs sm:text-sm text-silver-shine mt-1 leading-relaxed">
                    Setelah berhasil login, Try Out akan muncul pada
                    dashboard peserta dan siap untuk dikerjakan.
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle2 size={15} />
                    <span className="font-semibold">
                      Login berhasil → Try Out siap dikerjakan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-start gap-2 text-[11px] text-silver-shine leading-relaxed">
              <ExternalLink size={14} className="shrink-0 mt-0.5" />
              <p>
                Gunakan tombol{" "}
                <span className="font-semibold text-white">
                  Enter Exam Platform
                </span>{" "}
                untuk membuka portal ujian resmi EUREKA.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}