"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type Props = { onClose: () => void };

export default function MyPageModal({ onClose }: Props) {
  const { user, profile, signOut, checkNickname, saveProfile } = useAuth();
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(profile?.nickname ?? "");
  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "ok" | "taken" | "checking">("idle");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCheckNickname = async () => {
    if (!newNickname.trim() || newNickname === profile?.nickname) return;
    setNicknameStatus("checking");
    const taken = await checkNickname(newNickname.trim());
    setNicknameStatus(taken ? "taken" : "ok");
  };

  const handleSaveNickname = async () => {
    if (!user) return;
    if (newNickname === profile?.nickname) { setEditingNickname(false); return; }
    if (nicknameStatus !== "ok") return;
    setSaving(true);
    await supabase.from("profiles").update({ nickname: newNickname.trim() }).eq("id", user.id);
    await saveProfile(user.id, newNickname.trim());
    setEditingNickname(false);
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleDeleteAccount = async () => {
    await supabase.rpc("delete_user");
    await signOut();
    onClose();
  };

  const loginMethod = user?.app_metadata?.provider === "kakao" ? "카카오" : "이메일";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-text-primary">마이페이지</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 프로필 정보 */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">닉네임</span>
            {!editingNickname && (
              <button onClick={() => { setEditingNickname(true); setNewNickname(profile?.nickname ?? ""); setNicknameStatus("idle"); }} className="text-xs text-primary-400 hover:text-primary-500 font-semibold">
                변경
              </button>
            )}
          </div>
          {editingNickname ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => { setNewNickname(e.target.value); setNicknameStatus("idle"); }}
                  className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none ${nicknameStatus === "ok" ? "border-green-400" : nicknameStatus === "taken" ? "border-red-400" : "border-gray-200 focus:border-primary-400"}`}
                />
                <button onClick={handleCheckNickname} disabled={nicknameStatus === "checking"} className="px-2 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-lg whitespace-nowrap disabled:opacity-40">
                  중복확인
                </button>
              </div>
              {nicknameStatus === "ok" && <p className="text-xs text-green-500">사용 가능한 닉네임이에요.</p>}
              {nicknameStatus === "taken" && <p className="text-xs text-red-500">이미 사용 중인 닉네임이에요.</p>}
              <div className="flex gap-2">
                <button onClick={() => setEditingNickname(false)} className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-text-secondary hover:bg-gray-50">취소</button>
                <button onClick={handleSaveNickname} disabled={saving || nicknameStatus !== "ok"} className="flex-1 py-1.5 text-xs bg-primary-400 text-white rounded-lg hover:bg-primary-500 disabled:opacity-40">
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold text-text-primary">{profile?.nickname ?? "-"}</p>
          )}

          <div className="h-px bg-gray-200 my-1" />

          <span className="text-xs text-text-muted">이메일</span>
          <p className="text-sm text-text-primary">{user?.email ?? "-"}</p>

          <div className="h-px bg-gray-200 my-1" />

          <span className="text-xs text-text-muted">로그인 방법</span>
          <p className="text-sm text-text-primary">{loginMethod}</p>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 border border-gray-200 text-text-secondary text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          로그아웃
        </button>

        {/* 회원탈퇴 */}
        <div className="text-center">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="text-[11px] text-gray-300 hover:text-gray-400 transition-colors">
              회원탈퇴
            </button>
          ) : (
            <div className="flex flex-col gap-2 p-3 bg-red-50 rounded-xl">
              <p className="text-xs text-red-500 font-semibold">정말 탈퇴하시겠어요?</p>
              <p className="text-[11px] text-text-muted">탈퇴 시 모든 정보가 삭제되며 복구할 수 없어요.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-text-secondary hover:bg-white">취소</button>
                <button onClick={handleDeleteAccount} className="flex-1 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600">탈퇴</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
