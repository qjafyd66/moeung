import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function getSolapiAuth() {
  const apiKey = process.env.SOLAPI_API_KEY!.trim();
  const apiSecret = process.env.SOLAPI_API_SECRET!.trim();
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto.createHmac("sha256", apiSecret).update(date + salt).digest("hex");
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "전화번호가 필요해요." }, { status: 400 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase.from("phone_verifications").upsert({ phone, otp, expires_at: expiresAt });

  try {
    const res = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getSolapiAuth(),
      },
      body: JSON.stringify({
        message: {
          to: phone,
          from: process.env.SOLAPI_SENDER!.trim(),
          text: `[모응] 인증번호: ${otp} (5분 내 입력해주세요)`,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.errorMessage ?? "SMS 전송 실패" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
