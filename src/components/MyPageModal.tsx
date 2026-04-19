"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type Props = { onClose: () => void };
type View = "main" | "settings";

function SettingRow({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-1 py-3 text-sm text-text-primary hover:bg-gray-50 rounded-lg transition-colors"
    >
      <span>{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-text-muted">{value}</span>}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </button>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <p className="text-[11px] text-text-muted font-semibold mt-3 mb-1 px-1">{children}</p>;
}

export default function MyPageModal({ onClose }: Props) {
  const { user, profile, signOut, checkNickname, saveProfile } = useAuth();
  const [view, setView] = useState<View>("main");
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(profile?.nickname ?? "");
  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "ok" | "taken" | "checking">("idle");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isPhoneUser = user?.email?.endsWith("@moeung.kr");
  const loginMethod = user?.app_metadata?.provider === "kakao" ? "카카오" : "휴대폰";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {view === "settings" && (
              <button onClick={() => { setView("main"); setShowDeleteConfirm(false); }} className="text-text-muted hover:text-text-secondary transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
            )}
            <h2 className="text-lg font-extrabold text-text-primary">
              {view === "main" ? "마이페이지" : "설정"}
            </h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {view === "main" && (
          <>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">아이디</span>
              </div>
                  <p className="text-sm font-semibold text-text-primary">{profile?.nickname ?? "-"}</p>
              <div className="h-px bg-gray-200 my-1" />
              <span className="text-xs text-text-muted">{isPhoneUser ? "휴대폰" : "이메일"}</span>
              <p className="text-sm text-text-primary">{(profile as any)?.phone ?? user?.email ?? "-"}</p>
              <div className="h-px bg-gray-200 my-1" />
              <span className="text-xs text-text-muted">로그인 방법</span>
              <p className="text-sm text-text-primary">{loginMethod}</p>
            </div>

            <button onClick={handleSignOut} className="w-full py-3 border border-gray-200 text-text-secondary text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              로그아웃
            </button>
            <button onClick={() => setView("settings")} className="text-xs text-text-muted hover:text-text-secondary transition-colors text-center">
              설정
            </button>
          </>
        )}

        {view === "settings" && (
          <div className="flex flex-col">
            <SectionLabel>알림</SectionLabel>
            <SettingRow label="알림 설정" />

            <SectionLabel>고객지원</SectionLabel>
            <SettingRow label="공지사항" />
            <SettingRow label="자주 묻는 질문" />
            <SettingRow label="고객센터 문의" />

            <SectionLabel>약관 및 정책</SectionLabel>
            <SettingRow label="이용약관" />
            <SettingRow label="개인정보처리방침" />

            <SectionLabel>앱 정보</SectionLabel>
            <SettingRow label="버전 정보" value="v0.1.0" />

            <div className="h-px bg-gray-100 my-3" />

            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="text-xs text-gray-300 hover:text-gray-400 transition-colors text-left px-1 py-2">
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
        )}
      </div>
    </div>
  );
}
