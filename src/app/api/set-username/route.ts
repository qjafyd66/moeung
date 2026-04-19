import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { userId, username } = await req.json();
  if (!userId || !username) return NextResponse.json({ error: "정보가 부족해요." }, { status: 400 });

  const email = `${username}@moeung.kr`;
  const { error } = await adminSupabase.auth.admin.updateUserById(userId, { email });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
