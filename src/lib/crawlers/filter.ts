const INCLUDE_KEYWORDS = [
  "응모", "추첨", "신청", "당첨", "드로우", "체험단",
  "모집", "퀴즈", "이벤트 참여", "참여하면", "참여하세요",
  "선착순 신청", "이벤트에 참여", "선물", "증정", "기회",
  "댓글", "공유", "리뷰", "인스타그램", "sns",
];

const EXCLUDE_KEYWORDS = [
  "할인", "적립", "쿠폰", "출시", "오픈", "구독", "패스",
  "안내", "공지", "혜택 안내", "신메뉴", "픽업", "배달",
  "가격", "멤버십 소개", "리뉴얼",
];

export function isParticipatoryEvent(title: string, description = ""): boolean {
  const text = (title + " " + description).toLowerCase();
  const hasInclude = INCLUDE_KEYWORDS.some((k) => text.includes(k));
  const hasExclude = EXCLUDE_KEYWORDS.some((k) => text.includes(k));

  if (hasInclude && !hasExclude) return true;
  if (hasInclude && hasExclude) return true; // 참여 키워드가 있으면 우선
  return false;
}
