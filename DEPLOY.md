# Contract Suite — 배포 가이드

## 준비물
- GitHub 계정
- Vercel 계정 (github.com/vercel 에서 무료 가입)
- Anthropic API 키 (console.anthropic.com)

---

## Step 1. GitHub에 코드 올리기

```bash
# 압축 풀고 폴더 진입
unzip contract-suite.zip
cd contract-suite

# Git 초기화 & 업로드
git init
git add .
git commit -m "initial"

# GitHub에서 새 repository 만든 후 (이름 예: contract-suite)
git remote add origin https://github.com/YOUR_ID/contract-suite.git
git push -u origin main
```

---

## Step 2. Vercel에 배포

1. **vercel.com** 접속 → "Add New Project"
2. GitHub repository 선택 (contract-suite)
3. **Environment Variables** 항목에 추가:
   ```
   Name:  ANTHROPIC_API_KEY
   Value: sk-ant-xxxxxxxx...  ← 본인 키 입력
   ```
4. "Deploy" 클릭

몇 분 후 `https://contract-suite-xxxx.vercel.app` 형태의 URL이 생성됩니다.

---

## 로컬 실행 (배포 없이 테스트)

```bash
cd contract-suite
npm install

# .env 파일 생성
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# Vercel CLI로 로컬 실행 (api/chat.js 포함)
npx vercel dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 파일 구조

```
contract-suite/
├── api/
│   └── chat.js          ← Vercel Serverless Function (API 키 보호)
├── src/
│   ├── App.jsx           ← 홈 화면 + 공통 문서 상태
│   ├── components/
│   │   ├── common/DocumentManager.jsx   ← KB/Amendment (공통)
│   │   ├── conflict/ConflictApp.jsx     ← 충돌 분석
│   │   ├── analyzer/IssueAnalyzer.jsx   ← 이슈 분석기
│   │   ├── hurdle/HurdleTracker.jsx
│   │   └── negotiation/NegotiationSimulator.jsx
│   ├── data/
│   │   ├── contractKB.js
│   │   ├── conflictData.js
│   │   └── prompts.js
│   ├── hooks/useStorage.js
│   └── utils/api.js
├── vercel.json
└── package.json
```
