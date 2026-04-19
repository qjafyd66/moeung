"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function PhoneSetupModal() {
  const { user, setNeedsPhone } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length < 10) { setError("올바른 전화번호를 입력해주세요."); return; }
    setLoading(true);
    setError("");

    const { data: existing } = await supabase.from("profiles").select("id").eq("phone", phone).single();
    if (existing) { setError("이미 다른 계정에 등록된 번호예요."); setLoading(false); return; }

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/verify-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }

    await supabase.from("profiles").update({ phone }).eq("id", user!.id);
    setNeedsPhone(false);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary">휴대폰 번호 인증</h2>
          <p className="text-xs text-text-muted mt-1">서비스 이용을 위해 휴대폰 번호를 인증해주세요.</p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="010XXXXXXXX"
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 11)); setOtpSent(false); setOtp(""); setError(""); }}
              disabled={otpSent}
              className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted disabled:bg-gray-50"
            />
            <button type="button" onClick={handleSendOtp} disabled={loading || phone.length < 10 || otpSent} className="w-24 flex-shrink-0 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-xl disabled:opacity-40 whitespace-nowrap">
              {otpSent ? "전송됨" : loading ? "전송 중..." : "인증번호 받기"}
            </button>
          </div>

          {otpSent && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="인증번호 6자리"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                maxLength={6}
                className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted tracking-widest text-center font-semibold"
              />
              <button type="submit" disabled={loading || otp.length < 6} className="w-24 flex-shrink-0 text-xs font-semibold bg-primary-400 hover:bg-primary-500 text-white rounded-xl disabled:opacity-40 whitespace-nowrap">
                {loading ? "확인 중..." : "확인"}
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          {!otpSent && (
            <button type="button" onClick={handleSendOtp} disabled={loading || phone.length < 10} className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              {loading ? "전송 중..." : "인증번호 받기"}
            </button>
          )}
        </form>

      </div>
    </div>
  );
}
