"use client";

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

  if (!deadline) return { label: "미정", level: "tbd" };

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
  tbd:      "bg-gray-100 text-gray-500 font-semibold",
  upcoming: "bg-primary-50 text-primary-500 font-semibold",
};

export default function EventCard({ event, onClickApply }: { event: Event; onClickApply?: () => void }) {
  const { label, level } = getDDay(event.deadline, event.startDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isUpcoming = event.startDate && new Date(event.startDate) > today;

  const dateLabel = isUpcoming
    ? `${new Date(event.startDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} 시작`
    : !event.deadline
    ? "마감일 미정"
    : `마감 ${new Date(event.deadline).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
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
        <p className="text-xs text-text-secondary line-clamp-1">
          {event.description}
        </p>

        {event.participationMethod && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-muted">참여방법</span>
            <span className="text-[10px] font-medium text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded-full">
              {event.participationMethod}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[11px] text-text-muted shrink-0">{dateLabel}</span>
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClickApply}
            className="text-[11px] font-semibold bg-primary-400 hover:bg-primary-500 text-white px-3 py-1 rounded-lg transition-colors duration-150 flex items-center gap-1 shrink-0"
          >
            신청하기 →
          </a>
        </div>
      </div>
    </div>
  );
}
