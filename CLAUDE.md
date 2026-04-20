# 모응 (moeung) — 프로젝트 가이드

자동차·가전·라이프스타일 이벤트(시승·체험·응모 등)를 모아 마감일 순으로 보여주는 이벤트 aggregator 웹앱.

---

## 서비스 정보

- **라이브 URL**: https://www.moeung.kr (또는 https://www.moeung.kr)
- **관리자 페이지**: https://www.moeung.kr/admin (비밀번호: `moeung2026`)
- **GitHub**: https://github.com/qjafyd66/moeung.git
- **Vercel 대시보드**: https://vercel.com/qjafyd66s-projects/moeung
- **Supabase**: https://cfilhzegzpzohzzhlofh.supabase.co

---

## 개발 환경

```bash
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
```

코드 수정 후 `git push`하면 Vercel이 자동 배포한다. 별도 배포 명령 불필요.

---

## 기술 스택

- **Next.js 16.2.4** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4** (`@tailwindcss/postcss` — `tailwind.config.ts` 없이 `globals.css`의 `@theme`으로 설정)
- **TypeScript 5**
- **Supabase** (PostgreSQL DB + Auth 예정)

---

## 환경 변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://cfilhzegzpzohzzhlofh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_g2QHUpiYhscF-NNHxw-LZg_kFaRub2O
```

Vercel에도 동일하게 등록되어 있음.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── globals.css          # Tailwind @theme 컬러 팔레트, slideUp 애니메이션
│   ├── layout.tsx           # 루트 레이아웃, Pretendard CDN 링크
│   ├── page.tsx             # 메인 페이지 (디스커버리 랜딩 + 이벤트 목록)
│   └── admin/
│       └── page.tsx         # 관리자 페이지 (이벤트 등록/수정/삭제 + 카테고리 관리)
├── components/
│   └── EventCard.tsx        # 이벤트 카드 컴포넌트
├── context/
│   └── EventsContext.tsx    # Supabase 연동 전역 상태 (events, clicks, categories)
├── data/
│   ├── events.ts            # Event 타입 정의 (category/eventType은 string)
│   └── brands.ts            # 브랜드 프리셋 목록 (이름, 색상)
└── lib/
    └── supabase.ts          # Supabase 클라이언트 초기화
```

---

## Supabase 테이블 구조

### `events` 테이블
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | int8 (PK) | 자동 증가 |
| category | text | 카테고리 ID (예: "car") |
| brand | text | 브랜드명 |
| brand_color | text | 브랜드 hex 색상 |
| title | text | 이벤트 제목 |
| description | text | 설명 |
| start_date | text | 시작일 (YYYY-MM-DD, 없으면 빈 문자열) |
| deadline | text | 마감일 (YYYY-MM-DD, 없으면 빈 문자열) |
| participation_method | text | 참여 방법 |
| link | text | 신청 URL |
| event_type | text | 이벤트 유형 (시승, 체험 등) |
| click_count | int4 | 신청하기 클릭 수 (인기순위 기준) |

### `categories` 테이블
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | text (PK) | 카테고리 식별자 (예: "car") |
| label | text | 표시 이름 (예: "자동차") |
| description | text | 설명 (예: "시승·체험 이벤트") |
| sort_order | int4 | 정렬 순서 |

---

## 디자인 시스템

**테마**: 파스텔 퍼플 + 신뢰감 (토스/카카오/당근 스타일)

### 컬러 팔레트 (`globals.css` @theme)

| 토큰 | 값 | 용도 |
|---|---|---|
| `primary-400` | `#A78BFA` | 메인 버튼, 활성 탭, 로고 텍스트 |
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

---

## 현재 구현된 기능 (전체)

### 메인 페이지 (`page.tsx`)

