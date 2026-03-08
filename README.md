# Contract Suite

KT–Palantir 계약 인텔리전스 플랫폼

## 구조

```
contract-suite/
├── src/
│   ├── App.jsx                          # 홈 화면 + 공통 상태 관리
│   ├── main.jsx
│   ├── components/
│   │   ├── common/
│   │   │   └── DocumentManager.jsx      # KB/Amendment 공통 관리 (양쪽 앱에 적용)
│   │   ├── conflict/
│   │   │   └── ConflictApp.jsx          # 충돌 분석 앱
│   │   ├── analyzer/
│   │   │   └── IssueAnalyzer.jsx        # 이슈 분석기
│   │   ├── hurdle/
│   │   │   └── HurdleTracker.jsx        # Hurdle 이행 트래커
│   │   └── negotiation/
│   │       └── NegotiationSimulator.jsx # 협상 시뮬레이터
│   ├── data/
│   │   ├── contractKB.js                # 계약 KB 정적 데이터
│   │   ├── conflictData.js              # 충돌 분석 정적 데이터
│   │   └── prompts.js                   # Claude 프롬프트 + 유틸 함수
│   ├── hooks/
│   │   └── useStorage.js                # 스토리지 훅 (localStorage)
│   └── utils/
│       └── api.js                       # Claude API 호출 (백엔드 프록시 경유)
└── server/
    └── index.js                         # API 키 보호 프록시 서버
```

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 ANTHROPIC_API_KEY 입력

# 3. 프론트 + 서버 동시 실행
npm start

# 또는 별도로
npm run dev     # 프론트엔드 (포트 3000)
npm run server  # 백엔드 프록시 (포트 3001)
```

## 배포

### 프론트엔드 (Vercel)
```bash
npm run build
# Vercel에 dist/ 폴더 배포
# 환경변수: VITE_API_URL=https://your-backend.railway.app
```

### 백엔드 (Railway / Render)
```
환경변수 설정:
  ANTHROPIC_API_KEY=sk-ant-...
  FRONTEND_URL=https://your-app.vercel.app
  PORT=3001
```

## 공유 데이터 흐름

```
App.jsx (최상단)
  ├── storage에서 kb_patches_v1, amendments_v2 로드
  ├── DocumentManager ──→ KB/Amendment 수정 → storage 저장
  ├── ConflictApp     ←── amendments props 수신
  └── IssueAnalyzer   ←── kbPatches + amendments props 수신
```
