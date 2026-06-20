# 💻 팀 개발 컨벤션 및 협업 가이드 (DeskLog)

* **프로젝트명:** DeskLog (데스크로그)
* **사용 기술 스택**
  * **풀스택 프레임워크:** Next.js 14 (App Router, TypeScript) — 프론트엔드와 API를 한 저장소에서 관리
  * **스타일링/애니메이션:** Tailwind CSS + Framer Motion
  * **ORM / DB:** Prisma + PostgreSQL (Supabase 무료 플랜)
  * **인증:** NextAuth.js (JWT 세션, httpOnly 쿠키)
  * **Core API:** Web Audio API(사운드 제어), modern-screenshot(이미지 렌더링)
  * **배포:** Vercel(앱) + Supabase(DB) — 둘 다 무료 티어로 운영 가능

> Express+MySQL로 프론트/백엔드를 분리하지 않는 이유: 무료 배포 시 백엔드 서버가 별도로 필요해 비용·관리 부담이 커지고(Render 등 무료 인스턴스는 슬립/콜드스타트 발생), CORS·토큰 전달 등 부가 작업이 늘어납니다. Next.js 단일 구조는 Vercel 하나로 무료 배포가 가능하고, API Route와 화면이 같은 타입을 공유해 버그가 적습니다.

## 👥 팀 역할

* **인증(로그인/회원가입) & 유저 관리:** 이고은
* **가상 데스크 캔버스 & 드래그 앤 드롭 UI:** 조하늘
* **인터랙티브 오디오 믹싱 시스템:** 장세영
* **완독 데드라인 챌린지 스케줄러 & 타이머:** 이지우
* **성장 대시보드 & SNS 템플릿 카드(modern-screenshot):** 김개발

---

## 1. Git & 브랜치 전략

### 1-1. 브랜치 구조

| 브랜치 | 설명 |
| --- | --- |
| `main` | 최종 배포 브랜치 (Vercel Production 연결) |
| `develop` | 개발 통합 브랜치 (Vercel Preview 연결) |
| `feature/*` | 기능 개발 브랜치 |
| `fix/*` | 버그 수정 브랜치 |
| `hotfix/*` | 긴급 수정 브랜치 |

### 1-2. 브랜치명 규칙

**형식:** `타입/기능명`

* `feature/login`
* `feature/desk-canvas`
* `feature/audio-mixer`
* `fix/timer-sync-error`
* `fix/canvas-overflow`

---

## 2. Commit 컨벤션

**기본 형식:** `타입: 작업 내용`

* `feat: 인터랙티브 오디오 믹싱 API 구현`
* `feat: 데스크 오브제 드래그 앤 드롭 기능 추가`
* `fix: 뽀모도로 타이머 세션 오류 수정`
* `style: 다크모드 배경색 프리미엄 블랙으로 변경`

**Commit Type 종류:**

* `feat`: 기능 추가
* `fix`: 버그 수정
* `docs`: 문서 수정
* `style`: 코드 스타일 수정 (UI/CSS)
* `refactor`: 코드 개선
* `test`: 테스트 코드
* `chore`: 설정 파일 수정 (패키지 설치 등)

---

## 3. 프로젝트 폴더 구조 (Next.js App Router, 단일 저장소)

API 라우트는 Controller 역할을 하며, 비즈니스 로직(스케줄러 계산, 좌표 변환 등)은 반드시 `lib/services/`에 작성한다.

```text
src/
 ├── app/
 │    ├── (main)/page.tsx          # 메인 (데스크캔버스 + 타이머 + 믹서)
 │    ├── challenge/page.tsx
 │    ├── archive/page.tsx
 │    ├── api/
 │    │    ├── auth/[...nextauth]/route.ts
 │    │    ├── desks/objects/route.ts        # GET/POST
 │    │    ├── desks/objects/[id]/route.ts   # PATCH
 │    │    ├── challenges/route.ts           # GET/POST
 │    │    ├── challenges/[id]/progress/route.ts  # PATCH
 │    │    └── focus-logs/route.ts           # POST, GET ?stat=
 │    └── globals.css
 ├── components/
 │    ├── desk/      ← 가상 데스크 캔버스, 오브제 아이템
 │    ├── audio/     ← 슬라이더, 오디오 믹서 컨트롤
 │    ├── timer/     ← 몰입 타이머, 시각화 요소(조명/식물)
 │    └── share/     ← SNS 카드 렌더링 컴포넌트
 ├── hooks/          ← 커스텀 훅 (useWebAudio, useDragAndDrop)
 ├── lib/
 │    ├── prisma.ts          ← Prisma Client 싱글턴
 │    ├── services/          ← 비즈니스 로직 (좌표 변환, 스케줄링 연산 등)
 │    ├── auth.ts            ← NextAuth 설정
 │    └── response.ts        ← 통일된 응답 포맷 함수
 └── types/
prisma/
 └── schema.prisma
public/
 ├── sounds/         ← Lo-Fi, ASMR 등 정적 음원 파일
 └── images/
```

---

## 4. 파일 및 변수명 규칙

* **컴포넌트 파일 (React):** `PascalCase` (예: `DeskCanvas.tsx`, `AudioSlider.tsx`)
* **일반 TS 파일:** `camelCase` (예: `deskService.ts`, `useWebAudio.ts`)
* **변수/함수명:** `camelCase` (boolean은 `is/has` 접두사 권장)
  * 좋은 예: `deskObjectName`, `focusDuration`, `isAudioPlaying`, `updateObjectPosition()`
