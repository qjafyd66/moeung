export type EventCategory = string;
export type EventType = string;

export type Event = {
  id: number;
  category: EventCategory;
  brand: string;
  brandColor: string;
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  participationMethod: string;
  link: string;
  eventType: EventType;
};

export const initialEvents: Event[] = [
  {
    id: 1,
    category: "car",
    brand: "현대자동차",
    brandColor: "#002C5F",
    title: "더 뉴 팰리세이드 시승 이벤트",
    description: "완전변경된 팰리세이드를 직접 타보고 스타벅스 기프티콘을 받아가세요!",
    startDate: "2026-04-01",
    deadline: "2026-04-24",
    participationMethod: "공식 홈페이지 신청",
    link: "#",
    eventType: "시승",
  },
  {
    id: 2,
    category: "car",
    brand: "기아",
    brandColor: "#05141F",
    title: "EV6 GT 시승 & 경품 이벤트",
    description: "고성능 전기차 EV6 GT 시승 신청 시 추첨을 통해 항공권을 드립니다.",
    startDate: "2026-04-10",
    deadline: "2026-04-20",
    participationMethod: "공식 홈페이지 신청",
    link: "#",
    eventType: "시승",
  },
  {
    id: 3,
    category: "car",
    brand: "BMW",
    brandColor: "#1C69D4",
    title: "BMW 5시리즈 시승 캠페인",
    description: "신형 5시리즈 시승 고객 전원에게 BMW 브랜드 굿즈를 증정합니다.",
    startDate: "2026-04-01",
    deadline: "2026-05-01",
    participationMethod: "딜러십 방문 예약",
    link: "#",
    eventType: "시승",
  },
  {
    id: 4,
    category: "car",
    brand: "메르세데스-벤츠",
    brandColor: "#222222",
    title: "GLE 쿠페 VIP 시승 초청",
    description: "사전 신청 고객만을 위한 프라이빗 시승 행사. 정원이 한정되어 있습니다.",
    startDate: "2026-04-15",
    deadline: "2026-04-30",
    participationMethod: "사전 신청 (정원 한정)",
    link: "#",
    eventType: "시승",
  },
  {
    id: 5,
    category: "car",
    brand: "테슬라",
    brandColor: "#CC0000",
    title: "Model Y 시승 & 충전 체험",
    description: "Model Y 시승 후 리뷰 작성 시 테슬라 슈퍼차저 크레딧을 드립니다.",
    startDate: "2026-04-12",
    deadline: "2026-04-18",
    participationMethod: "앱에서 시승 예약",
    link: "#",
    eventType: "시승",
  },
];
