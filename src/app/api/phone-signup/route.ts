import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "전화번호가 필요해요." }, { status: 400 });

  const { data: existing } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .single();
  if (existing) return NextResponse.json({ error: "이미 가입된 번호예요. 로그인을 이용해주세요." }, { status: 400 });

  const email = `p${phone}@moeung.kr`;
  const tempPass = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + "A1";

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password: tempPass,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return NextResponse.json({ error: "이미 가입된 번호예요. 로그인을 이용해주세요." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ userId: data.user.id, email, tempPass });
}