**디스커버리(랜딩) 화면** — 카테고리를 선택하기 전 첫 화면:
- 상단 검색창 (브랜드/이벤트명 검색)
- 인기 순위 롤링 바: 클릭수 기준 상위 8개 브랜드를 2.5초마다 자동 전환
  - 1위 노란색, 2위 하늘색, 3위 오렌지색, 4위+ 회색
  - 클릭하면 드롭다운 목록 열림 / 바깥 클릭하면 닫힘 (투명 backdrop 방식, 모바일 대응)
  - 목록에서 브랜드 선택 시 해당 브랜드로 검색
- 카테고리 카드 3개 (자동차 / 가전 / 라이프스타일) — Supabase에서 동적 로드
- 검색어 입력 시 인라인 검색 결과 표시 (카테고리 이동 없이)

**이벤트 목록 화면** — 카테고리 선택 후:
- 카테고리 탭 필터 (전체 + 각 카테고리)
- 브랜드/차종 검색
- 정렬: 마감 임박순 / 최신순 / 인기순
- 마감일이 오늘보다 이전이면 카드 자동 숨김 (데이터는 DB에 보존)
- 뒤로가기 버튼 (홈으로 이동)

**헤더**:
- 로고(logo.png) + "모응" 텍스트 (primary-400 색상)
- 로그인 버튼, 앱 다운로드 버튼

### EventCard 컴포넌트 (`EventCard.tsx`)

- 브랜드 배지 (bg-primary-100, text-primary-600)
- D-Day 배지: D-Day/D-1 빨강, D-2~3 앰버, D-4+ 연보라, 마감일 미정 회색, 시작 예정 연보라
- 배지 라벨: 마감일 없으면 "마감일 미정"
- 이벤트 제목, 설명 (1줄 clamp)
- 참여방법 표시 (있을 때만)
- 하단 날짜: 시작일 있으면 "N월 N일 시작", 없고 마감일 있으면 "마감 YYYY년 N월 N일", 둘 다 없으면 "마감일 미정"
- 신청하기 버튼 (클릭 시 click_count 증가 → 인기순위 반영)
- 컴팩트 레이아웃 (px-3 py-2.5)

### 관리자 페이지 (`admin/page.tsx`)

**인증**: 비밀번호 `moeung2026` (sessionStorage 기반, 추후 Supabase Auth로 교체 예정)

**탭 메뉴**:
1. **등록된 이벤트**: 진행 중인 이벤트 목록
2. **종료된 이벤트**: 마감일이 지난 이벤트 목록
3. **카테고리 관리**: 카테고리 추가/수정/삭제

**이벤트 관리 기능**:
- 카테고리별 필터 + 검색 + 마감 임박순/최신순 정렬
- 이벤트 등록 폼: 카테고리(동적), 브랜드(프리셋 or 직접입력), 이벤트 타입(프리셋 or 직접입력), 제목, 설명, 시작일, 마감일, 참여방법, 링크, 브랜드 색상
- 이벤트 수정/삭제

**카테고리 관리**:
- 카테고리 추가 (이름 + 설명)
- 카테고리 수정 (인라인 편집)
- 카테고리 삭제 (해당 카테고리 이벤트 수 경고 표시)
- 추가된 카테고리 즉시 이벤트 등록 폼에 반영

### EventsContext (`EventsContext.tsx`)

- Supabase에서 events, categories 로드 (초기화 시 1회)
- click_count 실시간 업데이트
- CRUD 함수 모두 async/await (Promise<void>)
- snake_case(DB) ↔ camelCase(TypeScript) 필드 매핑
- loading 상태 제공

---

## 배포 구조

```
로컬 코드 수정
    ↓
git push (GitHub: qjafyd66/moeung)
    ↓
Vercel 자동 감지 → 자동 빌드 → 자동 배포
    ↓
www.moeung.kr 에 즉시 반영
```

**도메인 설정**:
- `www.moeung.kr` → Vercel (CNAME: 1757867219e9e4f9.vercel-dns-017.com)
- `moeung.kr` → www.moeung.kr 리디렉션 (307)
- 가비아 네임서버: ns1.vercel-dns.com / ns2.vercel-dns.com 으로 변경됨

---

## TODO / 미완성 항목

