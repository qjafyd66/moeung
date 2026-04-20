import * as cheerio from "cheerio";
import { isParticipatoryEvent } from "./filter";

const BASE_URL = "https://www.ediya.com";
const EVENT_URL = `${BASE_URL}/contents/event.html?tb_name=event`;

function parseKoreanDate(text: string): { startDate: string; deadline: string } {
  const match = text.match(
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*~\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/
  );
  if (!match) return { startDate: "", deadline: "" };
  return {
    startDate: `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`,
    deadline: `${match[4]}-${match[5].padStart(2, "0")}-${match[6].padStart(2, "0")}`,
  };
}

export async function crawlEdiya() {
  const res = await fetch(EVENT_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9",
      "Referer": "https://www.google.com/",
    },
  });
  if (!res.ok) throw new Error(`Ediya fetch failed: ${res.status}`);

  const $ = cheerio.load(await res.text());
  const results: object[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  $("ul.board_e > li").each((_, el) => {
    const status = $(el).find(".board_e_state span").text().trim();
    if (status === "종료") return;

    const title = $(el).find(".board_e_con dt a").text().trim();
    const href = $(el).find(".board_e_con dt a").attr("href") ?? "";
    const imgSrc = $(el).find(".board_e_img img").attr("src") ?? "";
    const dateText = $(el).find(".board_e_con dd").text().trim();

    if (!title) return;

    const link = EVENT_URL;
    const imageUrl = imgSrc.startsWith("http")
      ? imgSrc
      : `${BASE_URL}/${imgSrc.replace(/^\//, "")}`;
    const { startDate, deadline } = parseKoreanDate(dateText);

    if (deadline && new Date(deadline) < today) return;
    if (!isParticipatoryEvent(title)) return;

    results.push({
      brand: "이디야커피",
      brand_color: "#003366",
      category: "coffee",
      title,
      description: dateText.replace("기간 :", "").trim(),
      image_url: imageUrl,
      link,
      start_date: startDate,
      deadline,
      participation_method: "홈페이지 참여",
      event_type: "이벤트",
      source_url: EVENT_URL,
    });
  });

  return results;
}
