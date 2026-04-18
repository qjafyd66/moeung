"use client";

import { useState, useEffect, useRef } from "react";
import { Event } from "@/data/events";

function getDDay(deadline: string, startDate: string): {
  label: string;
  level: "danger" | "warning" | "normal" | "expired" | "tbd" | "upcoming";
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    if (start > today) {
      const days = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { label: `${days}일 후 시작`, level: "upcoming" };
    }
  }

  if (!deadline) return { label: "마감일 미정", level: "tbd" };

  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "마감", level: "expired" };
  if (diff === 0) return { label: "D-Day", level: "danger" };
  if (diff === 1) return { label: "D-1", level: "danger" };
  if (diff <= 3) return { label: `D-${diff}`, level: "warning" };
  return { label: `D-${diff}`, level: "normal" };
}

const dDayStyles: Record<string, string> = {
  danger:   "bg-danger text-white font-bold",
  warning:  "bg-warning text-white font-bold",
  normal:   "bg-primary-100 text-primary-600 font-semibold",
  expired:  "bg-gray-200 text-gray-500 font-semibold",
  tbd:      "bg-gray-100 text-gray-500 font-semibold text-[10px]",
  upcoming: "bg-primary-50 text-primary-500 font-semibold",
};

export default function EventCard({ event, onClickApply }: { event: Event; onClickApply?: () => void }) {
  const [descOpen, setDescOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = descRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [event.description]);

  useEffect(() => {
    if (!descOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setDescOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [descOpen]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateLabel = event.startDate
    ? `${new Date(event.startDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} 시작`
    : !event.deadline
    ? "상시 운영"
    : `마감 ${new Date(event.deadline).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}`;

  const { label, level } = getDDay(event.deadline, event.startDate);

  const handleCardClick = () => {
    if (isTruncated) setDescOpen((v) => !v);
  };

  return (
    <div
      ref={cardRef}
      className={`relative bg-white rounded-xl shadow-sm border border-primary-100 transition-all duration-200 flex flex-col ${isTruncated ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
      <div className="px-3 py-2.5 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-600">
            {event.brand}
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${dDayStyles[level]}`}>
            {label}
          </span>
        </div>

        <h2 className="text-sm font-bold text-text-primary leading-snug line-clamp-1">
          {event.title}
        </h2>

        <div className="relative">
          <p
            ref={descRef}
            className="text-xs text-text-secondary line-clamp-1 select-none"
          >
            {event.description}
          </p>

          {descOpen && (
            <div className="absolute left-0 right-0 bottom-full mb-2 z-20 animate-fade-up">
              <div className="bg-white border border-primary-200 rounded-xl shadow-xl p-3 text-xs text-text-secondary leading-relaxed">
                {event.description}
              </div>
              <div className="w-3 h-3 bg-white border-b border-r border-primary-200 rotate-45 mx-4 -mt-1.5" />
            </div>
          )}
        </div>

        {event.participationMethod && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-muted">참여방법</span>
            <span className="text-[10px] font-medium text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded-full">
              {event.participationMethod}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[11px] text-text-muted min-w-0 truncate">{dateLabel}</span>
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.stopPropagation(); onClickApply?.(); }}
            className="text-[11px] font-semibold bg-primary-400 hover:bg-primary-500 text-white px-3 py-1 rounded-lg transition-colors duration-150 flex items-center gap-1 shrink-0"
          >
            신청하기 →
          </a>
        </div>
      </div>
    </div>
  );
}
