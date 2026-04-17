"use client";

import { EventsProvider } from "@/context/EventsContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <EventsProvider>{children}</EventsProvider>;
}
