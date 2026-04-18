"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type Props = {
  onClose: () => void;
  onLogin: () => void;
};

type Step = "email" | "otp" | "profile";

export default function SignupModal({ onClose, onLogin }: Props) {
  const { checkNickname, saveProfile } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "ok" | "taken" | "checking">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) setError(error.message);
    else setStep("otp");
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) setError("인증코드가 올바르지 않아요.");
    else setStep("profile");
    setLoading(false);
  };

  const handleCheckNickname = async () => {
    if (!nickname.trim()) return;
    setNicknameStatus("checking");
    const taken = await checkNickname(nickname.trim());
    setNicknameStatus(taken ? "taken" : "ok");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nicknameStatus !== "ok") { setError("닉네임 중복 확인을 해주세요."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 해요."); return; }
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("인증 정보를 찾을 수 없어요."); setLoading(false); return; }
    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) { setError(pwError.message); setLoading(false); return; }
    const err = await saveProfile(user.id, nickname.trim());
    if (err) { setError(err); setLoading(false); return; }
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">회원가입</h2>
            <div className="flex gap-1 mt-1.5">
              {(["email", "otp", "profile"] as Step[]).map((s, i) => (
                <div key={s} className={`h-1 rounded-full flex-1 transition-colors ${
                  step === s ? "bg-primary-400" :
                  ["email", "otp", "profile"].indexOf(step) > i ? "bg-primary-200" : "bg-gray-100"
                }`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors ml-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">이메일을 입력하면 인증코드를 보내드려요.</p>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              {loading ? "전송 중..." : "인증코드 받기"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">
              <span className="font-semibold text-primary-400">{email}</span>로 전송된 6자리 코드를 입력해주세요.
            </p>
            <input
              type="text"
              placeholder="인증코드 6자리"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              maxLength={6}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted tracking-widest text-center text-lg font-semibold"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading || otp.length < 6} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              {loading ? "확인 중..." : "인증하기"}
            </button>
            <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(""); }} className="text-xs text-text-muted hover:text-primary-400 transition-colors text-center">
              이메일 다시 입력
            </button>
          </form>
        )}

        {step === "profile" && (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">닉네임과 비밀번호를 설정해주세요.</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setNicknameStatus("idle"); }}
                required
                className={`flex-1 px-4 py-3 text-sm border rounded-xl focus:outline-none text-text-primary placeholder:text-text-muted transition-colors ${
                  nicknameStatus === "ok" ? "border-green-400" :
                  nicknameStatus === "taken" ? "border-red-400" :
                  "border-gray-200 focus:border-primary-400"
                }`}
              />
              <button type="button" onClick={handleCheckNickname} disabled={!nickname.trim() || nicknameStatus === "checking"} className="px-3 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-xl disabled:opacity-40 whitespace-nowrap">
                중복확인
              </button>
            </div>
            {nicknameStatus === "ok" && <p className="text-xs text-green-500 -mt-1">사용 가능한 닉네임이에요.</p>}
            {nicknameStatus === "taken" && <p className="text-xs text-red-500 -mt-1">이미 사용 중인 닉네임이에요.</p>}
            <input
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 mt-1">
              {loading ? "저장 중..." : "가입 완료"}
            </button>
          </form>
        )}

        <button onClick={() => { onClose(); onLogin(); }} className="text-xs text-text-muted hover:text-primary-400 transition-colors text-center">
          이미 계정이 있어요 → 로그인
        </button>
      </div>
    </div>
  );
}
