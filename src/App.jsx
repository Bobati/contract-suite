// src/App.jsx
import React, { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from './hooks/useStorage.js';
import DocumentManager from './components/common/DocumentManager.jsx';
import ConflictApp from './components/conflict/ConflictApp.jsx';
import IssueAnalyzer from './components/analyzer/IssueAnalyzer.jsx';


// ── 앱 카드 정의 ─────────────────────────────────────────────────────────────
const APPS = [
  {
    id: 'conflict',
    title: '충돌 분석',
    subtitle: 'Contract Conflict Analyzer',
    description: '계약서 간 조항 충돌·위계 관계를 분석하고 리스크를 식별합니다.',
    icon: '⚡',
    color: '#ef4444',
    badge: 'HIGH RISK',
  },
  {
    id: 'analyzer',
    title: '이슈 분석기',
    subtitle: 'Contract Intelligence',
    description: '계약 이슈를 AI로 분석하고 협상 전략·대응 방안을 도출합니다.',
    icon: '🔍',
    color: '#3b82f6',
    badge: 'AI POWERED',
  },
];

export default function App() {
  const [activeApp, setActiveApp]         = useState(null); // null = home
  const [showDocs, setShowDocs]           = useState(false);

  // ── 공통 상태 (양쪽 앱에 내려줌) ──────────────────────────────────────────
  const [kbPatches, setKbPatches]         = useState([]);
  const [amendments, setAmendments]       = useState([]);
  const [kbLoaded, setKbLoaded]           = useState(false);

  // 스토리지 로드
  useEffect(() => {
    (async () => {
      try {
        const pRaw = await storage.get(STORAGE_KEYS.KB_PATCHES);
        if (pRaw) setKbPatches(JSON.parse(pRaw));

        const aRaw = await storage.get(STORAGE_KEYS.AMENDMENTS);
        if (aRaw) setAmendments(JSON.parse(aRaw));
      } catch (e) {
        console.warn('Storage load error:', e);
      } finally {
        setKbLoaded(true);
      }
    })();
  }, []);

  const handleKbUpdate = async (patches) => {
    setKbPatches(patches);
    await storage.set(STORAGE_KEYS.KB_PATCHES, JSON.stringify(patches));
  };

  const handleAmendmentsUpdate = async (list) => {
    setAmendments(list);
    await storage.set(STORAGE_KEYS.AMENDMENTS, JSON.stringify(list));
  };

  // ── 앱 진입 ─────────────────────────────────────────────────────────────
  if (activeApp === 'conflict') {
    return (
      <ConflictApp
        amendments={amendments}
        kbPatches={kbPatches}
        onAmendmentsChange={handleAmendmentsUpdate}
        onBack={() => setActiveApp(null)}
      />
    );
  }

  if (activeApp === 'analyzer') {
    return (
      <IssueAnalyzer
        amendments={amendments}
        kbPatches={kbPatches}
        onAmendmentsChange={handleAmendmentsUpdate}
        onKbUpdate={handleKbUpdate}
        onBack={() => setActiveApp(null)}
      />
    );
  }

  // ── 홈 화면 ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#080b12', color: '#e2e8f0',
                  fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* 헤더 */}
      <div style={{ borderBottom: '1px solid #1e2d40', padding: '0 32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Contract Suite
          </span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4,
                         border: '1px solid #3b82f6', color: '#60a5fa', letterSpacing: '0.08em' }}>
            KT–PALANTIR
          </span>
        </div>
        <button
          onClick={() => setShowDocs(v => !v)}
          style={{ background: showDocs ? '#1e3a5f' : 'transparent',
                   border: '1px solid ' + (showDocs ? '#3b82f6' : '#2d3f55'),
                   borderRadius: 8, padding: '6px 14px', color: showDocs ? '#60a5fa' : '#94a3b8',
                   fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          📁 문서 관리
          {(kbPatches.length > 0 || amendments.length > 0) && (
            <span style={{ background: '#3b82f6', color: '#fff', borderRadius: 10,
                           padding: '1px 6px', fontSize: 10 }}>
              {kbPatches.length + amendments.length}
            </span>
          )}
        </button>
      </div>

      {/* 문서 관리 패널 (토글) */}
      {showDocs && (
        <div style={{ borderBottom: '1px solid #1e2d40', background: '#0d1724' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 32px' }}>
            <DocumentManager
              kbPatches={kbPatches}
              amendments={amendments}
              onKbUpdate={handleKbUpdate}
              onAmendmentsUpdate={handleAmendmentsUpdate}
            />
          </div>
        </div>
      )}

      {/* 메인 — 앱 카드 */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>
            무엇을 분석하시겠습니까?
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>
            KT–Palantir 계약 인텔리전스 플랫폼
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {APPS.map(app => (
            <button
              key={app.id}
              onClick={() => setActiveApp(app.id)}
              style={{ background: '#0d1724', border: '1px solid #1e2d40',
                       borderRadius: 16, padding: '32px 28px', cursor: 'pointer',
                       color: '#e2e8f0', textAlign: 'left',
                       transition: 'all 0.15s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = app.color;
                e.currentTarget.style.background = '#111e30';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1e2d40';
                e.currentTarget.style.background = '#0d1724';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ position: 'absolute', top: 16, right: 16,
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                            color: app.color, border: `1px solid ${app.color}`,
                            borderRadius: 4, padding: '2px 6px' }}>
                {app.badge}
              </div>

              <div style={{ fontSize: 36, marginBottom: 16 }}>{app.icon}</div>

              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4,
                            letterSpacing: '-0.02em' }}>
                {app.title}
              </div>
              <div style={{ fontSize: 11, color: app.color, marginBottom: 14,
                            letterSpacing: '0.06em', fontWeight: 600 }}>
                {app.subtitle}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                {app.description}
              </div>

              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center',
                            gap: 6, color: app.color, fontSize: 13, fontWeight: 600 }}>
                진입하기 <span style={{ fontSize: 16 }}>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* 공통 문서 상태 요약 */}
        {kbLoaded && (kbPatches.length > 0 || amendments.length > 0) && (
          <div style={{ marginTop: 32, padding: '16px 20px', background: '#0d1724',
                        border: '1px solid #1e2d40', borderRadius: 10,
                        display: 'flex', gap: 24, fontSize: 13, color: '#64748b' }}>
            <span>📊 공유 데이터</span>
            <span style={{ color: '#94a3b8' }}>KB 패치 {kbPatches.length}건</span>
            <span style={{ color: '#94a3b8' }}>Amendment {amendments.length}건</span>
            <span style={{ color: '#4ade80', marginLeft: 'auto' }}>● 양쪽 앱에 적용됨</span>
          </div>
        )}
      </div>
    </div>
  );
}
