"use client";

import { useState, useEffect } from "react";
import { useEvents } from "@/context/EventsContext";

type CrawlItem = {
  id: number;
  brand: string;
  brand_color: string;
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

export default function CrawlPage() {
  const { refreshEvents } = useEvents();
  const [queue, setQueue] = useState<CrawlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    const res = await fetch("/api/crawl/queue");
    const data = await res.json();
    setQueue(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleRun = async () => {
    setRunning(true);
    await fetch("/api/crawl/run", { method: "POST" });
    await fetchQueue();
    setRunning(false);
  };

  const handleApprove = async (id: number) => {
    await fetch("/api/crawl/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setQueue((prev) => prev.filter((item) => item.id !== id));
    await refreshEvents();
  };

  const handleReject = async (id: number) => {
    await fetch("/api/crawl/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary">크롤링 대기</h2>
          <p className="text-xs text-text-muted mt-0.5">이디야·컴포즈·할리스 응모/추첨 이벤트 자동 수집</p>
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 text-sm font-semibold bg-primary-400 hover:bg-primary-500 text-white rounded-xl disabled:opacity-50 transition-colors"
        >
          {running ? "수집 중..." : "지금 수집"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-text-muted text-center py-16">불러오는 중...</p>
        ) : queue.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-sm font-semibold text-text-secondary">검토 대기 중인 이벤트가 없어요</p>
            <p className="text-xs text-text-muted mt-1">"지금 수집" 버튼을 눌러 크롤링을 시작하세요.</p>
          </div>
        ) : (
          queue.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: item.brand_color }}
                    >
                      {item.brand}
                    </span>
                    <span className="text-[11px] text-text-muted bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.event_type}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary leading-snug">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {(item.start_date || item.deadline) && (
                      <span className="text-[11px] text-text-muted">
                        {item.start_date && `${item.start_date} ~ `}{item.deadline || "마감일 미정"}
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
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="flex-1 py-2 text-sm font-semibold rounded-xl bg-primary-400 hover:bg-primary-500 text-white transition-colors"
                >
                  승인 → 등록
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="flex-1 py-2 text-sm font-semibold rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                >
                  거절
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
