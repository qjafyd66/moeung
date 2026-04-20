import * as cheerio from "cheerio";
import { isParticipatoryEvent } from "./filter";

const BASE_URL = "https://composecoffee.co.kr";
const EVENT_URL = `${BASE_URL}/event`;

export async function crawlComposeCoffee() {
  const res = await fetch(EVENT_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9",
      "Referer": "https://www.google.com/",
    },
  });
  if (!res.ok) throw new Error(`Compose Coffee fetch failed: ${res.status}`);

  const $ = cheerio.load(await res.text());
  const results: object[] = [];

  $("ul.webzine_h > li.webzine_h_style2").each((_, el) => {
    const title = $(el).find(".doc_title").text().trim();
    const link = $(el).find("a.doc_link").attr("href") ?? "";
    const imgSrc = $(el).find(".image_area img").attr("src") ?? "";
    const regdate = $(el).find(".regdate").text().trim();

    if (!title || !link) return;
    if (!isParticipatoryEvent(title)) return;

    results.push({
      brand: "컴포즈커피",
      brand_color: "#FFD700",
      category: "coffee",
      title,
      description: `게시일: ${regdate}`,
      image_url: imgSrc.startsWith("http") ? imgSrc : `${BASE_URL}${imgSrc}`,
      link: link.startsWith("http") ? link : `${BASE_URL}${link}`,
      start_date: "",
      deadline: "",
      participation_method: "홈페이지 참여",
      event_type: "이벤트",
      source_url: EVENT_URL,
    });
  });

  return results;
}
