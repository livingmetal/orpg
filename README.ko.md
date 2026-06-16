# ORPG

한국어 · [English](README.md)

**온라인 TRPG** 플랫폼 — TRPG 테이블의 온라인 버전입니다.
플레이어는 세션에 참가해 캐릭터로 채팅하고, 주사위를 굴리고, 미리 캐릭터
시트를 작성합니다. 마스터(GM)는 스토리보드를 작성해 세션에 공개할 수
있습니다. LLM은 테이블의 소소한 일을 돕습니다: 규칙 질문, 주사위 계산,
가벼운 NPC 대화 등.

**셀프 호스팅 방식.** 한 명이 **호스트** 프로그램을 실행하면, 하나의
프로세스 안에서 웹 서버 · 실시간 계층 · 임베디드 SQLite DB가 함께 뜹니다.
나머지 사람들은 **클라이언트**로서 브라우저로 호스트 주소에 접속하면 됩니다.
별도로 설치하거나 실행할 DB 서버가 없습니다.

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
- [Prisma](https://www.prisma.io/) + **SQLite** (임베디드 — 별도 DB 서버 없음)
- LLM 보조를 위한 [Anthropic SDK](https://docs.anthropic.com/)

## 호스트 & 클라이언트

- **호스트** (GM 또는 테이블을 여는 사람): 호스트 프로그램을 실행합니다.
  시작 시 DB 마이그레이션을 적용하고(없으면 `data/orpg.db` 생성), 앱을
  서빙하면서 `Local`과 `Network` 주소를 출력합니다.
- **클라이언트** (플레이어): 브라우저로 호스트의 **Network** 주소
  (예: `http://192.168.x.x:3000`)에 접속합니다. 설치할 것이 없습니다.

## 호스트 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env          # ANTHROPIC_API_KEY, NEXTAUTH_SECRET 등
                              # DATABASE_URL 은 이미 임베디드 SQLite 파일을 가리킴

# 3. 빌드 후 호스트 실행 (마이그레이션 + 서버 기동이 자동)
npm run build
npm run host                  # Local + Network 주소 출력, 최초 실행 시 DB 생성
```

핫 리로드가 필요한 개발 모드 (실행 시 마이그레이션도 적용):

```bash
npm run dev
```

## 디렉토리 구조

```
server/      호스트 프로그램: Next 핸들러 + Socket.IO 실시간 핸들러
src/app/     페이지 및 /api 라우트 핸들러
src/components/  UI: 채팅, 주사위, 캐릭터 시트, 스토리보드
src/lib/     prisma 클라이언트, anthropic 클라이언트, 주사위 로직, 소켓 클라이언트
src/types/   공유 Socket.IO 이벤트 계약
prisma/      데이터 모델 + 마이그레이션
data/        런타임에 임베디드 SQLite DB가 위치 (gitignore)
docs/        아키텍처 & 로드맵
```

자세한 내용은 [docs/architecture.md](docs/architecture.md) 참고.

## 라이선스

[MIT](LICENSE)
