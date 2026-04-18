"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/context/EventsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { events, clicks, categories, recordClick, recordView } = useEvents();
  const { user, signInWithKakao, signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("deadline");
  const [rankIndex, setRankIndex] = useState(0);
  const [rankOpen, setRankOpen] = useState(false);

  const isDiscovery = !activeCategory;

  const popularBrands = [
    ...new Map(
      events
        .map((e) => ({ brand: e.brand, count: clicks[e.id] ?? 0 }))
        .sort((a, b) => b.count - a.count)
        .map((x) => [x.brand, x])
    ).values(),
  ]
    .slice(0, 8)
    .map((x) => x.brand);

  useEffect(() => {
    if (popularBrands.length <= 1) return;
    const timer = setInterval(() => {
      setRankIndex((i) => (i + 1) % popularBrands.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [popularBrands.length]);


  const goHome = () => {
    setActiveCategory(null);
    setSearchQuery("");
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = [...events]
    .filter((e) => {
      // 마감일이 있고 오늘보다 이전이면 숨김 (데이터는 보존)
      if (e.deadline && new Date(e.deadline) < today) return false;
      if (activeCategory && e.category !== activeCategory) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return e.brand.toLowerCase().includes(q) || e.title.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortOrder === "latest") return b.id - a.id;
      if (sortOrder === "popular") return (clicks[b.id] ?? 0) - (clicks[a.id] ?? 0);
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  useEffect(() => {
    if (searchQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      supabase.from("search_logs").insert({
        query: searchQuery.trim(),
        result_count: filtered.length,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchQuery, filtered.length]);

  return (
    <div className="min-h-screen bg-bg-main">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* 뒤로가기 버튼 (목록 화면에서만) */}
          {(!isDiscovery || searchQuery) && (
            <button
              onClick={goHome}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-text-secondary flex-shrink-0"
              aria-label="뒤로가기"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}

          {/* 로고 + 이름 */}
          <button onClick={goHome} className="flex items-center gap-1.5">
            <Image src="/logo.png" alt="모응 로고" width={42} height={42} className="rounded-xl" />
            <h1 className="text-xl font-extrabold text-primary-400 leading-tight tracking-tight">모응</h1>
          </button>

          {/* 우측 버튼 */}
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary hidden sm:block">
                  {user.user_metadata?.name ?? user.email ?? "카카오 유저"}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithKakao}
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-[#FEE500] text-[#191919] hover:bg-[#F5DC00] transition-colors flex items-center gap-1.5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#191919"><path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.61 5.08 4.04 6.54L5.1 21l4.3-2.84c.85.15 1.71.24 2.6.24 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/></svg>
                카카오 로그인
              </button>
            )}
            <button className="text-sm font-semibold px-4 py-2 rounded-xl bg-primary-400 text-white hover:bg-primary-500 transition-colors">
              앱 다운로드
            </button>
          </div>
        </div>
      </header>

      {isDiscovery ? (
        /* ── 디스커버리(랜딩) 화면 ── */
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">
          {/* 히어로 문구 */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
              이벤트를 한곳에 <span className="text-primary-400">모응</span>
            </h2>
          </div>

          {/* 검색 */}
          <div className="mb-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">🔍</span>
              <input
                type="text"
                placeholder="브랜드나 이벤트를 입력해 주세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-sm bg-white border border-primary-100 rounded-2xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted transition-colors shadow-sm"
              />
            </div>
          </div>

          {searchQuery ? (
            /* 검색 결과 */
            <div>
              <p className="text-xs text-text-muted mb-3">
                &ldquo;{searchQuery}&rdquo; 검색 결과 {filtered.length}개
              </p>
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-text-muted text-sm">검색 결과가 없습니다.</div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  {filtered.map((event) => (
                    <EventCard key={event.id} event={event} onClickApply={() => recordClick(event.id)} onClickView={() => recordView(event.id)} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 인기 순위 롤링 + 클릭/hover 전체 목록 */}
              {popularBrands.length > 0 && (
                <div className="relative mb-8">
                  {/* 롤링 바 */}
                  <button
                    onClick={() => setRankOpen((o) => !o)}
                    className={`flex items-center gap-3 bg-white rounded-2xl border shadow-sm px-4 py-3 w-full transition-colors overflow-hidden ${rankOpen ? "border-primary-200" : "border-gray-100 hover:border-primary-200"}`}
                  >
                    <span className="text-xs font-bold text-primary-400 flex-shrink-0">인기 순위</span>
                    <span className="w-px h-4 bg-gray-200 flex-shrink-0" />
                    <span className={`text-xs font-extrabold flex-shrink-0 ${
                      rankIndex === 0 ? "text-yellow-400" :
                      rankIndex === 1 ? "text-sky-400" :
                      rankIndex === 2 ? "text-orange-400" :
                      "text-gray-300"
                    }`}>
                      {rankIndex + 1}위
                    </span>
                    <span key={rankIndex} className="text-sm font-semibold text-text-primary flex-1 text-left animate-slide-up">
                      {popularBrands[rankIndex]}
                    </span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-text-muted flex-shrink-0 transition-transform duration-150 ${rankOpen ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {/* 클릭 시 전체 목록 */}
                  {rankOpen && (
                    <>
                    <div className="fixed inset-0 z-10" onClick={() => setRankOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-primary-100 shadow-lg overflow-hidden z-20">
                      {popularBrands.map((brand, i) => (
                        <button
                          key={brand}
                          onClick={() => { setSearchQuery(brand); setRankOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-b-0 text-left ${i === rankIndex ? "bg-primary-50" : ""}`}
                        >
                          <span className={`text-xs font-extrabold w-6 flex-shrink-0 ${
                            i === 0 ? "text-yellow-400" :
                            i === 1 ? "text-sky-400" :
                            i === 2 ? "text-orange-400" :
                            "text-gray-300"
                          }`}>
                            {i + 1}위
                          </span>
                          <span className="text-sm font-medium text-text-primary flex-1">{brand}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted flex-shrink-0">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                    </>
                  )}
                </div>
              )}

              {/* 카테고리 카드 */}
              <h2 className="text-sm font-bold text-text-primary mb-3">카테고리</h2>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="bg-white rounded-2xl p-5 flex flex-col gap-2 border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left shadow-sm"
                  >
                    <div className="text-sm font-bold text-text-primary">{cat.label}</div>
                    <div className="text-[11px] text-text-muted">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── 이벤트 목록 화면 ── */
        <>
          {/* 카테고리 탭 */}
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-3xl mx-auto px-4">
              <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full font-medium transition-colors duration-150 ${
                    !activeCategory
                      ? "bg-primary-400 text-white"
                      : "bg-white text-text-secondary border border-gray-200 hover:border-primary-200"
                  }`}
                >
                  전체
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full font-medium transition-colors duration-150 ${
                      activeCategory === cat.id
                        ? "bg-primary-400 text-white"
                        : "bg-white text-text-secondary border border-gray-200 hover:border-primary-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 검색 & 정렬 */}
          <div className="max-w-3xl mx-auto px-4 pt-4 pb-2 flex gap-3 items-center">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">🔍</span>
              <input
                type="text"
                placeholder="브랜드나 이벤트를 입력해 주세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-primary-100 rounded-xl focus:outline-none focus:border-primary-400 text-text-primary placeholder:text-text-muted transition-colors"
              />
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-sm text-text-secondary bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="deadline">마감 임박순</option>
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
            </select>
          </div>

          {/* 이벤트 그리드 */}
          <main className="max-w-3xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClickApply={() => recordClick(event.id)}
                  onClickView={() => recordView(event.id)}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-text-muted text-sm">
                검색 결과가 없습니다.
              </div>
            )}
          </main>
        </>
      )}

      <footer className="text-center py-8 text-xs text-text-muted">
        © 2026 모응. 내 다음 차를 먼저 만나다.
      </footer>
    </div>
  );
}
