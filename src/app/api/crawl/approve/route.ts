import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data: item, error: fetchErr } = await supabase
    .from("crawl_queue")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: insertErr } = await supabase.from("events").insert({
    category: item.category,
    brand: item.brand,
    brand_color: item.brand_color,
    title: item.title,
    description: item.description,
    start_date: item.start_date,
    deadline: item.deadline,
    participation_method: item.participation_method,
    link: item.link,
    event_type: item.event_type,
    click_count: 0,
  });

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  await supabase
    .from("crawl_queue")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
