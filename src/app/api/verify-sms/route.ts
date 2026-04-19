import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { phone, otp } = await req.json();
  if (!phone || !otp) return NextResponse.json({ error: "정보가 부족해요." }, { status: 400 });

  const { data } = await supabase
    .from("phone_verifications")
    .select("*")
    .eq("phone", phone)
    .single();

  if (!data) return NextResponse.json({ error: "인증 요청을 먼저 해주세요." }, { status: 400 });
  if (new Date(data.expires_at) < new Date()) return NextResponse.json({ error: "인증번호가 만료됐어요." }, { status: 400 });
  if (data.otp !== otp) return NextResponse.json({ error: "인증번호가 올바르지 않아요." }, { status: 400 });

  await supabase.from("phone_verifications").delete().eq("phone", phone);
  return NextResponse.json({ ok: true });
}
