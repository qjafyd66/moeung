"use client";

import { EventsProvider } from "@/context/EventsContext";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EventsProvider>{children}</EventsProvider>
    </AuthProvider>
  );
}
