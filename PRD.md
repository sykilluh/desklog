# 프로젝트 개발 명세서: 데스크로그 (DeskLog)

## 0. 기술 스택

| 영역 | 선택 |
|---|---|
| 프론트엔드 | Next.js 14 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS |
| 드래그앤드롭 | @dnd-kit/core |
| 애니메이션 | framer-motion |
| 오디오 | Web Audio API (네이티브) |
| 차트 | recharts |
| 이미지 캡처 | modern-screenshot |
| 백엔드 | Next.js API Routes |
| ORM | Prisma |
| DB | PostgreSQL |
| 인증 | NextAuth.js |
| 배포 | Vercel + Supabase/Railway |

---

## 1. 상세 기능 명세서

### 1-1. 디지털 데스크테리어 캔버스 (우선순위: 상)
- 사용자가 빈 책상 캔버스 위에 인벤토리의 오브제를 자유롭게 배치하고 상태를 저장.
- 드래그 앤 드롭 UI: 아이템 목록에서 끌어 캔버스 내부에 드롭.
- 충돌 및 영역 제한: 캔버스 영역(1200px * 700px 고정 비율) 내로 드롭 범위 제한.
- 실시간 좌표 추출: 드롭 완료 시 오브제 고유 ID + X, Y 상대 좌표(%) 상태 관리.
- 저장/로드: '배치 저장' 클릭 또는 페이지 이탈 시 좌표 배열을 API로 전송, 재접속 시 복구.

### 1-2. 인터랙티브 오디오 믹싱 시스템 (우선순위: 상)
- Web Audio API로 오브제마다 고유 오디오 노드 매핑 및 독립 제어.
- 오디오 소스 로딩: Lo-Fi, 카페 ASMR, 빗소리 등 루프 음원 버퍼 확보.
- 오디오 그래프: AudioBufferSourceNode → GainNode → AudioContext.destination.
- 개별 볼륨 슬라이더(0.0~1.0), 조작 시 GainNode.gain.value 실시간 업데이트.
- 전체 음소거/재생 컨트롤 바.

### 1-3. 완독 데드라인 챌린지 및 스케줄러 (우선순위: 상)
- 책 제목, 총 페이지 수, 시작일, 목표 종료일 입력.
- 가이드라인 알고리즘: `(총 페이지 수 - 현재 읽은 페이지 수) / 남은 일수` 매일 재계산.
- 요일별 마일스톤 캘린더로 주차별 목표치 동적 분할.
- 실시간 진도율 프로그레스 바.

### 1-4. 몰입 타이머 및 데이터 연동 비주얼 피드백 (우선순위: 중)
- 뽀모도로(25/5분) & 자유 스톱워치, 종료 시 집중 시간(초) 전송.
- 조명 오브제: 당일 집중 시간 증가에 따라 drop-shadow/opacity 동적 조절.
- 식물 성장: 누적 진도율 25% 단위 구간별 SVG 교체(plant_stage_1~4).

### 1-5. SNS 메타데이터 카드 생성기 (우선순위: 중)
- 배경색, 폰트, 스티커 등 커스텀 가능한 카드 템플릿.
- 총 독서 시간, 주요 오디오 트랙, 완독 날짜 데이터 바인딩.
- modern-screenshot으로 카드 DOM 캡처 후 PNG 다운로드.

---

## 2. 데이터베이스 스키마

### users
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK AI | |
| email | VARCHAR(255) UNIQUE | |
| password | VARCHAR(255) | |
| nickname | VARCHAR(50) | |
| created_at | TIMESTAMP | |

### books_challenges
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK AI | |
| user_id | INT FK→users.id | |
| title | VARCHAR(255) | |
| total_pages | INT | |
| current_pages | INT DEFAULT 0 | |
| start_date | DATE | |
| end_date | DATE | |
| total_focus_time | INT DEFAULT 0 | 초 단위 |
| status | ENUM(PROGRESS,COMPLETED,FAIL) | |
| created_at | TIMESTAMP | |

### user_desks
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK AI | |
| user_id | INT FK→users.id | |
| object_name | VARCHAR(50) | 'turntable','lamp' 등 |
| pos_x | FLOAT | 캔버스 가로 대비 % |
| pos_y | FLOAT | 캔버스 세로 대비 % |
| is_active | BOOLEAN DEFAULT TRUE | |
| volume | FLOAT DEFAULT 0.5 | |
| updated_at | TIMESTAMP | |

### focus_logs
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK AI | |
| user_id | INT FK→users.id | |
| challenge_id | INT FK→books_challenges.id NULLABLE | |
| focus_duration | INT | 초 단위 |
| audio_preset_name | VARCHAR(100) | |
| created_at | TIMESTAMP | |

(Prisma 스키마는 `prisma/schema.prisma` 참고)

---

## 3. 프론트엔드 컴포넌트 구조

```
src/
├── app/
│   ├── (main)/page.tsx          # 메인 (데스크캔버스+타이머+믹서)
│   ├── challenge/page.tsx
│   ├── archive/page.tsx
│   └── api/
│       ├── desk/route.ts
│       ├── challenge/route.ts
│       └── focus-log/route.ts
├── components/
│   ├── desk/ (DeskCanvas, DeskObject, ObjectInventory)
│   ├── audio/ (AudioController, SoundSlider)
│   ├── timer/ (FocusTimer, VisualFeedback)
│   ├── dashboard/ (ChallengeScheduler, ProgressChart)
│   └── share/ (ShareCardTemplate, CardCustomizer)
├── hooks/
│   ├── useWebAudio.ts
│   └── useDragAndDrop.ts
└── lib/
    ├── prisma.ts
    └── scheduler.ts
```

---

## 4. 아키텍처 핵심 설계 전략

### 4-1. Web Audio API 오디오 제어 구조
- 단일 AudioContext 인스턴스를 Context API로 전역 공유.
- 오브제 활성화 시 독립 GainNode 생성, useRef로 추적.
- 슬라이더 조작 시 `gainNode.gain.setValueAtTime(volume, audioCtx.currentTime)`.

### 4-2. 반응형 데스크 좌표 계산법
- 절대 px 저장 지양, `(left절대값 / 캔버스 width) * 100`으로 % 변환.
- 렌더링 시 `left: ${pos_x}%; top: ${pos_y}%`로 반응형 구현.

---

## 5. 주차별 개발 로드맵 (4주)

### 1주차 — 초기 세팅 & 데스크 MVP
- [ ] 백엔드 API 서버 + DB 스키마 빌드
- [ ] 프론트 프로젝트 세팅, 다크 테마 적용
- [ ] 드래그앤드롭 배치 + 좌표 저장/불러오기

### 2주차 — Web Audio 연동 & 사운드 제어
- [ ] 루프 음원 소싱 및 AudioContext 아키텍처
- [ ] 오브제 클릭→오디오 노드 활성화→볼륨 슬라이더 동기화
- [ ] 뽀모도로 타이머 연동

### 3주차 — 챌린지 스케줄러 & 비주얼 피드백
- [ ] 데드라인 동적 분할 계산 로직(Scheduler)
- [ ] 집중 시간 통계 대시보드 API
- [ ] 조명 필터/식물 SVG 단계 연동

### 4주차 — SNS 카드 & 서비스 고도화
- [ ] modern-screenshot으로 카드 PNG 내보내기
- [ ] 카드 배경색/스티커 커스텀 고도화
- [ ] 버그 수정, 예외 처리, 배포 준비
