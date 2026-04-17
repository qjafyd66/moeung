# 모응 (moeung) — 프로젝트 가이드

자동차 시승 이벤트 aggregator 웹앱. 브랜드별 시승 이벤트를 모아 마감일 순으로 보여준다.

## 개발 환경

```bash
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
```

> **주의**: Next.js 16 + React 19 사용. App Router 기반. 일부 API가 기존 버전과 다를 수 있음 — 변경사항은 `node_modules/next/dist/docs/` 참고.

## 기술 스택

- **Next.js 16.2.4** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4** (`@tailwindcss/postcss` — `tailwind.config.ts` 없이 `globals.css`의 `@theme`으로 설정)
- **TypeScript 5**

## 프로젝트 구조

```
src/
├── app/
│   ├── globals.css     # Tailwind @theme 컬러 팔레트, Pretendard 폰트
│   ├── layout.tsx      # 루트 레이아웃, Pretendard CDN 링크
│   └── page.tsx        # 메인 페이지 (client component — 검색/탭/정렬 state)
├── components/
│   └── EventCard.tsx   # 이벤트 카드 컴포넌트
└── data/
    └── events.ts       # 이벤트 데이터 & Event 타입 정의
```

## 디자인 시스템

**테마**: 파스텔 퍼플 + 신뢰감 (토스/카카오/당근 스타일)

### 컬러 팔레트 (`globals.css` @theme)

| 토큰 | 값 | 용도 |
|---|---|---|
| `primary-400` | `#A78BFA` | 메인 버튼, 활성 탭 |
| `primary-500` | `#8B5CF6` | 버튼 hover |
| `primary-600` | `#7C3AED` | 강조, D-day 텍스트 |
| `primary-100` | `#EDE9FE` | 배지 배경 |
| `danger` | `#EF4444` | D-1 이내 |
| `warning` | `#F59E0B` | D-2~3 |
| `success` | `#10B981` | 여유 있는 마감 |
| `bg-main` | `#FAFAFC` | 전체 배경 |
| `text-primary` | `#1F2937` | 본문 |
| `text-secondary` | `#6B7280` | 보조 텍스트 |
| `text-muted` | `#9CA3AF` | 흐린 텍스트 |

### Tailwind v4 커스텀 컬러 사용법
```tsx
// globals.css에 --color-xxx 로 정의하면 자동으로 유틸리티 생성
className="bg-primary-400 text-text-primary border-primary-100"
```

## 이벤트 데이터 추가

`src/data/events.ts`의 `events` 배열에 추가:

```ts
{
  id: 6,
  brand: "브랜드명",
  brandColor: "#HEXCOLOR",   // 브랜드 대표색
  title: "이벤트 제목",
  description: "설명 (카드에 2줄 표시)",
  imageColor: "#HEXCOLOR",   // 카드 상단 그라디언트 기준색
  deadline: "YYYY-MM-DD",
  link: "https://...",
}
```

## 현재 구현된 기능

- 마감일 순 정렬
- 카테고리 탭 (UI만, 필터 로직 미구현)
- 브랜드/차종 검색
- D-day 배지 (D-1 빨강 / D-2~3 앰버 / D-4+ 흰배경)
- 카드 hover 애니메이션

## 미구현 / TODO

- 카테고리 탭 실제 필터링 (events.ts에 `category` 필드 추가 필요)
- 실제 이벤트 데이터 연동 (크롤링 or API)
- 상세 페이지
