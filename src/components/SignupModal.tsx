"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import LegalModal from "./LegalModal";

type Props = {
  onClose: () => void;
  onLogin: () => void;
  onSuccess?: () => void;
};

export default function SignupModal({ onClose, onLogin, onSuccess }: Props) {
  const { checkNickname, saveProfile, setNeedsNickname } = useAuth();

  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | "location" | "marketing" | null>(null);
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "ok" | "taken" | "checking">("idle");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) { setError("올바른 전화번호를 입력해주세요."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    setError("");

    const verifyRes = await fetch("/api/verify-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) { setError(verifyData.error); setLoading(false); return; }

    const signupRes = await fetch("/api/phone-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) { setError(signupData.error); setLoading(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: signupData.email,
      password: signupData.tempPass,
    });
    if (signInError) { setError("로그인에 실패했어요. 다시 시도해주세요."); setLoading(false); return; }

    setUserId(signupData.userId);
    setNeedsNickname(false);
    setOtpVerified(true);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) { setError("휴대폰 인증을 완료해주세요."); return; }
    if (usernameStatus !== "ok") { setError("아이디 중복 확인을 해주세요."); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { setError("아이디는 영문, 숫자, _만 사용 가능해요. (3~20자)"); return; }
    const pwValid = password.length >= 6 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    if (!pwValid) { setError("비밀번호는 6자 이상, 영문+숫자 조합이어야 해요."); return; }
    if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않아요."); return; }
    if (!userId) { setError("인증 정보를 찾을 수 없어요."); return; }
    setLoading(true);
    setError("");

    const err = await saveProfile(userId, username.trim());
    if (err) { setError(err); setLoading(false); return; }

    await supabase.from("profiles").update({ phone }).eq("id", userId);

    await fetch("/api/set-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, username: username.trim() }),
    });

    supabase.auth.updateUser({ password });

    setLoading(false);
    onClose();
    onSuccess?.();
  };

  // 약관 동의 화면
  if (!termsConfirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-text-primary">회원가입</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <p className="text-xs text-text-muted">모응 서비스 이용을 위해 약관에 동의해주세요.</p>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={agreeAll} onChange={(e) => handleAgreeAll(e.target.checked)} className="w-4 h-4 accent-primary-400" />
            <span className="text-sm font-bold text-text-primary">전체 동의</span>
          </label>
          <div className="flex flex-col gap-3 px-1">
            {[
              { label: "[필수] 이용약관", checked: agreeTerms, setter: setAgreeTerms, type: "terms" as const },
              { label: "[필수] 개인정보처리방침", checked: agreePrivacy, setter: setAgreePrivacy, type: "privacy" as const },
              { label: "[선택] 마케팅 정보 수신 동의", checked: agreeMarketing, setter: setAgreeMarketing, type: "marketing" as const },
            ].map(({ label, checked, setter, type }) => (
              <label key={type} className="flex items-center justify-between gap-3 cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={checked} onChange={(e) => { setter(e.target.checked); if (!e.target.checked) setAgreeAll(false); }} className="w-4 h-4 accent-primary-400" />
                  <span className="text-sm text-text-primary">{label}</span>
                </div>
                <button type="button" onClick={() => setLegalModal(type)} className="text-xs text-text-muted underline flex-shrink-0">보기</button>
              </label>
            ))}
          </div>
          <button type="button" disabled={!agreeTerms || !agreePrivacy} onClick={() => setTermsConfirmed(true)} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
            다음
          </button>
          <button onClick={() => { onClose(); onLogin(); }} className="text-xs text-text-muted hover:text-primary-400 transition-colors text-center">
            이미 계정이 있어요 → 로그인
          </button>
          {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
        </div>
      </div>
    );
  }

  // 가입 정보 입력 화면 (모든 필드 한번에)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-4 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-text-primary">회원가입</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* 휴대폰 번호 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-text-primary">휴대폰 번호</label>
              {otpVerified && <span className="text-xs text-green-500 font-semibold">✓ 인증완료</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="010XXXXXXXX"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 11)); setOtpSent(false); setOtpVerified(false); setOtp(""); setError(""); }}
                disabled={otpVerified}
                className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted disabled:bg-gray-50"
              />
              <button type="button" onClick={handleSendOtp} disabled={loading || phone.length < 10 || otpVerified} className="w-20 flex-shrink-0 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-xl disabled:opacity-40 whitespace-nowrap">
                {otpSent && !otpVerified ? "재전송" : "인증번호 받기"}
              </button>
            </div>
          </div>

          {/* 인증번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">인증번호</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="6자리 입력"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                maxLength={6}
                disabled={!otpSent || otpVerified}
                className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted tracking-widest text-center font-semibold disabled:bg-gray-50"
              />
              <button type="button" onClick={handleVerifyOtp} disabled={loading || otp.length < 6 || otpVerified} className="w-20 flex-shrink-0 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-xl disabled:opacity-40 whitespace-nowrap">
                {loading ? "확인 중..." : "확인"}
              </button>
            </div>
          </div>

          {/* 아이디 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">아이디</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="영문, 숫자, _ (3~20자)"
                value={username}
                onChange={(e) => { setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "")); setUsernameStatus("idle"); }}
                className={`flex-1 px-4 py-3 text-sm border rounded-xl focus:outline-none text-text-primary placeholder:text-text-muted transition-colors ${
                  usernameStatus === "ok" ? "border-green-400" :
                  usernameStatus === "taken" ? "border-red-400" :
                  "border-gray-200 focus:border-primary-400"
                }`}
              />
              <button type="button" onClick={async () => {
                if (!username.trim()) return;
                setUsernameStatus("checking");
                const taken = await checkNickname(username.trim());
                setUsernameStatus(taken ? "taken" : "ok");
              }} disabled={!username.trim() || usernameStatus === "checking"} className="w-20 flex-shrink-0 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-xl disabled:opacity-40 whitespace-nowrap">
                중복확인
              </button>
            </div>
            {usernameStatus === "ok" && <p className="text-xs text-green-500">사용 가능한 아이디예요.</p>}
            {usernameStatus === "taken" && <p className="text-xs text-red-500">이미 사용 중인 아이디예요.</p>}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">비밀번호</label>
            <input
              type="password"
              placeholder="영문+숫자 6자 이상"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">비밀번호 확인</label>
            <input
              type="password"
              placeholder="비밀번호 재입력"
              value={passwordConfirm}
              onChange={(e) => { setPasswordConfirm(e.target.value); setError(""); }}
              className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none text-text-primary placeholder:text-text-muted transition-colors ${
                passwordConfirm && password !== passwordConfirm ? "border-red-400" :
                passwordConfirm && password === passwordConfirm ? "border-green-400" :
                "border-gray-200 focus:border-primary-400"
              }`}
            />
            {passwordConfirm && password !== passwordConfirm && <p className="text-xs text-red-500">비밀번호가 일치하지 않아요.</p>}
            {passwordConfirm && password === passwordConfirm && <p className="text-xs text-green-500">비밀번호가 일치해요.</p>}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
            {loading ? "처리 중..." : "가입 완료"}
          </button>
        </form>

        <button onClick={() => { onClose(); onLogin(); }} className="text-xs text-text-muted hover:text-primary-400 transition-colors text-center">
          이미 계정이 있어요 → 로그인
        </button>
      </div>
    </div>
  );
}
