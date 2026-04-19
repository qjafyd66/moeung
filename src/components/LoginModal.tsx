"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type Props = {
  onClose: () => void;
  onSignUp: () => void;
};

type View = "login" | "reset-phone" | "reset-otp" | "reset-password" | "social-terms" | "social-phone" | "social-otp";

export default function LoginModal({ onClose, onSignUp }: Props) {
  const { signInWithEmail, signInWithKakao, signInWithGoogle } = useAuth();
  const [view, setView] = useState<View>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [resetPhone, setResetPhone] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [socialProvider, setSocialProvider] = useState<"kakao" | "google" | null>(null);
  const [socialPhone, setSocialPhone] = useState("");
  const [socialOtp, setSocialOtp] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const allRequired = agreeTerms && agreePrivacy;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const email = `${username}@moeung.kr`;
    const err = await signInWithEmail(email, password);
    if (err) setError("아이디 또는 비밀번호가 올바르지 않아요.");
    else onClose();
    setLoading(false);
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPhone.length < 10) { setError("올바른 전화번호를 입력해주세요."); return; }
    setLoading(true);
    setError("");
    const { data: profile } = await supabase.from("profiles").select("id").eq("phone", resetPhone).single();
    if (!profile) { setError("가입된 번호가 없어요."); setLoading(false); return; }
    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: resetPhone }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setView("reset-otp");
    setLoading(false);
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtp.length < 6) return;
    setView("reset-password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwValid = newPassword.length >= 6 && /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
    if (!pwValid) { setError("비밀번호는 6자 이상, 영문+숫자 조합이어야 해요."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: resetPhone, otp: resetOtp, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setLoading(false);
    setView("login");
    setError("");
    alert("비밀번호가 변경됐어요. 새 비밀번호로 로그인해주세요.");
  };

  const handleSocialClick = (provider: "kakao" | "google") => {
    setSocialProvider(provider);
    setSocialPhone("");
    setSocialOtp("");
    setAgreeTerms(false);
    setAgreePrivacy(false);
    setAgreeMarketing(false);
    setError("");
    setView("social-terms");
  };

  const handleSendSocialOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (socialPhone.length < 10) { setError("올바른 전화번호를 입력해주세요."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: socialPhone }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setView("social-otp");
    setLoading(false);
  };

  const handleVerifySocialOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/verify-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: socialPhone, otp: socialOtp }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    localStorage.setItem("pendingPhone", socialPhone);
    if (socialProvider === "kakao") await signInWithKakao();
    else await signInWithGoogle();
    setLoading(false);
  };

  const goBack = () => {
    setError("");
    if (view === "reset-phone") setView("login");
    else if (view === "reset-otp") setView("reset-phone");
    else if (view === "reset-password") setView("reset-otp");
    else if (view === "social-terms") setView("login");
    else if (view === "social-phone") setView("social-terms");
    else if (view === "social-otp") setView("social-phone");
  };

  const title =
    view === "login" ? "로그인" :
    view === "social-terms" ? "약관 동의" :
    view === "social-phone" || view === "social-otp" ? "휴대폰 인증" :
    "비밀번호 찾기";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {view !== "login" && (
              <button onClick={goBack} className="text-text-muted hover:text-text-secondary transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
            )}
            <h2 className="text-lg font-extrabold text-text-primary">{title}</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 로그인 */}
        {view === "login" && (
          <>
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="아이디"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
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
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 accent-primary-400" />
                  <span className="text-xs text-text-secondary">로그인 상태 유지</span>
                </label>
                <button type="button" onClick={() => { setView("reset-phone"); setError(""); }} className="text-xs text-text-muted hover:text-primary-400 transition-colors">
                  비밀번호 찾기
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-text-muted">또는</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button onClick={() => handleSocialClick("kakao")} className="w-full py-3 bg-[#FEE500] hover:bg-[#F5DC00] text-[#191919] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919"><path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.61 5.08 4.04 6.54L5.1 21l4.3-2.84c.85.15 1.71.24 2.6.24 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/></svg>
              카카오로 로그인
            </button>
            <button onClick={() => handleSocialClick("google")} className="w-full py-3 bg-white hover:bg-gray-50 text-[#3c4043] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google로 로그인
            </button>

            <button onClick={() => { onClose(); onSignUp(); }} className="w-full py-3 border border-gray-200 text-text-secondary text-sm font-semibold rounded-xl hover:border-primary-300 hover:text-primary-400 transition-colors">
              회원가입하기
            </button>
          </>
        )}

        {/* 소셜 로그인 - 약관 동의 */}
        {view === "social-terms" && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-text-muted">
              {socialProvider === "kakao" ? "카카오" : "Google"} 계정으로 모응에 가입합니다.<br />
              아래 약관에 동의해주세요.
            </p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={agreeTerms && agreePrivacy && agreeMarketing}
                  onChange={(e) => { setAgreeTerms(e.target.checked); setAgreePrivacy(e.target.checked); setAgreeMarketing(e.target.checked); }}
                  className="w-4 h-4 accent-primary-400"
                />
                <span className="text-sm font-bold text-text-primary">전체 동의</span>
              </label>
              <div className="h-px bg-gray-100" />
              <label className="flex items-center gap-2 cursor-pointer px-1">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-4 h-4 accent-primary-400" />
                <span className="text-xs text-text-primary flex-1">[필수] 이용약관 동의</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-1">
                <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} className="w-4 h-4 accent-primary-400" />
                <span className="text-xs text-text-primary flex-1">[필수] 개인정보처리방침 동의</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-1">
                <input type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} className="w-4 h-4 accent-primary-400" />
                <span className="text-xs text-text-secondary flex-1">[선택] 마케팅 정보 수신 동의</span>
              </label>
            </div>
            <button
              onClick={() => { if (allRequired) setView("social-phone"); }}
              disabled={!allRequired}
              className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}

        {/* 소셜 로그인 - 전화번호 입력 */}
        {view === "social-phone" && (
          <form onSubmit={handleSendSocialOtp} className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">
              {socialProvider === "kakao" ? "카카오" : "Google"} 로그인 전에 휴대폰 번호를 인증해주세요.
            </p>
            <input
              type="tel"
              placeholder="010XXXXXXXX"
              value={socialPhone}
              onChange={(e) => { setSocialPhone(e.target.value.replace(/\D/g, "").slice(0, 11)); setError(""); }}
              required
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading || socialPhone.length < 10} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              {loading ? "전송 중..." : "인증번호 받기"}
            </button>
          </form>
        )}

        {/* 소셜 로그인 - OTP 입력 */}
        {view === "social-otp" && (
          <form onSubmit={handleVerifySocialOtp} className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">
              <span className="font-semibold text-primary-400">{socialPhone}</span>으로 전송된 6자리 코드를 입력해주세요.
            </p>
            <input
              type="text"
              placeholder="인증코드 6자리"
              value={socialOtp}
              onChange={(e) => { setSocialOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              maxLength={6}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted tracking-widest text-center text-lg font-semibold"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading || socialOtp.length < 6} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              {loading ? "확인 중..." : "확인 후 로그인"}
            </button>
          </form>
        )}

        {/* 비밀번호 찾기 - 전화번호 입력 */}
        {view === "reset-phone" && (
          <form onSubmit={handleSendResetOtp} className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">가입 시 등록한 휴대폰 번호를 입력해주세요.</p>
            <input
              type="tel"
              placeholder="010XXXXXXXX"
              value={resetPhone}
              onChange={(e) => { setResetPhone(e.target.value.replace(/\D/g, "").slice(0, 11)); setError(""); }}
              required
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading || resetPhone.length < 10} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              {loading ? "전송 중..." : "인증번호 받기"}
            </button>
          </form>
        )}

        {/* 비밀번호 찾기 - OTP 입력 */}
        {view === "reset-otp" && (
          <form onSubmit={handleVerifyResetOtp} className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">
              <span className="font-semibold text-primary-400">{resetPhone}</span>으로 전송된 6자리 코드를 입력해주세요.
            </p>
            <input
              type="text"
              placeholder="인증코드 6자리"
              value={resetOtp}
              onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted tracking-widest text-center text-lg font-semibold"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={resetOtp.length < 6} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              확인
            </button>
          </form>
        )}

        {/* 비밀번호 찾기 - 새 비밀번호 입력 */}
        {view === "reset-password" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">새로운 비밀번호를 입력해주세요.</p>
            <input
              type="password"
              placeholder="비밀번호 (영문+숫자 6자 이상)"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
              required
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
