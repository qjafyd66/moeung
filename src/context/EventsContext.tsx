"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Event } from "@/data/events";
import { supabase } from "@/lib/supabase";

export type CategoryConfig = { id: string; label: string; desc: string };

const defaultCategories: CategoryConfig[] = [
  { id: "car", label: "자동차", desc: "시승·체험 이벤트" },
  { id: "appliance", label: "가전", desc: "체험·드로우 이벤트" },
  { id: "lifestyle", label: "라이프스타일", desc: "체험·응모 이벤트" },
];

// DB 행 → Event 타입
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEvent(row: any): Event {
  return {
    id: row.id,
    category: row.category,
    brand: row.brand,
    brandColor: row.brand_color,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    deadline: row.deadline,
    participationMethod: row.participation_method,
    link: row.link,
    eventType: row.event_type,
  };
}

// Event 타입 → DB 행
function eventToRow(event: Omit<Event, "id">) {
  return {
    category: event.category,
    brand: event.brand,
    brand_color: event.brandColor,
    title: event.title,
    description: event.description,
    start_date: event.startDate,
    deadline: event.deadline,
    participation_method: event.participationMethod,
    link: event.link,
    event_type: event.eventType,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCategory(row: any): CategoryConfig {
  return { id: row.id, label: row.label, desc: row.description };
}

type EventsContextType = {
  events: Event[];
  clicks: Record<number, number>;
  categories: CategoryConfig[];
  loading: boolean;
  addEvent: (event: Omit<Event, "id">) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  recordClick: (id: number) => Promise<void>;
  addCategory: (cat: Omit<CategoryConfig, "id">) => Promise<void>;
  updateCategory: (cat: CategoryConfig) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (reordered: CategoryConfig[]) => Promise<void>;
};

const EventsContext = createContext<EventsContextType | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [clicks, setClicks] = useState<Record<number, number>>({});
  const [categories, setCategories] = useState<CategoryConfig[]>(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);

      const [{ data: eventsData }, { data: categoriesData }] = await Promise.all([
        supabase.from("events").select("*").order("id", { ascending: true }),
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      ]);

      if (eventsData) {
        setEvents(eventsData.map(rowToEvent));
        const map: Record<number, number> = {};
        eventsData.forEach((r) => { map[r.id] = r.click_count ?? 0; });
        setClicks(map);
      }

      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData.map(rowToCategory));
      }

      setLoading(false);
    }
    loadAll();
  }, []);

  const addEvent = async (event: Omit<Event, "id">) => {
    const { data } = await supabase.from("events").insert(eventToRow(event)).select().single();
    if (data) setEvents((prev) => [...prev, rowToEvent(data)]);
  };

  const updateEvent = async (updated: Event) => {
    const { id, ...rest } = updated;
    await supabase.from("events").update(eventToRow(rest)).eq("id", id);
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  const deleteEvent = async (id: number) => {
    await supabase.from("events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const recordClick = async (id: number) => {
    const next = (clicks[id] ?? 0) + 1;
    await supabase.from("events").update({ click_count: next }).eq("id", id);
    setClicks((prev) => ({ ...prev, [id]: next }));
  };

  const addCategory = async (cat: Omit<CategoryConfig, "id">) => {
    const id = cat.label.trim().toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const sortOrder = categories.length + 1;
    const { data } = await supabase
      .from("categories")
      .insert({ id, label: cat.label, description: cat.desc, sort_order: sortOrder })
      .select()
      .single();
    if (data) setCategories((prev) => [...prev, rowToCategory(data)]);
  };

  const updateCategory = async (cat: CategoryConfig) => {
    await supabase.from("categories").update({ label: cat.label, description: cat.desc }).eq("id", cat.id);
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const reorderCategories = async (reordered: CategoryConfig[]) => {
    setCategories(reordered);
    await Promise.all(
      reordered.map((cat, i) =>
        supabase.from("categories").update({ sort_order: i + 1 }).eq("id", cat.id)
      )
    );
  };

  return (
    <EventsContext.Provider value={{
      events, clicks, categories, loading,
      addEvent, updateEvent, deleteEvent, recordClick,
      addCategory, updateCategory, deleteCategory, reorderCategories,
    }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
