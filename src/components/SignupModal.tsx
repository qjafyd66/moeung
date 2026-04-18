"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Props = {
  onClose: () => void;
  onLogin: () => void;
};

export default function SignupModal({ onClose, onLogin }: Props) {
  const { signUpWithEmail, checkNickname } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "ok" | "taken" | "checking">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckNickname = async () => {
    if (!nickname.trim()) return;
    setNicknameStatus("checking");
    const taken = await checkNickname(nickname.trim());
    setNicknameStatus(taken ? "taken" : "ok");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nicknameStatus !== "ok") { setError("닉네임 중복 확인을 해주세요."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 해요."); return; }
    setLoading(true);
    setError("");
    const err = await signUpWithEmail(email, password, nickname.trim());
    if (err) setError(err);
    else onClose();
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
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); setNicknameStatus("idle"); }}
              required
              className={`flex-1 px-4 py-3 text-sm border rounded-xl focus:outline-none text-text-primary placeholder:text-text-muted transition-colors ${
                nicknameStatus === "ok" ? "border-green-400 focus:border-green-400" :
                nicknameStatus === "taken" ? "border-red-400 focus:border-red-400" :
                "border-gray-200 focus:border-primary-400"
              }`}
            />
            <button
              type="button"
              onClick={handleCheckNickname}
              disabled={!nickname.trim() || nicknameStatus === "checking"}
              className="px-3 py-3 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-xl transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              중복확인
            </button>
          </div>
          {nicknameStatus === "ok" && <p className="text-xs text-green-500 -mt-1">사용 가능한 닉네임이에요.</p>}
          {nicknameStatus === "taken" && <p className="text-xs text-red-500 -mt-1">이미 사용 중인 닉네임이에요.</p>}

          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <button
          onClick={() => { onClose(); onLogin(); }}
          className="text-xs text-text-muted hover:text-primary-400 transition-colors text-center"
        >
          이미 계정이 있어요 → 로그인
        </button>
      </div>
    </div>
  );
}
