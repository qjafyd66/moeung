import * as cheerio from "cheerio";

const BASE_URL = "https://www.hollys.co.kr";
const EVENT_URL = `${BASE_URL}/news/event/list.do`;

export async function crawlHollys() {
  const res = await fetch(EVENT_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
  });
  if (!res.ok) throw new Error(`Hollys fetch failed: ${res.status}`);

  const $ = cheerio.load(await res.text());
  const results: object[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  $("div.event_listBox").each((_, el) => {
    const onclick = $(el).find("dt a").attr("onclick") ?? "";
    const idMatch = onclick.match(/onDetail\((\d+)\)/);
    const eventId = idMatch?.[1];

    const sortText = $(el).find(".sort").text().trim();
    const fullTitle = $(el).find("dl.event_list dt").text().trim();
    const title = fullTitle.replace(sortText, "").trim();

    const imgSrc = $(el).find("img").attr("src") ?? "";
    const imageUrl = imgSrc.startsWith("//")
      ? `https:${imgSrc}`
      : imgSrc.startsWith("http")
      ? imgSrc
      : `${BASE_URL}${imgSrc}`;

    const dateText = $(el).find("dd.event_date").text().trim();
    const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/);
    const startDate = dateMatch?.[1] ?? "";
    const deadline = dateMatch?.[2] ?? "";

    if (deadline && new Date(deadline) < today) return;
    if (!title) return;

    results.push({
      brand: "할리스",
      brand_color: "#7B3F2B",
      category: "life",
      title,
      description: dateText.replace("공지 기간", "").trim(),
      image_url: imageUrl,
      link: eventId
        ? `${BASE_URL}/news/event/view.do?eventIdx=${eventId}`
        : EVENT_URL,
      start_date: startDate,
      deadline,
      participation_method: "홈페이지 참여",
      event_type: sortText || "이벤트",
      source_url: EVENT_URL,
    });
  });

  return results;
}
