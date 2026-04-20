"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useEvents } from "@/context/EventsContext";
import type { CategoryConfig } from "@/context/EventsContext";
import { Event, EventCategory, EventType } from "@/data/events";
import { BRANDS, getBrandsByCategory } from "@/data/brands";

const ADMIN_PASSWORD = "moeung2026";
const CUSTOM_BRAND = "__custom__";

type FormData = Omit<Event, "id">;
type RightTab = "active" | "expired" | "categories" | "crawl";

type CrawlItem = {
  id: number;
  brand: string;
  brand_color: string;
  category: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  source_url: string;
  start_date: string;
  deadline: string;
  event_type: string;
  crawled_at: string;
};

const emptyForm: FormData = {
  category: "car",
  brand: "",
  brandColor: "#A78BFA",
  title: "",
  description: "",
  startDate: "",
  deadline: "",
  participationMethod: "",
  link: "",
  eventType: "시승",
};

function getDDayBadge(deadline: string, startDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!deadline) return { label: "미정", cls: "bg-gray-100 text-gray-500" };
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    if (start > today) {
      const days = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { label: `${days}일 후 시작`, cls: "bg-primary-50 text-primary-500" };
    }
  }
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "마감", cls: "bg-gray-100 text-gray-400" };
  if (diff === 0) return { label: "D-Day", cls: "bg-danger text-white" };
  if (diff <= 1) return { label: "D-1", cls: "bg-danger text-white" };
  if (diff <= 3) return { label: `D-${diff}`, cls: "bg-warning text-white" };
  return { label: `D-${diff}`, cls: "bg-primary-100 text-primary-600" };
}


