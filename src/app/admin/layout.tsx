"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_PASSWORD = "moeung2026";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (sessionStorage.getItem("isAdmin") === "true") setIsAuth(true);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("isAdmin", "true");
      setIsAuth(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    setIsAuth(false);
    setPassword("");
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md border border-primary-100 p-8 w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-sm leading-none">M</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-text-primary">모응 관리자</h1>
              <p className="text-[11px] text-text-secondary mt-0.5">관리자만 접근 가능합니다</p>
            </div>
          </div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className={`w-full px-3 py-2 text-sm border border-primary-100 rounded-xl focus:outline-none focus:border-primary-400 bg-white text-text-primary placeholder:text-text-muted transition-colors${pwError ? " !border-red-400" : ""}`}
          />
          {pwError && <p className="text-xs text-red-500 mt-1.5">비밀번호가 올바르지 않습니다.</p>}
          <button
            onClick={handleLogin}
            className="w-full mt-4 bg-primary-400 hover:bg-primary-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "이벤트 관리" },
    { href: "/admin/crawl", label: "크롤링 대기" },
  ];

  return (
    <div className="min-h-screen bg-bg-main">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-extrabold text-xs leading-none">M</span>
              </div>
              <span className="text-sm font-extrabold text-text-primary">모응 관리자</span>
            </div>
            <nav className="flex gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary-100 text-primary-600"
                        : "text-text-secondary hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-text-muted hover:text-primary-400 transition-colors">
              ← 메인으로
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-text-secondary hover:border-gray-300 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
