"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Props = {
  onClose: () => void;
  onLogin: () => void;
};

export default function SignupModal({ onClose, onLogin }: Props) {
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 해요."); return; }
    setLoading(true);
    setError("");
    const err = await signUpWithEmail(email, password);
    if (err) setError(err);
    else setDone(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-text-primary">회원가입</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {done ? (
          <div className="flex flex-col gap-4 text-center py-4">
            <div className="text-4xl">✉️</div>
            <p className="text-sm font-bold text-text-primary">이메일을 확인해주세요</p>
            <p className="text-xs text-text-muted leading-relaxed">
              <span className="font-semibold text-primary-400">{email}</span>로 인증 메일을 보냈어요.<br />
              인증 후 로그인하면 닉네임을 설정할 수 있어요.
            </p>
            <button onClick={() => { onClose(); onLogin(); }} className="w-full py-3 bg-primary-400 text-white text-sm font-bold rounded-xl hover:bg-primary-500 transition-colors">
              로그인하러 가기
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 mt-1"
              >
                {loading ? "처리 중..." : "이메일 인증 받기"}
              </button>
            </form>

            <button
              onClick={() => { onClose(); onLogin(); }}
              className="text-xs text-text-muted hover:text-primary-400 transition-colors text-center"
            >
              이미 계정이 있어요 → 로그인
            </button>
          </>
        )}
      </div>
    </div>
  );
}
