"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Props = {
  onClose: () => void;
  onSignUp: () => void;
};

export default function LoginModal({ onClose, onSignUp }: Props) {
  const { signInWithEmail, signInWithKakao } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const err = await signInWithEmail(email, password);
    if (err) setError("이메일 또는 비밀번호가 올바르지 않아요.");
    else onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-text-primary">로그인</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-text-muted">또는</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <button
          onClick={signInWithKakao}
          className="w-full py-3 bg-[#FEE500] hover:bg-[#F5DC00] text-[#191919] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919"><path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.61 5.08 4.04 6.54L5.1 21l4.3-2.84c.85.15 1.71.24 2.6.24 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/></svg>
          카카오로 로그인
        </button>

        <button
          onClick={() => { onClose(); onSignUp(); }}
          className="w-full py-3 border border-gray-200 text-text-secondary text-sm font-semibold rounded-xl hover:border-primary-300 hover:text-primary-400 transition-colors"
        >
          회원가입하기
        </button>
      </div>
    </div>
  );
}
