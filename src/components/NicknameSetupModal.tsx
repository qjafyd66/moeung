"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function NicknameSetupModal() {
  const { user, checkNickname, saveProfile, setNeedsNickname } = useAuth();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "taken" | "checking">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!nickname.trim()) return;
    setStatus("checking");
    const taken = await checkNickname(nickname.trim());
    setStatus(taken ? "taken" : "ok");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "ok") { setError("닉네임 중복 확인을 해주세요."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 해요."); return; }
    if (!user) return;
    setLoading(true);
    setError("");
    const err = await saveProfile(user.id, nickname.trim());
    if (err) { setError(err); setLoading(false); return; }
    if (password) supabase.auth.updateUser({ password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary">닉네임 설정</h2>
          <p className="text-xs text-text-muted mt-1">모응에서 사용할 닉네임과 비밀번호를 설정해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="닉네임 입력"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); setStatus("idle"); setError(""); }}
              required
              className={`flex-1 px-4 py-3 text-sm border rounded-xl focus:outline-none text-text-primary placeholder:text-text-muted transition-colors ${
                status === "ok" ? "border-green-400" :
                status === "taken" ? "border-red-400" :
                "border-gray-200 focus:border-primary-400"
              }`}
            />
            <button
              type="button"
              onClick={handleCheck}
              disabled={!nickname.trim() || status === "checking"}
              className="px-3 py-3 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-xl transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              중복확인
            </button>
          </div>
          {status === "ok" && <p className="text-xs text-green-500 -mt-1">사용 가능한 닉네임이에요.</p>}
          {status === "taken" && <p className="text-xs text-red-500 -mt-1">이미 사용 중인 닉네임이에요.</p>}

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
            disabled={loading || status !== "ok"}
            className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? "저장 중..." : "시작하기"}
          </button>
        </form>

        <button
          onClick={() => setNeedsNickname(false)}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors text-center"
        >
          나중에 설정할게요
        </button>
      </div>
    </div>
  );
}
