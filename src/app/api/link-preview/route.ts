import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "No URL" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Moeung/1.0; +https://moeung.kr)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const getOg = (prop: string) => {
      const m = html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"))
        ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, "i"));
      return m?.[1]?.trim() ?? null;
    };
    const getMeta = (name: string) => {
      const m = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"))
        ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"));
      return m?.[1]?.trim() ?? null;
    };

    const title = getOg("og:title") ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? url;
    const description = getOg("og:description") ?? getMeta("description") ?? null;
    const image = getOg("og:image") ?? null;
    const siteName = getOg("og:site_name") ?? null;

    // 상대 URL → 절대 URL
    let absoluteImage = image;
    if (image && image.startsWith("/")) {
      const origin = new URL(url).origin;
      absoluteImage = origin + image;
    }

    return NextResponse.json({ title, description, image: absoluteImage, siteName });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
