# 📚 DeskLog (데스크로그)

가상 책상 위에서 오브제를 배치하고, 음악을 믹싱하고, 독서 데드라인을 관리하며 집중 시간을 시각적으로 기록하는 "디지털 데스크테리어 + 독서 챌린지" 웹 서비스.

## ✨ 핵심 기능
- 🖱️ 드래그 앤 드롭 데스크 캔버스 (오브제 배치/저장)
- 🎧 Web Audio API 기반 인터랙티브 사운드 믹싱
- 📖 완독 데드라인 챌린지 & 동적 스케줄러
- 🌱 몰입 타이머 + 조명/식물 비주얼 피드백
- 🖼️ SNS 공유용 메타데이터 카드 생성기

## 🛠️ 기술 스택
Next.js 14 · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth.js · Web Audio API

## 📂 문서
- [PRD.md](./PRD.md) — 전체 기능 명세서, DB 스키마, 컴포넌트 구조, 4주 로드맵

## 🚀 개발 시작하기

```bash
npm install
cp .env.example .env   # DB 정보 입력
npx prisma migrate dev --name init
npm run dev
```

## 📅 로드맵
- [ ] 1주차: 데스크 캔버스 MVP
- [ ] 2주차: 오디오 믹싱 시스템
- [ ] 3주차: 챌린지 스케줄러
- [ ] 4주차: SNS 카드 생성기 & 배포

## 📄 라이선스
MIT