* **상수명:** `대문자_SNAKE_CASE` (예: `MAX_AUDIO_VOLUME`, `DEFAULT_CANVAS_WIDTH`)

---

## 5. API 명세 (Next.js API Routes 기준)

| 기능 | Method | URL |
| --- | --- | --- |
| 회원가입 | POST | `/api/auth/signup` |
| 로그인 | POST | `/api/auth/[...nextauth]` (NextAuth Credentials) |
| 회원정보 조회 | GET | `/api/auth/me` |
| 데스크 배치 불러오기 | GET | `/api/desks/objects` |
| 배치 상태(좌표, 볼륨) 저장 | POST | `/api/desks/objects` |
| 오브제 활성화/비활성화 | PATCH | `/api/desks/objects/:id` |
| 완독 챌린지 등록 | POST | `/api/challenges` |
| 챌린지 목록 및 진도 조회 | GET | `/api/challenges` |
| 진도율(페이지) 업데이트 | PATCH | `/api/challenges/:id/progress` |
| 타이머 세션 기록 | POST | `/api/focus-logs` |
| 통계 데이터 조회 | GET | `/api/focus-logs?stat=daily` |

> ⚠️ 데스크 배치 저장 시 절대 픽셀(px)이 아닌 캔버스 대비 백분율(%)로 변환하여 통신한다.

---

## 6. 데이터베이스 규칙 (PostgreSQL + Prisma)

* **모델명(Prisma schema):** `PascalCase` 단수 (예: `User`, `DeskObject`, `Challenge`, `FocusLog`) → 실제 테이블은 Prisma `@@map`으로 snake_case 복수 매핑 (예: `users`, `desk_objects`)
* **컬럼명:** Prisma 필드는 `camelCase`, DB 컬럼은 `@map`으로 `snake_case` 매핑 (예: `posX → pos_x`, `focusDuration → focus_duration`)
* **주요 설계 주의사항:**
  * `DeskObject.posX`, `posY`는 반응형 대응을 위해 백분율(Float)로 저장한다.
  * `focusDuration`은 반드시 초(Second) 단위의 정수(Int)로 기록한다.
  * `createdAt`/`updatedAt`은 Prisma `@default(now())` / `@updatedAt`으로 자동 관리한다.

---

## 7. 응답(Response) 형식 통일

모든 API Route 응답은 아래 형식을 사용한다. `lib/response.ts`의 헬퍼로 통일한다.

```ts
// 성공 응답 예시
{
  "ok": true,
  "status": 200,
  "message": "데스크 배치 저장 완료",
  "data": { ... }
}

// 실패 응답 예시
{
  "ok": false,
  "status": 400,
  "message": "좌표 데이터가 누락되었습니다.",
  "data": null
}
```

---

## 8. 프론트엔드 (React / Tailwind) 규칙

* 별도의 CSS 파일 생성을 지양하고 Tailwind Utility Class를 우선적으로 사용한다.
* 복잡한 동적 스타일(드래그 앤 드롭 X, Y 좌표)은 inline-style을 혼용한다.
  ```tsx
  <div style={{ left: `${x}%`, top: `${y}%` }} />
  ```
* 사운드 제어는 외부 라이브러리 의존성 없이 브라우저 네이티브 `Web Audio API`를 사용하여 `GainNode`로 볼륨을 독립 제어한다.
* UI 애니메이션은 `framer-motion`을 활용한다.
* 클라이언트 상태 관리는 복잡한 전역 상태가 필요한 경우 `zustand`를 사용한다(과한 추상화 지양, 필요한 만큼만).

---

## 9. 에러 처리 및 인증 규칙

* **예외 처리 (Service ↔ Route 분리):** `lib/services/`에서 비즈니스 로직 에러 발생 시 상태 코드를 담아 `throw`하고, API Route의 `catch` 블록에서 일괄적으로 `sendError`를 응답한다.
* **인증:** NextAuth.js 세션(JWT, httpOnly 쿠키)을 사용한다. 클라이언트에서 토큰을 직접 다루지 않으며, API Route에서는 `getServerSession`으로 인증 여부를 확인한다.

---

## 10. 팀 협업 규칙 (Pull Request & Issue)

* **작업 시작 전 Issue 생성 필수:** `#12 가상 데스크 캔버스 초기 UI 구현`
* **PR 생성 시 자동 종료 연동:** PR 본문에 `close #12` 또는 `fix #12` 명시.
* **코드 리뷰:** 최소 1명 이상의 승인(Approve) 후 `develop` 브랜치에 Merge 한다.
* **Merge 전 체크리스트:**
  * 디버깅용 `console.log` 제거 확인 (에러 로그용 `console.error` 제외)
  * 불필요한 파일 제거 (`.env` 절대 포함 금지)
  * Web Audio 노드 메모리 누수 방지 (컴포넌트 Unmount 시 AudioContext close 또는 disconnect 확인)
  * 반응형 좌표 변환 테스트 완료 여부 확인

---

## 11. 무료 배포 체크리스트

* **Vercel:** GitHub 저장소 연결 → main 브랜치 Push 시 자동 배포 (무료 Hobby 플랜)
* **DB:** Supabase 무료 프로젝트 생성 → Connection String을 Vercel 환경변수 `DATABASE_URL`에 등록
* **환경변수:** `.env`는 절대 커밋하지 않고 `.env.example`만 커밋, Vercel 대시보드에서 직접 입력
* **이미지/음원 정적 파일:** `public/` 폴더에 두면 Vercel CDN으로 자동 서빙 (별도 스토리지 비용 없음)
