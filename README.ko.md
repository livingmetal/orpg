# ORPG

한국어 · [English](README.md)

**온라인 TRPG** 플랫폼 — TRPG 테이블의 온라인 버전입니다.
플레이어는 세션에 참가해 캐릭터로 채팅하고, 주사위를 굴리고, 미리 캐릭터
시트를 작성합니다. 마스터(GM)는 스토리보드를 작성해 세션에 공개할 수
있습니다. LLM은 테이블의 소소한 일을 돕습니다: 규칙 질문, 주사위 계산,
가벼운 NPC 대화 등.

> 상태: **스캐폴딩**. 구조·설정·골격은 갖춰졌고, 대부분의 로직은 `TODO`로
> 남겨져 있습니다. [docs/roadmap.md](docs/roadmap.md) 참고.

## 기능 (예정)

- 🗨️ 세션별 **실시간 채팅** (Socket.IO 룸)
- 🎲 표준 표기법 **주사위** (`2d6+3`, `1d20`, `1d100-5`)
- 📜 사전 작성하는 **캐릭터 시트** (룰 시스템 유연)
- 📖 **GM 스토리보드** — 비공개로 작성, 세션에 공개
- 🤖 규칙 조회·로그 요약·NPC 대사를 돕는 **LLM 보조**

## 기술 스택

- [Next.js](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS
- [Socket.IO](https://socket.io/) — 얇은 커스텀 Node 서버 위에서 동작
- [Prisma](https://www.prisma.io/) + PostgreSQL
- LLM 보조를 위한 [Anthropic SDK](https://docs.anthropic.com/)

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env          # DATABASE_URL, ANTHROPIC_API_KEY 등 채우기

# 3. 데이터베이스 준비
npm run db:generate
npm run db:migrate

# 4. 개발 서버 실행 (Next + Socket.IO 가 한 포트에서 동작)
npm run dev                   # http://localhost:3000
```

## 디렉토리 구조

```
server/      커스텀 HTTP 서버 (Next 핸들러 + Socket.IO 실시간 핸들러)
src/app/     페이지 및 /api 라우트 핸들러
src/components/  UI: 채팅, 주사위, 캐릭터 시트, 스토리보드
src/lib/     prisma 클라이언트, anthropic 클라이언트, 주사위 로직, 소켓 클라이언트
src/types/   공유 Socket.IO 이벤트 계약
prisma/      데이터 모델
docs/        아키텍처 & 로드맵
```

자세한 내용은 [docs/architecture.md](docs/architecture.md) 참고.

## 라이선스

[MIT](LICENSE)
