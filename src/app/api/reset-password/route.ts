import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { phone, otp, newPassword } = await req.json();
  if (!phone || !otp || !newPassword) return NextResponse.json({ error: "정보가 부족해요." }, { status: 400 });

  const { data } = await adminSupabase
    .from("phone_verifications")
    .select("*")
    .eq("phone", phone)
    .single();

  if (!data) return NextResponse.json({ error: "인증 요청을 먼저 해주세요." }, { status: 400 });
  if (new Date(data.expires_at) < new Date()) return NextResponse.json({ error: "인증번호가 만료됐어요." }, { status: 400 });
  if (data.otp !== otp) return NextResponse.json({ error: "인증번호가 올바르지 않아요." }, { status: 400 });

  await adminSupabase.from("phone_verifications").delete().eq("phone", phone);

  const email = `p${phone}@moeung.kr`;
  const { data: { users } } = await adminSupabase.auth.admin.listUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return NextResponse.json({ error: "가입된 번호가 아니에요." }, { status: 400 });

  const { error } = await adminSupabase.auth.admin.updateUserById(user.id, { password: newPassword });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
