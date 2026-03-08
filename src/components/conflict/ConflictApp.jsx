// src/components/conflict/ConflictApp.jsx
// 충돌 분석 앱 — ContractIntelligence.jsx에서 이식
// props: amendments, kbPatches, onAmendmentsChange, onBack

import { useState, useEffect, useRef } from 'react';
import { callClaude } from '../../utils/api.js';
import { BASIC_CONFLICTS, BASIC_INTERNAL, EXTENDED_CONFLICTS,
         STATIC_AMENDMENTS, DOCUMENTS, DOC_OPTIONS,
         RISK_CONFIG, CATEGORY_COLOR } from '../../data/conflictData.js';
import { buildAmdPrompt } from '../../data/prompts.js';

function AddAmendmentModal({ onClose, onSave }) {
  const [inputMode, setInputMode] = useState("text"); // text | file
  const [textInput, setTextInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  // Manual form state
  const [manualTitle, setManualTitle] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10).replace(/-/g, "."));
  const [manualSummary, setManualSummary] = useState("");
  const [manualAffects, setManualAffects] = useState([]);
  const [manualType, setManualType] = useState("modification");
  const [useManual, setUseManual] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setFileContent(text);
      setTextInput(text.slice(0, 3000));
    };
    reader.readAsText(file, "utf-8");
  };

  const runParse = async () => {
    const input = textInput.trim();
    if (!input) return;
    setParsing(true); setError(""); setParsed(null);
    try {
      const result = await parseAmendment(input);
      setParsed(result);
    } catch (e) {
      setError("분석 실패: " + e.message);
    } finally {
      setParsing(false);
    }
  };

  const handleSave = () => {
    if (useManual) {
      const entry = {
        id: "AMD-" + Date.now(),
        title: manualTitle || "Amendment",
        date: manualDate,
        type: manualType,
        summary: manualSummary,
        affects: manualAffects,
        resolves: [],
        newRisk: "",
        clauses: "",
        status: "active",
        source: "manual",
        rawInput: manualSummary,
      };
      onSave(entry);
    } else if (parsed) {
      onSave(parsed);
    }
  };

  const canSave = useManual ? !!manualTitle : !!parsed;

  return (
    <div style={{ position:"fixed", inset:0, background:"#00000088", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#0f0f1a", border:"1px solid #1e2030", borderRadius:12, width:640, maxHeight:"85vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* HEADER */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #1a1a2e", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#60a5fa", boxShadow:"0 0 6px #60a5fa" }}/>
            <span style={{ fontSize:12, fontWeight:600, color:"#94a3b8", letterSpacing:"0.1em" }}>AMENDMENT 추가</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #1e2030", borderRadius:4, padding:"3px 10px", fontSize:11, color:"#475569", cursor:"pointer", fontFamily:"inherit" }}>닫기 ×</button>
        </div>

        <div style={{ overflowY:"auto", flex:1 }}>
          {/* MODE TABS */}
          <div style={{ display:"flex", borderBottom:"1px solid #1a1a2e", background:"#0a0a14" }}>
            {[["text","텍스트 입력"],["file","파일 업로드"],["manual","직접 작성"]].map(([m, label]) => (
              <button key={m} onClick={() => { setInputMode(m); setUseManual(m==="manual"); setParsed(null); setError(""); }} style={{ padding:"8px 16px", border:"none", background:"none", cursor:"pointer", fontSize:11, color:inputMode===m?"#e2e8f0":"#475569", borderBottom:inputMode===m?"2px solid #60a5fa":"2px solid transparent", fontFamily:"inherit" }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding:20 }}>
            {/* TEXT INPUT */}
            {inputMode === "text" && (
              <div>
                <div style={{ fontSize:10, color:"#475569", marginBottom:8 }}>Amendment 내용 또는 변경 사항을 자유롭게 입력하면 AI가 자동 분석합니다.</div>
                <textarea value={textInput} onChange={e => setTextInput(e.target.value)}
                  placeholder={"예) SAA §6.2의 치유 기간을 20일에서 30일로 변경하기로 합의함.\n    준거법을 한국법으로 명시하는 Amendment를 체결함.\n    TOS §8.4 서비스 정지 전 5영업일 사전 통보 의무 추가."}
                  style={{ width:"100%", background:"#07070f", border:"1px solid #1e2030", borderRadius:6, padding:"10px 12px", fontSize:11, color:"#e2e8f0", fontFamily:"inherit", resize:"none", height:160, outline:"none", lineHeight:1.7, boxSizing:"border-box" }}/>
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
                  <button onClick={runParse} disabled={!textInput.trim()||parsing} style={{ padding:"7px 18px", background:textInput.trim()&&!parsing?"#1e3a6e":"#0f1525", border:`1px solid ${textInput.trim()&&!parsing?"#60a5fa44":"#1e2030"}`, borderRadius:4, fontSize:11, fontWeight:600, color:textInput.trim()&&!parsing?"#60a5fa":"#334155", cursor:textInput.trim()&&!parsing?"pointer":"not-allowed", fontFamily:"inherit" }}>
                    {parsing ? "분석 중..." : "AI 분석 →"}
                  </button>
                </div>
              </div>
            )}

            {/* FILE UPLOAD */}
            {inputMode === "file" && (
              <div>
                <div style={{ fontSize:10, color:"#475569", marginBottom:12 }}>TXT 파일을 업로드하면 AI가 자동으로 내용을 분석합니다. (PDF/DOCX는 텍스트 추출 후 붙여넣기 권장)</div>
                <div onClick={() => fileRef.current?.click()} style={{ border:"1px dashed #1e3050", borderRadius:8, padding:"30px 20px", textAlign:"center", cursor:"pointer", background:"#0a0f1a", marginBottom:12 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#60a5fa44"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#1e3050"}>
                  <input ref={fileRef} type="file" accept=".txt,.md" onChange={handleFile} style={{ display:"none" }}/>
                  <div style={{ fontSize:24, marginBottom:8 }}>📄</div>
                  <div style={{ fontSize:12, color:"#475569" }}>{fileName || "파일을 클릭하거나 드롭하세요 (.txt, .md)"}</div>
                </div>
                {textInput && (
                  <>
                    <div style={{ fontSize:10, color:"#334155", marginBottom:6 }}>미리보기 (상위 500자)</div>
                    <div style={{ background:"#07070f", border:"1px solid #1e2030", borderRadius:6, padding:"10px 12px", fontSize:11, color:"#64748b", lineHeight:1.6, maxHeight:120, overflowY:"auto", marginBottom:10 }}>{textInput.slice(0,500)}</div>
                    <div style={{ display:"flex", justifyContent:"flex-end" }}>
                      <button onClick={runParse} disabled={parsing} style={{ padding:"7px 18px", background:!parsing?"#1e3a6e":"#0f1525", border:`1px solid ${!parsing?"#60a5fa44":"#1e2030"}`, borderRadius:4, fontSize:11, fontWeight:600, color:!parsing?"#60a5fa":"#334155", cursor:!parsing?"pointer":"not-allowed", fontFamily:"inherit" }}>
                        {parsing ? "분석 중..." : "AI 분석 →"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* MANUAL FORM */}
            {inputMode === "manual" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div>
                  <div style={{ fontSize:10, color:"#475569", marginBottom:5 }}>제목 *</div>
                  <input value={manualTitle} onChange={e => setManualTitle(e.target.value)} placeholder="Amendment 제목" style={{ width:"100%", background:"#07070f", border:"1px solid #1e2030", borderRadius:5, padding:"7px 10px", fontSize:11, color:"#e2e8f0", fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:5 }}>날짜</div>
                    <input value={manualDate} onChange={e => setManualDate(e.target.value)} placeholder="YYYY.MM.DD" style={{ width:"100%", background:"#07070f", border:"1px solid #1e2030", borderRadius:5, padding:"7px 10px", fontSize:11, color:"#e2e8f0", fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:5 }}>유형</div>
                    <select value={manualType} onChange={e => setManualType(e.target.value)} style={{ width:"100%", background:"#07070f", border:"1px solid #1e2030", borderRadius:5, padding:"7px 10px", fontSize:11, color:"#94a3b8", fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}>
                      <option value="modification">조항 수정</option>
                      <option value="addition">조항 추가</option>
                      <option value="termination">해지/종료</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"#475569", marginBottom:5 }}>내용 요약</div>
                  <textarea value={manualSummary} onChange={e => setManualSummary(e.target.value)} placeholder="변경 내용을 간략히 설명하세요." style={{ width:"100%", background:"#07070f", border:"1px solid #1e2030", borderRadius:5, padding:"7px 10px", fontSize:11, color:"#e2e8f0", fontFamily:"inherit", outline:"none", resize:"none", height:80, lineHeight:1.7, boxSizing:"border-box" }}/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"#475569", marginBottom:5 }}>영향 문서</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {DOC_OPTIONS.map(d => (
                      <button key={d} onClick={() => setManualAffects(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev,d])}
                        style={{ padding:"4px 10px", borderRadius:4, border:`1px solid ${manualAffects.includes(d)?"#60a5fa44":"#1e2030"}`, background:manualAffects.includes(d)?"#0f1e35":"transparent", fontSize:10, color:manualAffects.includes(d)?"#60a5fa":"#475569", cursor:"pointer", fontFamily:"inherit" }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ERROR */}
            {error && <div style={{ marginTop:12, padding:"8px 12px", background:"#1a0808", border:"1px solid #ff2d2044", borderRadius:6, fontSize:11, color:"#ff2d20" }}>{error}</div>}

            {/* PARSED RESULT PREVIEW */}
            {parsed && !useManual && (
              <div style={{ marginTop:16, background:"#0a0f1a", border:"1px solid #60a5fa33", borderRadius:8, padding:16 }}>
                <div style={{ fontSize:10, color:"#60a5fa", letterSpacing:"0.08em", marginBottom:12 }}>AI 분석 결과 — 저장 전 확인하세요</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  {[["제목", parsed.title],["날짜", parsed.date],["유형", parsed.type],["영향 문서", parsed.affects.join(", ")||"-"]].map(([k,v]) => (
                    <div key={k}>
                      <div style={{ fontSize:9, color:"#334155", marginBottom:3 }}>{k}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:9, color:"#334155", marginBottom:3 }}>요약</div>
                  <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.6 }}>{parsed.summary}</div>
                </div>
                {parsed.resolves?.length > 0 && (
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:9, color:"#10b981", marginBottom:3 }}>해소되는 충돌</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {parsed.resolves.map(id => <span key={id} style={{ fontSize:9, color:"#10b981", background:"#0a2a1a", padding:"2px 6px", borderRadius:3 }}>{id} ✓</span>)}
                    </div>
                  </div>
                )}
                {parsed.newRisk && parsed.newRisk !== "없음" && (
                  <div>
                    <div style={{ fontSize:9, color:"#f59e0b", marginBottom:3 }}>신규 리스크</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{parsed.newRisk}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding:"12px 20px", borderTop:"1px solid #1a1a2e", display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={onClose} style={{ padding:"7px 16px", background:"none", border:"1px solid #1e2030", borderRadius:4, fontSize:11, color:"#475569", cursor:"pointer", fontFamily:"inherit" }}>취소</button>
          <button onClick={handleSave} disabled={!canSave} style={{ padding:"7px 18px", background:canSave?"#1e3a6e":"#0f1525", border:`1px solid ${canSave?"#60a5fa44":"#1e2030"}`, borderRadius:4, fontSize:11, fontWeight:600, color:canSave?"#60a5fa":"#334155", cursor:canSave?"pointer":"not-allowed", fontFamily:"inherit" }}>
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConflictApp({ amendments: propAmendments, kbPatches, onAmendmentsChange, onBack }) {
  const [mode, setMode] = useState("basic");
  const [tab, setTab] = useState("dashboard");
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [animIn, setAnimIn] = useState(true);
  const [amendments, setAmendments] = useState(STATIC_AMENDMENTS);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load saved amendments from storage
  useEffect(() => {
    (async () => {
      try {
        const stored = await window.storage.get("amendments_v2");
        if (stored?.value) {
          const saved = JSON.parse(stored.value);
          setAmendments([...STATIC_AMENDMENTS, ...saved]);
        }
      } catch (e) {}
    })();
  }, []);

  const saveAmendment = async (entry) => {
    const userAmendments = amendments.filter(a => a.source !== "static");
    const updated = [...userAmendments, entry];
    try { await window.storage.set("amendments_v2", JSON.stringify(updated)); } catch (e) {}
    setAmendments([...STATIC_AMENDMENTS, ...updated]);
    setShowAddModal(false);
  };

  const deleteAmendment = async (id) => {
    const next = amendments.filter(a => a.id !== id);
    const userOnly = next.filter(a => a.source !== "static");
    try { await window.storage.set("amendments_v2", JSON.stringify(userOnly)); } catch (e) {}
    setAmendments(next);
  };

  const allConflicts = mode === "basic"
    ? [...BASIC_CONFLICTS, ...BASIC_INTERNAL]
    : [...BASIC_CONFLICTS, ...BASIC_INTERNAL, ...EXTENDED_CONFLICTS];

  // Mark resolved conflicts
  const resolvedIds = new Set(amendments.flatMap(a => a.resolves || []));

  const filteredConflicts = allConflicts.filter(c => {
    const matchRisk = riskFilter === "ALL" || c.risk === riskFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || (c.topic||c.title||"").toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.summary||c.conflict||"").toLowerCase().includes(q);
    return matchRisk && matchSearch;
  });

  const highCount   = allConflicts.filter(c => c.risk==="HIGH" && !resolvedIds.has(c.id)).length;
  const medCount    = allConflicts.filter(c => c.risk==="MEDIUM" && !resolvedIds.has(c.id)).length;
  const resolvedCount = resolvedIds.size;

  const switchMode = (m) => {
    setAnimIn(false);
    setTimeout(() => { setMode(m); setAnimIn(true); setSelectedConflict(null); }, 180);
  };

  return (
    <div style={{ fontFamily:"'IBM Plex Mono', monospace", background:"#0a0a0f", minHeight:"100vh", color:"#e2e8f0" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{ background:"#0f0f1a", borderBottom:"1px solid #1e2030", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#ff2d20", boxShadow:"0 0 8px #ff2d20" }}/>
          <span style={{ fontSize:13, fontWeight:600, letterSpacing:"0.12em", color:"#94a3b8" }}>CONTRACT INTELLIGENCE</span>
          <span style={{ fontSize:11, color:"#334155", marginLeft:4 }}>KT × Palantir Korea</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["dashboard","conflicts","documents","amendments"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:"4px 14px", borderRadius:4, border:"none", cursor:"pointer", fontSize:11, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", background:tab===t?"#1e2535":"transparent", color:tab===t?"#e2e8f0":"#475569", fontFamily:"inherit", transition:"all 0.15s" }}>
              {t}{t==="amendments" && amendments.filter(a=>a.source!=="static").length>0 ? ` (${amendments.filter(a=>a.source!=="static").length})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* MODE TOGGLE */}
      <div style={{ background:"#0c0c17", borderBottom:"1px solid #1a1a2e", padding:"10px 24px", display:"flex", alignItems:"center", gap:16 }}>
        <span style={{ fontSize:11, color:"#475569", letterSpacing:"0.1em" }}>분석 모드</span>
        <div style={{ display:"flex", background:"#0f0f1a", borderRadius:6, padding:3, border:"1px solid #1e2030" }}>
          {[["basic","기본 분석","계약 4종"],["extended","확장 분석","계약 + 내규 7종"]].map(([m,label,desc]) => (
            <button key={m} onClick={() => switchMode(m)} style={{ padding:"5px 14px", borderRadius:4, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:mode===m?(m==="extended"?"#1a1040":"#0f1e35"):"transparent", color:mode===m?(m==="extended"?"#a78bfa":"#60a5fa"):"#475569", fontFamily:"inherit", transition:"all 0.15s", display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
              <span>{label}</span>
              <span style={{ fontSize:9, fontWeight:400, opacity:0.7 }}>{desc}</span>
            </button>
          ))}
        </div>
        {resolvedCount > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", background:"#0a2a1a", borderRadius:4, border:"1px solid #0a4a2a" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981" }}/>
            <span style={{ fontSize:10, color:"#10b981" }}>Amendment로 {resolvedCount}건 해소됨</span>
          </div>
        )}
        {mode==="extended" && (
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", background:"#1a1040", borderRadius:4, border:"1px solid #4c1d95" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#a78bfa", animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:10, color:"#a78bfa" }}>KT 내규 7종 활성화 — {EXTENDED_CONFLICTS.length}건 추가 감지</span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ padding:24, opacity:animIn?1:0, transition:"opacity 0.18s" }}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
              {[
                { label:"총 미해소 충돌", value:allConflicts.length-resolvedCount, sub:`전체 ${allConflicts.length}건 중 ${resolvedCount}건 해소`, color:"#60a5fa", accent:"#1e3a5f" },
                { label:"HIGH RISK", value:highCount, sub:"즉각 조치 필요", color:"#ff2d20", accent:"#3f0f0f" },
                { label:"MEDIUM RISK", value:medCount, sub:"단기 조치 필요", color:"#f59e0b", accent:"#3f2f0f" },
                { label:"Amendment", value:amendments.length, sub:`기본 2건 + 추가 ${amendments.filter(a=>a.source!=="static").length}건`, color:"#10b981", accent:"#0f2f1f" },
              ].map(({ label,value,sub,color,accent }) => (
                <div key={label} style={{ background:"#0f0f1a", border:`1px solid ${accent}`, borderRadius:8, padding:"16px 20px" }}>
                  <div style={{ fontSize:11, color:"#475569", letterSpacing:"0.1em", marginBottom:8 }}>{label}</div>
                  <div style={{ fontSize:36, fontWeight:600, color, lineHeight:1, marginBottom:6 }}>{value}</div>
                  <div style={{ fontSize:11, color:"#334155" }}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
              {/* HIERARCHY */}
              <div style={{ background:"#0f0f1a", border:"1px solid #1e2030", borderRadius:8, padding:20 }}>
                <div style={{ fontSize:11, color:"#475569", letterSpacing:"0.1em", marginBottom:16 }}>문서 우선순위 (HIERARCHY)</div>
                {[
                  { rank:"①", label:"Order Form #3 / #4", desc:"개별 계약 조건 최우선", color:"#60a5fa", bg:"#0f1e35" },
                  { rank:"②", label:"SAA + Schedule A", desc:"파트너십 핵심 의무", color:"#818cf8", bg:"#131830" },
                  { rank:"③", label:"TOS (Terms of Service)", desc:"일반 약관 기본 적용", color:"#a78bfa", bg:"#16112a" },
                  { rank:"④", label:"KT 내규 7종", desc:"강행규정은 계약보다 우선 가능", color:"#34d399", bg:"#0a1f14", extended:true },
                ].filter(r => !r.extended || mode==="extended").map(({ rank,label,desc,color,bg }) => (
                  <div key={rank} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:bg, borderRadius:6, marginBottom:6, border:`1px solid ${color}22` }}>
                    <div style={{ fontSize:18, fontWeight:600, color, width:24, textAlign:"center" }}>{rank}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color }}>{label}</div>
                      <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CONFLICT MAP */}
              <div style={{ background:"#0f0f1a", border:"1px solid #1e2030", borderRadius:8, padding:20 }}>
                <div style={{ fontSize:11, color:"#475569", letterSpacing:"0.1em", marginBottom:16 }}>충돌 분포 (CONFLICT MAP)</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {[
                    { label:"준거법·중재", count:mode==="extended"?2:1, risk:"HIGH" },
                    { label:"지급·이자", count:mode==="extended"?3:1, risk:"HIGH" },
                    { label:"해지·치유", count:mode==="extended"?4:2, risk:"HIGH" },
                    { label:"서비스 정지", count:1, risk:"HIGH" },
                    { label:"정보보안", count:mode==="extended"?2:0, risk:mode==="extended"?"HIGH":"LOW" },
                    { label:"Liability", count:1, risk:"HIGH" },
                    { label:"면책 조항", count:1, risk:"MEDIUM" },
                    { label:"협력사 등록", count:mode==="extended"?2:0, risk:mode==="extended"?"MEDIUM":"LOW" },
                    { label:"예산·승인", count:mode==="extended"?3:0, risk:mode==="extended"?"MEDIUM":"LOW" },
                  ].map(({ label,count,risk }) => {
                    const cfg = RISK_CONFIG[count>0?risk:"LOW"]||RISK_CONFIG.LOW;
                    return (
                      <div key={label} style={{ background:count>0?cfg.bg+"15":"#0f0f1a", border:`1px solid ${count>0?cfg.bg+"44":"#1e2030"}`, borderRadius:6, padding:"10px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:18, fontWeight:600, color:count>0?cfg.bg:"#1e2030" }}>{count}</div>
                        <div style={{ fontSize:9, color:count>0?"#94a3b8":"#2d3748", marginTop:4, lineHeight:1.3 }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* HIGH RISK LIST */}
            <div style={{ background:"#0f0f1a", border:"1px solid #1e2030", borderRadius:8, padding:20 }}>
              <div style={{ fontSize:11, color:"#475569", letterSpacing:"0.1em", marginBottom:16 }}>즉각 조치 필요 (HIGH RISK — 미해소)</div>
              {allConflicts.filter(c => c.risk==="HIGH" && !resolvedIds.has(c.id)).slice(0,6).map(c => (
                <div key={c.id} onClick={() => { setTab("conflicts"); setSelectedConflict(c); }} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", background:"#130f0f", border:"1px solid #3f1515", borderRadius:6, cursor:"pointer", marginBottom:6, transition:"border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#ff2d2066"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#3f1515"}>
                  <div style={{ fontSize:10, fontWeight:600, color:"#ff2d20", background:"#2a0f0f", padding:"2px 6px", borderRadius:3, whiteSpace:"nowrap", marginTop:1 }}>{c.id}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0", marginBottom:3 }}>{c.topic||c.title}</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>{(c.summary||c.conflict||"").slice(0,80)}...</div>
                  </div>
                  <div style={{ fontSize:11, color:"#475569", marginTop:1 }}>→</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONFLICTS ── */}
        {tab==="conflicts" && (
          <div style={{ display:"grid", gridTemplateColumns:selectedConflict?"340px 1fr":"1fr", gap:16 }}>
            <div>
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                <input placeholder="검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex:1, background:"#0f0f1a", border:"1px solid #1e2030", borderRadius:6, padding:"7px 12px", fontSize:11, color:"#e2e8f0", outline:"none", fontFamily:"inherit" }}/>
                <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ background:"#0f0f1a", border:"1px solid #1e2030", borderRadius:6, padding:"7px 10px", fontSize:11, color:"#94a3b8", fontFamily:"inherit", outline:"none" }}>
                  {["ALL","HIGH","MEDIUM","LOW"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {["XC","IC","EC"].map(prefix => {
                const items = filteredConflicts.filter(c => c.id.startsWith(prefix));
                if (!items.length) return null;
                const label = prefix==="XC"?"교차 충돌":prefix==="IC"?"내부 충돌":"내규 충돌";
                return (
                  <div key={prefix} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:10, color:"#334155", letterSpacing:"0.12em", marginBottom:8 }}>{label}</div>
                    {items.map(c => {
                      const cfg = RISK_CONFIG[c.risk]||RISK_CONFIG.LOW;
                      const isSelected = selectedConflict?.id===c.id;
                      const isResolved = resolvedIds.has(c.id);
                      return (
                        <div key={c.id} onClick={() => setSelectedConflict(isSelected?null:c)}
                          style={{ padding:"10px 12px", background:isSelected?"#131a2a":"#0f0f1a", border:`1px solid ${isSelected?"#60a5fa44":isResolved?"#0a3a1a":"#1e2030"}`, borderRadius:6, cursor:"pointer", marginBottom:6, opacity:isResolved?0.5:1, transition:"all 0.12s" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                            <span style={{ fontSize:9, fontWeight:600, color:isResolved?"#10b981":cfg.bg, background:(isResolved?"#10b981":cfg.bg)+"22", padding:"1px 5px", borderRadius:2 }}>{isResolved?"해소":cfg.label}</span>
                            <span style={{ fontSize:10, color:"#475569" }}>{c.id}</span>
                            {c.category && <span style={{ fontSize:9, color:CATEGORY_COLOR[c.category]||"#94a3b8", background:(CATEGORY_COLOR[c.category]||"#94a3b8")+"15", padding:"1px 5px", borderRadius:2 }}>{c.category}</span>}
                            {isResolved && <span style={{ marginLeft:"auto", fontSize:9, color:"#10b981" }}>Amendment 해소 ✓</span>}
                          </div>
                          <div style={{ fontSize:12, fontWeight:500, color:isResolved?"#334155":"#cbd5e1" }}>{c.topic||c.title}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {selectedConflict && (() => {
              const c = selectedConflict;
              const cfg = RISK_CONFIG[c.risk]||RISK_CONFIG.LOW;
              const isResolved = resolvedIds.has(c.id);
              const resolvingAmds = amendments.filter(a => a.resolves?.includes(c.id));
              return (
                <div style={{ background:"#0f0f1a", border:`1px solid ${isResolved?"#10b98133":cfg.bg+"33"}`, borderRadius:8, padding:20, position:"sticky", top:24, maxHeight:"calc(100vh - 160px)", overflowY:"auto" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:isResolved?"#10b981":cfg.bg, background:(isResolved?"#10b981":cfg.bg)+"22", padding:"3px 8px", borderRadius:3 }}>{isResolved?"해소됨":cfg.label}</div>
                    <div style={{ fontSize:11, color:"#475569" }}>{c.id}</div>
                    <button onClick={() => setSelectedConflict(null)} style={{ marginLeft:"auto", background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:16 }}>×</button>
                  </div>
                  {isResolved && resolvingAmds.length>0 && (
                    <div style={{ marginBottom:14, padding:"8px 12px", background:"#0a2a1a", borderRadius:6, border:"1px solid #10b98133" }}>
                      <div style={{ fontSize:10, color:"#10b981", marginBottom:4 }}>해소 Amendment</div>
                      {resolvingAmds.map(a => <div key={a.id} style={{ fontSize:11, color:"#34d399" }}>{a.date} — {a.title}</div>)}
                    </div>
                  )}
                  <div style={{ fontSize:15, fontWeight:600, color:"#e2e8f0", marginBottom:16, lineHeight:1.4 }}>{c.topic||c.title}</div>
                  {(c.docA||c.reg) && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                      <div style={{ background:"#0a1525", border:"1px solid #1e3a5f", borderRadius:6, padding:12 }}>
                        <div style={{ fontSize:10, color:"#60a5fa", marginBottom:6, fontWeight:600 }}>{c.docA||c.reg}</div>
                        <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.5 }}>{c.regRule||c.clauseA||""}</div>
                      </div>
                      <div style={{ background:"#150a25", border:"1px solid #3a1e5f", borderRadius:6, padding:12 }}>
                        <div style={{ fontSize:10, color:"#a78bfa", marginBottom:6, fontWeight:600 }}>{c.docB||c.contract}</div>
                        <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.5 }}>{c.contractRule||c.clauseB||""}</div>
                      </div>
                    </div>
                  )}
                  {[
                    { label:"충돌 내용", content:c.summary||c.conflict },
                    { label:"판정", content:c.verdict, highlight:true, color:"#60a5fa" },
                    { label:"권고 조치", content:c.action||c.recommendation, highlight:true, color:"#34d399" },
                  ].filter(s=>s.content).map(({ label,content,highlight,color }) => (
                    <div key={label} style={{ marginBottom:10, padding:"10px 12px", background:highlight?color+"0a":"#0a0a0f", borderRadius:6, borderLeft:`2px solid ${color||"#334155"}44` }}>
                      <div style={{ fontSize:10, fontWeight:600, color:color||"#475569", marginBottom:4 }}>{label}</div>
                      <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>{content}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab==="documents" && (
          <div>
            <div style={{ fontSize:11, color:"#475569", letterSpacing:"0.1em", marginBottom:16 }}>레이어 A — 계약 문서</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:24 }}>
              {DOCUMENTS.filter(d=>d.layer==="A").map(d => {
                const cfg = RISK_CONFIG[d.risk]||RISK_CONFIG.LOW;
                return (
                  <div key={d.id} style={{ background:"#0f0f1a", border:`1px solid ${cfg.bg}33`, borderRadius:8, padding:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <span style={{ fontSize:9, color:cfg.bg, background:cfg.bg+"22", padding:"2px 6px", borderRadius:2, fontWeight:600 }}>{cfg.label}</span>
                      <span style={{ fontSize:9, color:"#334155" }}>{d.date}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0", marginBottom:4 }}>{d.name}</div>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:10, lineHeight:1.4 }}>{d.fullName}</div>
                    <div style={{ fontSize:11, color:"#334155" }}>{d.clauses}개 조항</div>
                  </div>
                );
              })}
            </div>
            {mode==="extended" && (
              <>
                <div style={{ fontSize:11, color:"#475569", letterSpacing:"0.1em", marginBottom:16 }}>레이어 B — KT 내규</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                  {DOCUMENTS.filter(d=>d.layer==="B").map(d => {
                    const cfg = RISK_CONFIG[d.risk]||RISK_CONFIG.LOW;
                    return (
                      <div key={d.id} style={{ background:"#0f0f1a", border:"1px solid #4c1d9533", borderRadius:8, padding:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                          <span style={{ fontSize:9, color:cfg.bg, background:cfg.bg+"22", padding:"2px 6px", borderRadius:2, fontWeight:600 }}>{cfg.label}</span>
                          <span style={{ fontSize:9, color:"#a78bfa", background:"#2d1b4e", padding:"2px 5px", borderRadius:2 }}>내규</span>
                        </div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0", marginBottom:4 }}>{d.name}</div>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:10 }}>{d.fullName}</div>
                        <div style={{ fontSize:11, color:"#334155" }}>{d.clauses}개 조항</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── AMENDMENTS ── */}
        {tab==="amendments" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:11, color:"#475569", letterSpacing:"0.1em" }}>계약 변경 이력 (AMENDMENT TRACKER)</div>
                <div style={{ fontSize:10, color:"#334155", marginTop:3 }}>총 {amendments.length}건 · 해소 충돌 {resolvedCount}건</div>
              </div>
              <button onClick={() => setShowAddModal(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 18px", background:"#0f1e35", border:"1px solid #60a5fa44", borderRadius:6, fontSize:11, fontWeight:600, color:"#60a5fa", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="#1e3a6e"}
                onMouseLeave={e => e.currentTarget.style.background="#0f1e35"}>
                <span style={{ fontSize:16, lineHeight:1 }}>+</span> Amendment 추가
              </button>
            </div>

            {/* TIMELINE */}
            <div style={{ position:"relative", paddingLeft:32, marginBottom:24 }}>
              <div style={{ position:"absolute", left:10, top:0, bottom:0, width:1, background:"#1e2030" }}/>
              {amendments.map((a) => {
                const isUser = a.source !== "static";
                const dotColor = isUser ? "#10b981" : "#60a5fa";
                return (
                  <div key={a.id} style={{ position:"relative", marginBottom:16 }}>
                    <div style={{ position:"absolute", left:-26, top:14, width:8, height:8, borderRadius:"50%", background:dotColor, border:"2px solid #0a0a0f", boxShadow:`0 0 6px ${dotColor}66` }}/>
                    <div style={{ background:"#0f0f1a", border:`1px solid ${isUser?"#10b98133":"#1e2030"}`, borderRadius:8, padding:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                        <span style={{ fontSize:9, color:dotColor, fontWeight:600 }}>{a.date}</span>
                        <span style={{ fontSize:11, fontWeight:600, color:"#e2e8f0" }}>{a.title}</span>
                        {isUser && <span style={{ fontSize:9, color:"#10b981", background:"#0a2a1a", padding:"2px 6px", borderRadius:3 }}>추가됨</span>}
                        <span style={{ fontSize:9, color:"#475569", background:"#1a1a2e", padding:"2px 6px", borderRadius:3, marginLeft:"auto" }}>{a.type}</span>
                        {isUser && <button onClick={() => deleteAmendment(a.id)} style={{ background:"none", border:"1px solid #3f1515", borderRadius:3, padding:"2px 7px", fontSize:9, color:"#ff2d20", cursor:"pointer", fontFamily:"inherit" }}>삭제</button>}
                      </div>
                      <div style={{ fontSize:11, color:"#64748b", lineHeight:1.6, marginBottom:8 }}>{a.summary}</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {a.affects?.map(d => <span key={d} style={{ fontSize:9, color:"#94a3b8", background:"#1a1a2e", padding:"2px 6px", borderRadius:3 }}>{d}</span>)}
                        {a.resolves?.map(id => <span key={id} style={{ fontSize:9, color:"#10b981", background:"#0a2a1a", padding:"2px 6px", borderRadius:3 }}>{id} 해소 ✓</span>)}
                        {a.newRisk && a.newRisk!=="없음" && <span style={{ fontSize:9, color:"#f59e0b", background:"#2a1f08", padding:"2px 6px", borderRadius:3 }}>신규 리스크</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:-26, top:12, width:8, height:8, borderRadius:"50%", background:"#1e2030", border:"2px solid #0a0a0f" }}/>
                <div onClick={() => setShowAddModal(true)} style={{ background:"#0a0a0f", border:"1px dashed #1e3050", borderRadius:8, padding:14, cursor:"pointer", textAlign:"center", transition:"border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#60a5fa44"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#1e3050"}>
                  <span style={{ fontSize:11, color:"#2d4a6a" }}>+ Amendment 추가하기</span>
                </div>
              </div>
            </div>

            {/* UNRESOLVED CONFLICTS */}
            <div style={{ background:"#0f0f1a", border:"1px solid #1e2030", borderRadius:8, padding:20 }}>
              <div style={{ fontSize:11, color:"#475569", letterSpacing:"0.1em", marginBottom:14 }}>미해소 충돌 — Amendment 필요</div>
              {allConflicts.filter(c => (c.action?.includes("Amendment")||c.recommendation?.includes("Amendment")) && !resolvedIds.has(c.id)).slice(0,6).map(c => {
                const cfg = RISK_CONFIG[c.risk]||RISK_CONFIG.LOW;
                return (
                  <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", marginBottom:6, background:"#0a0a0f", borderRadius:4 }}>
                    <span style={{ fontSize:9, color:cfg.bg, background:cfg.bg+"22", padding:"1px 5px", borderRadius:2, fontWeight:600 }}>{c.risk}</span>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>{c.topic||c.title}</span>
                    <span style={{ marginLeft:"auto", fontSize:10, color:"#334155" }}>Amendment 필요</span>
                  </div>
                );
              })}
              {allConflicts.filter(c => (c.action?.includes("Amendment")||c.recommendation?.includes("Amendment")) && !resolvedIds.has(c.id)).length === 0 && (
                <div style={{ textAlign:"center", padding:20, fontSize:12, color:"#10b981" }}>모든 Amendment 필요 충돌이 해소됐습니다 ✓</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showAddModal && <AddAmendmentModal onClose={() => setShowAddModal(false)} onSave={saveAmendment}/>}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0a0a0f}
        ::-webkit-scrollbar-thumb{background:#1e2030;border-radius:2px}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