- [ ] **관리자 로그인 보안 강화**: 현재 코드에 비밀번호 하드코딩됨 → Supabase Auth로 교체 필요
- [ ] **로그인 기능**: 일반 사용자 로그인 (Supabase Auth, 무료)
- [ ] **모바일 앱**: React Native 또는 Flutter
- [ ] **이벤트 상세 페이지**: 현재 카드 클릭 시 바로 외부 링크로 이동
- [ ] **이벤트 데이터 확충**: 더 많은 브랜드/카테고리 이벤트 등록
- [ ] **OG 이미지 추가**: 1200×630px 이미지 → `/public/og-image.png` 후 layout.tsx에 og:image 추가
- [ ] **크롤링 시스템 개선**: 이디야·컴포즈·할리스 크롤러 추가 브랜드 확대 (추후 재개)
- [ ] **날짜 표기 통일**: 시작일/마감일 연도 표기 일관성 맞추기
- [ ] **신청 링크 없는 이벤트**: link 비어있을 때 신청하기 버튼 비활성화 처리
- [ ] **상표 등록**: "모응" 상표 특허청 등록 (MAU 늘어날 때 진행)

---

## 주요 작업 히스토리

### DB 연동 (Supabase)
- 기존 localStorage → Supabase PostgreSQL로 전환
- events, categories 테이블 생성 및 RLS 정책 설정
- EventsContext 전면 재작성 (async/await, rowToEvent/eventToRow 매핑)

### 메인 페이지 UX
- 당근마켓 스타일 카테고리 카드 랜딩 화면 구현
- 인기 순위 롤링 바 (클릭수 기반, 2.5초 자동 전환)
- 인기 순위 드롭다운: hover(PC) + 클릭 토글(모바일) → 최종적으로 클릭 토글 + 바깥 클릭 시 닫힘(backdrop 방식)
- 검색 시 카테고리 목록으로 이동하지 않고 인라인 표시
- 마감된 이벤트 자동 숨김 (데이터 보존)

### 관리자 페이지
- 탭 메뉴: 등록된/종료된 이벤트, 카테고리 관리
- 카테고리 동적 관리 (추가 즉시 이벤트 폼에 반영)
- 이벤트 타입 직접 입력 지원
- 카테고리별 필터 + 검색 + 정렬

### 이벤트 카드
- 참여방법 노출
- D-Day 배지 로직 수정 (시작 예정일 우선 체크)
- "미정" → "마감일 미정"으로 변경
- 하단 날짜: 시작일 우선 표시
- 컴팩트 레이아웃으로 개선

### 배포
- GitHub 연동 (https://github.com/qjafyd66/moeung.git)
- Vercel 배포 (자동 배포 설정)
- 가비아 도메인 연결 (moeung.kr, www.moeung.kr)

### 이벤트 데이터
- 2026년 4월 시승 이벤트 7건 직접 Supabase에 삽입:
  현대자동차, 한국토요타, BMW, 메르세데스-벤츠, 아우디, 제네시스, 기아

### 크롤링 시스템 (2026-04-20)
- `src/lib/crawlers/` — 이디야, 컴포즈커피, 할리스 크롤러 구현
- `src/lib/crawlers/filter.ts` — 응모/추첨/신청 이벤트만 필터링
- `src/app/api/crawl/` — run, queue, approve, reject API 라우트
- Supabase `crawl_queue` 테이블 (status: pending/approved/rejected)
- `/admin` 페이지에 "크롤링 대기" 탭으로 통합 (별도 URL 없음)
- `vercel.json` — 매일 자정 자동 크롤링 Cron 설정

### 런칭 전 개선 (2026-04-20)
- 공지사항/고객센터 → LegalModal 모달로 표시
- OG 메타태그 추가 (og:title, og:description, og:url, og:type) — 이미지 미적용
- 이용약관 제6조 추가 (지식재산권 보호, 복제/크롤링 금지)
- AI 봇 차단 해제: robots.txt + Cloudflare "Do not block (allow crawlers)"
  - Cloudflare 경로: Security → Settings → Bot traffic → Block AI bots → Do not block