function EventRow({
  event,
  editingId,
  onEdit,
  onDelete,
}: {
  event: Event;
  editingId: number | null;
  onEdit: (e: Event) => void;
  onDelete: (id: number) => void;
}) {
  const { label, cls } = getDDayBadge(event.deadline, event.startDate);
  const isEditing = editingId === event.id;
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        isEditing ? "border-primary-300 bg-primary-50" : "border-gray-100 hover:border-primary-100"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {event.brand}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
          <span className="text-[11px] text-text-muted bg-gray-50 px-2 py-0.5 rounded-full">
            {event.eventType}
          </span>
        </div>
        <p className="text-sm font-semibold text-text-primary truncate">{event.title}</p>
        <p className="text-xs text-text-muted mt-0.5">
          {event.startDate ? `${event.startDate} ~ ` : ""}
          {event.deadline || "마감일 미정"}
        </p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => onEdit(event)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          수정
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomEventType, setIsCustomEventType] = useState(false);
  const [deadlineTBD, setDeadlineTBD] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [newCategory, setNewCategory] = useState({ label: "", desc: "" });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [crawlQueue, setCrawlQueue] = useState<CrawlItem[]>([]);
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [crawlRunning, setCrawlRunning] = useState(false);
  const { events, categories, addEvent, updateEvent, deleteEvent, addCategory, updateCategory, deleteCategory, reorderCategories, refreshEvents } = useEvents();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (sessionStorage.getItem("isAdmin") === "true") setIsAuth(true);
  }, []);

  const fetchCrawlQueue = async () => {
    setCrawlLoading(true);
    const res = await fetch("/api/crawl/queue");
    const data = await res.json();
    setCrawlQueue(Array.isArray(data) ? data : []);
    setCrawlLoading(false);
  };

  const handleRunCrawler = async () => {
    setCrawlRunning(true);
    await fetch("/api/crawl/run", { method: "POST" });
    await fetchCrawlQueue();
    setCrawlRunning(false);
  };

  const handleApprove = async (id: number) => {
    await fetch("/api/crawl/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCrawlQueue((prev) => prev.filter((item) => item.id !== id));
    await refreshEvents();
  };

  const handleReject = async (id: number) => {
    await fetch("/api/crawl/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCrawlQueue((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (rightTab === "crawl") fetchCrawlQueue();
  }, [rightTab]);

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

  const handleCategoryChange = (category: EventCategory) => {
    setFormData((prev) => ({ ...prev, category, brand: "", brandColor: "#A78BFA" }));
    setIsCustomBrand(false);
    setFormError("");
  };

  const handleBrandSelect = (value: string) => {
    if (value === CUSTOM_BRAND) {
      setIsCustomBrand(true);
      setFormData((prev) => ({ ...prev, brand: "", brandColor: "#A78BFA" }));
    } else if (value === "") {
      setIsCustomBrand(false);
      setFormData((prev) => ({ ...prev, brand: "", brandColor: "#A78BFA" }));
    } else {
      const preset = BRANDS.find((b) => b.name === value);
      if (preset) {
        setIsCustomBrand(false);
        setFormData((prev) => ({ ...prev, brand: preset.name, brandColor: preset.color }));
      }
    }
    setFormError("");
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError("");
  };

  const handleSubmit = () => {
    if (!formData.brand.trim() || !formData.title.trim()) {
      setFormError("브랜드와 이벤트 제목은 필수입니다.");
      return;
    }
    if (editingId !== null) {
      updateEvent({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      addEvent(formData);
    }
    setFormData(emptyForm);
    setIsCustomBrand(false);
    setDeadlineTBD(false);
    setFormError("");
  };

  const handleEdit = (event: Event) => {
    const { id, ...rest } = event;
    setFormData(rest);
    setEditingId(id);
    const isPreset = BRANDS.some((b) => b.name === event.brand);
    setIsCustomBrand(!isPreset);
    const presetTypes = ["시승", "체험", "응모", "드로우"];
    setIsCustomEventType(!presetTypes.includes(event.eventType));
    setDeadlineTBD(!event.deadline);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsCustomBrand(false);
    setIsCustomEventType(false);
    setDeadlineTBD(false);
    setFormError("");
  };

  const handleDelete = (id: number) => {
    if (!confirm("정말 삭제하시겠어요?")) return;
    deleteEvent(id);
    if (editingId === id) {
      setEditingId(null);
      setFormData(emptyForm);
      setIsCustomBrand(false);
    }
  };

  const categoryBrands = getBrandsByCategory(formData.category);
  const selectValue = isCustomBrand ? CUSTOM_BRAND : formData.brand;

  const inputCls =
    "w-full px-3 py-2 text-sm border border-primary-100 rounded-xl focus:outline-none focus:border-primary-400 bg-white text-text-primary placeholder:text-text-muted transition-colors";
  const labelCls = "block text-xs font-semibold text-text-secondary mb-1";

  // 진행중 / 종료 분류
  const activeEvents = events.filter(
    (e) => !e.deadline || new Date(e.deadline) >= today
  );
  const expiredEvents = events.filter(
    (e) => e.deadline && new Date(e.deadline) < today
  );

  // 검색 필터
  const applySearch = (list: Event[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        e.brand.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  };

  const tabCounts = {
    active: activeEvents.length,
    expired: expiredEvents.length,
    categories: categories.length,
    crawl: crawlQueue.length,
  };

  const tabs: { id: RightTab; label: string }[] = [
    { id: "active", label: "등록된 이벤트" },
    { id: "expired", label: "종료된 이벤트" },
    { id: "categories", label: "카테고리" },
    { id: "crawl", label: "크롤링 대기" },
  ];

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
          <label className={labelCls}>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className={inputCls + (pwError ? " !border-danger" : "")}
          />
          {pwError && <p className="text-xs text-danger mt-1.5">비밀번호가 올바르지 않습니다.</p>}
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

  return (
    <div className="min-h-screen bg-bg-main">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-text-primary">모응 관리자</h1>
            <span className="text-xs bg-primary-100 text-primary-600 font-semibold px-2.5 py-1 rounded-full ml-1">
              총 {events.length}개
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-text-secondary hover:text-primary-600 transition-colors">
              ← 메인으로
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-text-secondary border border-gray-200 px-3 py-1.5 rounded-lg hover:border-danger hover:text-danger transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* ── 왼쪽: 이벤트 등록/수정 폼 ── */}
          <div className="md:w-2/5">
            <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-5 sticky top-20">
              <h2 className="text-sm font-bold text-text-primary mb-4">
                {editingId !== null ? "이벤트 수정" : "새 이벤트 등록"}
              </h2>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={labelCls}>카테고리</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value as EventCategory)}
                      className={inputCls}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className={labelCls}>이벤트 타입</label>
                    <select
                      value={isCustomEventType ? "__custom__" : formData.eventType}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomEventType(true);
                          handleChange("eventType", "");
                        } else {
                          setIsCustomEventType(false);
                          handleChange("eventType", e.target.value);
                        }
                      }}
                      className={inputCls}
                    >
                      <option value="시승">시승</option>
                      <option value="체험">체험</option>
                      <option value="응모">응모</option>
                      <option value="드로우">드로우</option>
                      <option value="__custom__">직접 입력</option>
                    </select>
                    {isCustomEventType && (
                      <input
                        type="text"
                        placeholder="이벤트 타입 입력"
                        value={formData.eventType}
                        onChange={(e) => handleChange("eventType", e.target.value)}
                        className={inputCls + " mt-2"}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>브랜드 *</label>
                  <select
                    value={selectValue}
                    onChange={(e) => handleBrandSelect(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">브랜드 선택</option>
                    {categoryBrands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                    <option value={CUSTOM_BRAND}>직접 입력</option>
                  </select>
                  {isCustomBrand && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="브랜드명 입력"
                        value={formData.brand}
                        onChange={(e) => handleChange("brand", e.target.value)}
                        className={inputCls}
                      />
                      <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-text-muted">색상</span>
                        <input
                          type="color"
                          value={formData.brandColor}
                          onChange={(e) => handleChange("brandColor", e.target.value)}
                          className="w-10 h-8 rounded-lg border border-primary-100 cursor-pointer p-0.5 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>이벤트 제목 *</label>
                  <input
                    type="text"
                    placeholder="예) 팰리세이드 시승 이벤트"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>설명</label>
                  <textarea
                    placeholder="이벤트 설명을 입력하세요"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                    className={inputCls + " resize-none"}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={labelCls}>시작일</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls.replace("mb-1", "")}>마감일</label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deadlineTBD}
                          onChange={(e) => {
                            setDeadlineTBD(e.target.checked);
                            if (e.target.checked) handleChange("deadline", "");
                          }}
                          className="w-3 h-3 accent-primary-400"
                        />
                        <span className="text-[11px] text-text-secondary">미정</span>
                      </label>
                    </div>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                      disabled={deadlineTBD}
                      className={inputCls + (deadlineTBD ? " opacity-40 cursor-not-allowed" : "")}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>참여 방법</label>
                  <input
                    type="text"
                    placeholder="예) 공식 홈페이지 신청"
                    value={formData.participationMethod}
                    onChange={(e) => handleChange("participationMethod", e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>원본 링크</label>
                  <input
                    type="url"
                    placeholder="https://"
                    value={formData.link}
                    onChange={(e) => handleChange("link", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {formError && <p className="text-xs text-danger mt-3">{formError}</p>}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary-400 hover:bg-primary-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  {editingId !== null ? "수정 완료" : "등록하기"}
                </button>
                {editingId !== null && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 text-sm text-text-secondary border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── 오른쪽: 탭 메뉴 ── */}
          <div className="md:flex-1">
            <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
              {/* 탭 헤더 */}
              <div className="flex border-b border-gray-100">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setRightTab(tab.id); setSearchQuery(""); }}
                    className={`flex-1 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      rightTab === tab.id
                        ? "text-primary-600 border-b-2 border-primary-400 bg-primary-50"
                        : "text-text-secondary hover:text-text-primary hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rightTab === tab.id ? "bg-primary-400 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {tabCounts[tab.id]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* 등록된 이벤트 탭 */}
                {rightTab === "active" && (
                  <EventListPanel
                    events={applySearch(activeEvents)}
                    allCount={activeEvents.length}
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                    editingId={editingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}

                    categories={categories}
                    emptyMessage="진행 중인 이벤트가 없습니다."
                    inputCls={inputCls}
                  />
                )}

                {/* 종료된 이벤트 탭 */}
                {rightTab === "expired" && (
                  <EventListPanel
                    events={applySearch(expiredEvents)}
                    allCount={expiredEvents.length}
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                    editingId={editingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}

                    categories={categories}
                    emptyMessage="종료된 이벤트가 없습니다."
                    inputCls={inputCls}
                  />
                )}

                {/* 카테고리 관리 탭 */}
                {rightTab === "categories" && (
                  <div className="space-y-2">
                    {categories.map((cat) =>
                      editingCategory?.id === cat.id ? (
                        <div key={cat.id} className="flex gap-2 p-3 rounded-xl border border-primary-300 bg-primary-50">
                          <div className="flex-1 flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={editingCategory.label}
                              onChange={(e) => setEditingCategory({ ...editingCategory, label: e.target.value })}
                              placeholder="카테고리명"
                              className={inputCls}
                            />
                            <input
                              type="text"
                              value={editingCategory.desc}
                              onChange={(e) => setEditingCategory({ ...editingCategory, desc: e.target.value })}
                              placeholder="설명"
                              className={inputCls}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => { updateCategory(editingCategory); setEditingCategory(null); }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-400 text-white hover:bg-primary-500 transition-colors"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-text-secondary hover:border-gray-300 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors">
                          {/* 순서 버튼 */}
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => {
                                const idx = categories.findIndex((c) => c.id === cat.id);
                                if (idx === 0) return;
                                const next = [...categories];
                                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                reorderCategories(next);
                              }}
                              disabled={categories.findIndex((c) => c.id === cat.id) === 0}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >▲</button>
                            <button
                              onClick={() => {
                                const idx = categories.findIndex((c) => c.id === cat.id);
                                if (idx === categories.length - 1) return;
                                const next = [...categories];
                                [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                reorderCategories(next);
                              }}
                              disabled={categories.findIndex((c) => c.id === cat.id) === categories.length - 1}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >▼</button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-text-primary">{cat.label}</span>
                            <span className="text-xs text-text-muted ml-2">{cat.desc}</span>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => setEditingCategory({ ...cat })}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => {
                                const count = events.filter((e) => e.category === cat.id).length;
                                const msg = count > 0
                                  ? `이 카테고리에 이벤트 ${count}개가 있습니다. 삭제하면 해당 이벤트는 카테고리 미분류 상태가 됩니다. 삭제할까요?`
                                  : "카테고리를 삭제할까요?";
                                if (confirm(msg)) deleteCategory(cat.id);
                              }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      )
                    )}

                    {/* 카테고리 추가 */}
                    {showAddCategory ? (
                      <div className="flex gap-2 p-3 rounded-xl border border-primary-300 bg-primary-50 mt-3">
                        <div className="flex-1 flex flex-col gap-1.5">
                          <input
                            type="text"
                            value={newCategory.label}
                            onChange={(e) => setNewCategory((p) => ({ ...p, label: e.target.value }))}
                            placeholder="카테고리명 (예: 뷰티)"
                            className={inputCls}
                          />
                          <input
                            type="text"
                            value={newCategory.desc}
                            onChange={(e) => setNewCategory((p) => ({ ...p, desc: e.target.value }))}
                            placeholder="설명 (예: 체험·샘플 이벤트)"
                            className={inputCls}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => {
                              if (!newCategory.label.trim()) return;
                              addCategory(newCategory);
                              setNewCategory({ label: "", desc: "" });
                              setShowAddCategory(false);
                            }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-400 text-white hover:bg-primary-500 transition-colors"
                          >
                            추가
                          </button>
                          <button
                            onClick={() => { setShowAddCategory(false); setNewCategory({ label: "", desc: "" }); }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-text-secondary hover:border-gray-300 transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddCategory(true)}
                        className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-primary-200 text-xs font-semibold text-primary-500 hover:bg-primary-50 transition-colors"
                      >
                        + 카테고리 추가
                      </button>
                    )}
                  </div>
                )}

                {/* 크롤링 대기 탭 */}
                {rightTab === "crawl" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-xs text-text-muted">이디야·컴포즈·할리스 이벤트를 자동 수집합니다.</p>
                      <button
                        onClick={handleRunCrawler}
                        disabled={crawlRunning}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-400 hover:bg-primary-500 text-white disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {crawlRunning ? "수집 중..." : "지금 수집"}
                      </button>
                    </div>

                    {crawlLoading ? (
                      <p className="text-xs text-text-muted text-center py-8">불러오는 중...</p>
                    ) : crawlQueue.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-sm text-text-muted">검토 대기 중인 이벤트가 없습니다.</p>
                        <p className="text-xs text-text-muted mt-1">"지금 수집" 버튼을 눌러 크롤링을 시작하세요.</p>
                      </div>
                    ) : (
                      crawlQueue.map((item) => (
                        <div key={item.id} className="p-3 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors">
                          <div className="flex gap-3">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                                  style={{ backgroundColor: item.brand_color }}
                                >
                                  {item.brand}
                                </span>
                                <span className="text-[11px] text-text-muted bg-gray-50 px-2 py-0.5 rounded-full">
                                  {item.event_type}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">{item.title}</p>
                              {item.description && (
                                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {(item.start_date || item.deadline) && (
                                  <span className="text-[11px] text-text-muted">
                                    {item.start_date && `${item.start_date} ~ `}{item.deadline || "미정"}
                                  </span>
                                )}
                                <a
                                  href={item.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-primary-500 underline"
                                >
                                  원문 보기
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2.5">
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-primary-400 hover:bg-primary-500 text-white transition-colors"
                            >
                              승인 → 등록
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                            >
                              거절
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EventListPanel({
  events,
  allCount,
  searchQuery,
  onSearch,
  editingId,
  onEdit,
  onDelete,
  categories,
  emptyMessage,
  inputCls,
}: {
  events: Event[];
  allCount: number;
  searchQuery: string;
  onSearch: (q: string) => void;
  editingId: number | null;
  onEdit: (e: Event) => void;
  onDelete: (id: number) => void;
  categories: { id: string; label: string }[];
  emptyMessage: string;
  inputCls: string;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"deadline" | "latest">("deadline");

  const sortFn = (a: Event, b: Event) => {
    if (sortOrder === "latest") return b.id - a.id;
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  };

  const filtered = activeCategory
    ? events.filter((e) => e.category === activeCategory).sort(sortFn)
    : null;

  const groups = !filtered
    ? categories
        .map((cat) => ({ cat, items: events.filter((e) => e.category === cat.id).sort(sortFn) }))
        .filter(({ items }) => items.length > 0)
    : null;

  const totalVisible = filtered ? filtered.length : events.length;

  return (
    <div>
      {/* 검색 */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="브랜드, 이벤트명 검색"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className={inputCls + " pl-9"}
        />
      </div>

      {/* 카테고리 필터 + 정렬 */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              !activeCategory
                ? "bg-primary-400 text-white"
                : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-primary-400 text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "deadline" | "latest")}
          className="text-xs text-text-secondary bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer flex-shrink-0"
        >
          <option value="deadline">마감 임박순</option>
          <option value="latest">최신순</option>
        </select>
      </div>

      {searchQuery && (
        <p className="text-xs text-text-muted mb-3">{allCount}개 중 {totalVisible}개 검색됨</p>
      )}

      {totalVisible === 0 ? (
        <p className="text-sm text-text-muted text-center py-10">{emptyMessage}</p>
      ) : filtered ? (
        /* 특정 카테고리 선택: 단순 목록 */
        <div className="space-y-2">
          {filtered.map((event) => (
            <EventRow key={event.id} event={event} editingId={editingId} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        /* 전체: 카테고리별 그룹 */
        <div className="space-y-5">
          {groups!.map(({ cat, items }) => (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-text-secondary">{cat.label}</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((event) => (
                  <EventRow key={event.id} event={event} editingId={editingId} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
