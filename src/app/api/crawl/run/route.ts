import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { crawlEdiya } from "@/lib/crawlers/ediya";
import { crawlComposeCoffee } from "@/lib/crawlers/composecoffee";
import { crawlHollys } from "@/lib/crawlers/hollys";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CRAWLERS = [
  { brand: "이디야커피", fn: crawlEdiya },
  { brand: "컴포즈커피", fn: crawlComposeCoffee },
  { brand: "할리스", fn: crawlHollys },
];

async function runCrawlers() {
  const { data: existing } = await supabase.from("crawl_queue").select("link");
  const existingLinks = new Set((existing ?? []).map((r: { link: string }) => r.link));

  const summary = [];

  for (const { brand, fn } of CRAWLERS) {
    try {
      const events = await fn();
      const newEvents = events.filter((e: any) => !existingLinks.has(e.link));

      if (newEvents.length > 0) {
        await supabase.from("crawl_queue").insert(newEvents);
        newEvents.forEach((e: any) => existingLinks.add(e.link));
      }

      summary.push({ brand, found: events.length, added: newEvents.length });
    } catch (err: any) {
      summary.push({ brand, found: 0, added: 0, error: err.message });
    }
  }

  return NextResponse.json({ ok: true, summary });
}

export async function GET(_req: NextRequest) {
  return runCrawlers();
}

export async function POST(_req: NextRequest) {
  return runCrawlers();
}
