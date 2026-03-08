// src/components/analyzer/IssueAnalyzer.jsx
// Contract Intelligence 이슈 분석기
// props: amendments, kbPatches, onAmendmentsChange, onKbUpdate, onBack

import { useState, useEffect, useRef } from 'react';
import { callClaude } from '../../utils/api.js';
import { storage, STORAGE_KEYS } from '../../hooks/useStorage.js';
import { CONTRACT_KB, CLAUSE_FULLTEXT, DOC_TYPES, RISK_COLOR, RISK_BG, DOC_COLOR, URGENCY_COL } from '../../data/contractKB.js';
import { buildSystemPrompt, buildFollowupPrompt, applyPatchesToKB, buildReportHTML } from '../../data/prompts.js';

const SAMPLE_ISSUES = [
  "Palantir이 Appendix 7에 없는 고객에게 우리가 영업했다고 경고를 보냈다",
  "Palantir이 우리가 6개월 공들인 삼성전자에 직접 접촉해서 계약을 논의 중이다",
  "OF4 계약 즉시 지급 $4M을 예산 편성 없이 집행한 것 같다",
  "Azure 클라우드에 고객 데이터를 올리기 전에 CISO 승인을 받았는지 모르겠다",
  "Palantir이 TOS §8.4를 근거로 서비스를 즉시 정지시켰다",
  "계약 만료 전 Hurdle 달성이 어려울 것 같다. 어떻게 해야 하나",
];

function TypingDots() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"10px 14px"}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#60a5fa",animation:`bounce 1.2s ${i*0.2}s infinite`}}/>
      ))}
      <span style={{fontSize:11,color:"#8899aa",marginLeft:4}}>분석 중...</span>
    </div>
  );
}

function ClauseInlinePopup({ clauseId, children, onOpen }) {
  const [show, setShow] = useState(false);
  const data = CLAUSE_FULLTEXT[clauseId];
  const kb = CONTRACT_KB.clauses.find(c=>c.id===clauseId);
  const docColor = DOC_COLOR[data?.doc || kb?.doc] || "#60a5fa";
  const info = data || (kb ? {doc:kb.doc, section:kb.id, title:kb.topic, text:kb.core, context:null} : null);
  if (!info) return <span style={{color:docColor,fontWeight:700,cursor:"pointer"}} onClick={()=>onOpen&&onOpen(clauseId)}>{children}</span>;
  return (
    <span style={{position:"relative",display:"inline"}}
      onMouseEnter={()=>setShow(true)}
      onMouseLeave={()=>setShow(false)}
    >
      <span style={{color:docColor,fontWeight:700,borderBottom:"1px dashed "+docColor+"88",cursor:"pointer",paddingBottom:1}}
        onClick={()=>onOpen&&onOpen(clauseId)}>
        {children}
      </span>
      {show && (
        <span style={{position:"absolute",bottom:"calc(100% + 6px)",left:0,zIndex:200,minWidth:260,maxWidth:320,background:"#0d1220",border:`1px solid ${docColor}44`,borderRadius:6,padding:"8px 12px",boxShadow:"0 4px 20px #00000088",pointerEvents:"none"}}>
          <span style={{display:"block",fontSize:10,fontWeight:700,color:docColor,marginBottom:4}}>{info.doc} · {info.section}</span>
          <span style={{display:"block",fontSize:11,fontWeight:600,color:"#e2e8f0",marginBottom:4}}>{info.title}</span>
          <span style={{display:"block",fontSize:10,color:"#c8d0dc",lineHeight:1.6}}>{info.text?.slice(0,140)}{info.text?.length>140?"…":""}</span>
          {info.context && <span style={{display:"block",fontSize:10,color:docColor+"cc",marginTop:4,lineHeight:1.5}}>{info.context.slice(0,100)}{info.context.length>100?"…":""}</span>}
          <span style={{display:"block",fontSize:9,color:"#6677aa",marginTop:6}}>{"클릭하면 전체 원문 보기"}</span>
        </span>
      )}
    </span>
  );
}

function linkifyClauses(text, onOpen) {
  if (!text || typeof text !== "string") return text;


  const allIds = [
    ...Object.keys(CLAUSE_FULLTEXT),
    ...CONTRACT_KB.clauses.map(c => c.id),
  ].filter((v,i,a) => a.indexOf(v) === i);

  // 각 ID에 대해 여러 표기 변형 생성
  const patterns = [];
  for (const id of allIds) {
    patterns.push({ pat: id, id });
    // SAA-6.2 → SAA §6.2 / SAA§6.2 / SAA 6.2
    const m = id.match(/^(SAA|TOS|OF3|OF4|REG)-(.+)$/);
    if (m) {
      patterns.push({ pat: m[1] + " §" + m[2], id });
      patterns.push({ pat: m[1] + "§" + m[2], id });
      patterns.push({ pat: m[1] + " " + m[2], id });
      // §만 있는 경우: §6.2, §2.10
      patterns.push({ pat: "§" + m[2], id });
    }
  }
  // 긴 패턴 우선
  patterns.sort((a,b) => b.pat.length - a.pat.length);

  let segs = [{ text, matched: false }];
  for (const { pat, id } of patterns) {
    const next = [];
    for (const seg of segs) {
      if (seg.matched) { next.push(seg); continue; }
      const idx = seg.text.indexOf(pat);
      if (idx === -1) { next.push(seg); continue; }
      if (idx > 0) next.push({ text: seg.text.slice(0, idx), matched: false });
      next.push({ text: pat, matched: true, id });
      const rest = seg.text.slice(idx + pat.length);
      if (rest) next.push({ text: rest, matched: false });
    }
    segs = next;
  }

  const out = segs.map((seg, i) => {
    if (!seg.matched) return seg.text || null;
    return <ClauseInlinePopup key={i} clauseId={seg.id} onOpen={onOpen}>{seg.text}</ClauseInlinePopup>;
  }).filter(v => v !== null && v !== "");

  return out.some(v => typeof v !== "string") ? out : text;
}

function formatArgument(text, onOpen) {
  if (!text) return null;
  const parts = text.split(/(?=\([0-9]+\))/);
  if (parts.length <= 1) {
    return text.split("\n").map((l,i)=>(
      <span key={i}>{linkifyClauses(l, onOpen)}{i<text.split("\n").length-1&&<br/>}</span>
    ));
  }
  return parts.filter(p=>p.trim()).map((part, i) => {
    const m = part.match(/^\(([0-9]+)\)\s*([\s\S]*)/);
    if (!m) return <div key={i} style={{marginBottom:4}}>{linkifyClauses(part, onOpen)}</div>;
    return (
      <div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"flex-start"}}>
        <span style={{minWidth:20,height:20,borderRadius:"50%",background:"#1e3a6e",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#60a5fa",flexShrink:0,marginTop:1}}>{m[1]}</span>
        <span style={{lineHeight:1.7}}>{linkifyClauses(m[2].trim(), onOpen)}</span>
      </div>
    );
  });
}

function renderBold(text) {
  if (!text) return null;
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{color:"#e2e8f0",fontWeight:700}}>{part.slice(2,-2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderBoldLines(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => (
    <span key={i}>{renderBold(line)}{i < text.split("\n").length-1 && <br/>}</span>
  ));
}

function ClauseDrawer({ clauseId, onClose }) {
  const [tab, setTab] = useState("en");
  const data = CLAUSE_FULLTEXT[clauseId];
  if (!clauseId) return null;
  const docColor = DOC_COLOR[data?.doc] || "#c8d0dc";
  const hasTranslation = !!data?.translation;
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"#0a0a14",borderTop:`2px solid ${docColor}44`,boxShadow:"0 -8px 32px #00000088",maxHeight:"50vh",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 20px",borderBottom:"1px solid #1a1a2e",flexShrink:0}}>
        <span style={{fontSize:10,fontWeight:700,color:docColor,background:docColor+"18",padding:"2px 8px",borderRadius:3}}>{data?.doc}</span>
        <span style={{fontSize:11,fontWeight:600,color:"#c8d0dc"}}>{data?.section}</span>
        <span style={{fontSize:12,color:"#e2e8f0",fontWeight:500}}>{data?.title}</span>
        {hasTranslation && (
          <div style={{display:"flex",gap:4,marginLeft:12}}>
            {[["en","English"],["ko","한국어"],["both","병기"]].map(([v,l])=>(
              <button key={v} onClick={()=>setTab(v)} style={{padding:"2px 10px",fontSize:10,borderRadius:3,border:"1px solid "+(tab===v?docColor:"#1e2030"),background:tab===v?docColor+"22":"none",color:tab===v?docColor:"#8899aa",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
            ))}
          </div>
        )}
        <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"1px solid #1e2030",borderRadius:4,padding:"3px 10px",fontSize:11,color:"#8899aa",cursor:"pointer",fontFamily:"inherit"}}>{"닫기 ×"}</button>
      </div>
      <div style={{overflowY:"auto",padding:"14px 20px",display:"grid",gridTemplateColumns:(tab==="both"&&hasTranslation)?"1fr 1fr 1fr":"1fr 1fr",gap:16}}>
        {(tab==="en"||tab==="both") && (
          <div>
            <div style={{fontSize:10,color:"#6677aa",letterSpacing:"0.08em",marginBottom:8}}>{"조항 원문 (English)"}</div>
            <pre style={{fontSize:11,color:"#c8d0dc",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'IBM Plex Mono',monospace",margin:0,background:"#07070f",padding:"12px 14px",borderRadius:6,border:"1px solid #1a1a2e"}}>{data?.text || "원문 데이터 없음"}</pre>
          </div>
        )}
        {(tab==="ko"||tab==="both") && hasTranslation && (
          <div>
            <div style={{fontSize:10,color:"#6677aa",letterSpacing:"0.08em",marginBottom:8}}>{"한국어 번역"}</div>
            <div style={{fontSize:11,color:"#c8d0dc",lineHeight:1.9,background:"#07070f",padding:"12px 14px",borderRadius:6,border:`1px solid ${docColor}22`}}>
              {renderBoldLines(data.translation)}
            </div>
          </div>
        )}
        <div>
          <div style={{fontSize:10,color:"#6677aa",letterSpacing:"0.08em",marginBottom:8}}>분석 맥락</div>
          <div style={{fontSize:11,color:"#9aaabb",lineHeight:1.8,background:"#07070f",padding:"12px 14px",borderRadius:6,border:`1px solid ${docColor}22`}}>{data?.context || "-"}</div>
        </div>
      </div>
    </div>
  );
}

function ClauseCard({ clause, onViewFull }) {
  const urg = clause.urgency || "단기";
  const docColor = DOC_COLOR[clause.doc] || "#c8d0dc";
  const hasFullText = !!CLAUSE_FULLTEXT[clause.clause_id];
  return (
    <div style={{background:"#0a0a14",border:"1px solid #1e2035",borderRadius:6,padding:"10px 12px",marginBottom:6}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <span style={{fontSize:10,fontWeight:700,color:docColor,background:docColor+"18",padding:"2px 6px",borderRadius:3}}>{clause.clause_id}</span>
        <span style={{fontSize:10,color:"#c8d0dc",fontWeight:600}}>{clause.topic}</span>
        {(()=>{const kb=CONTRACT_KB.clauses.find(c=>c.id===clause.clause_id);return kb?._amended?<span style={{fontSize:8,color:"#a78bfa",background:"#a78bfa18",padding:"1px 5px",borderRadius:2,fontWeight:700}}>{"AMD"}</span>:kb?._new?<span style={{fontSize:8,color:"#10b981",background:"#10b98118",padding:"1px 5px",borderRadius:2,fontWeight:700}}>{"NEW"}</span>:null})()}
        <span style={{marginLeft:"auto",fontSize:10,color:URGENCY_COL[urg]||"#c8d0dc",background:(URGENCY_COL[urg]||"#c8d0dc")+"18",padding:"1px 6px",borderRadius:2}}>{urg}</span>
      </div>
      <div style={{fontSize:11,color:"#9aaabb",marginBottom:6}}>{clause.relevance}</div>
      <div style={{fontSize:11,color:"#c8d0dc",background:"#0f1525",padding:"6px 8px",borderRadius:4,borderLeft:`2px solid ${docColor}44`,marginBottom:8}}>{clause.kt_position}</div>
      {hasFullText && (
        <button onClick={()=>onViewFull(clause.clause_id)} style={{fontSize:10,color:docColor,background:docColor+"10",border:`1px solid ${docColor}33`,borderRadius:3,padding:"3px 10px",cursor:"pointer",fontFamily:"inherit",width:"100%"}}>
          {"조항 원문 보기"}
        </button>
      )}
    </div>
  );
}

function ActionCard({ action, index, onOpen }) {
  const colors=["#ff2d20","#f59e0b","#10b981","#60a5fa","#a78bfa"];
  const color=colors[index%colors.length];
  // clauses 필드 파싱: "SAA-6.2,TOS-8.4" → 배열
  const clauseIds = (action.clauses||"").split(",").map(s=>s.trim()).filter(s=>s && s!=="없음");
  return (
    <div style={{display:"flex",gap:10,padding:"10px 12px",background:"#0a0a14",borderRadius:6,border:`1px solid ${color}22`,marginBottom:6}}>
      <div style={{minWidth:56,textAlign:"center"}}>
        <div style={{fontSize:10,fontWeight:700,color,background:color+"18",padding:"3px 6px",borderRadius:3,marginBottom:3}}>{action.step}</div>
        <div style={{fontSize:9,color:"#6677aa"}}>{action.timeframe}</div>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,color:"#c8d0dc",lineHeight:1.6,paddingTop:2,marginBottom: clauseIds.length>0?6:0}}>
          {linkifyClauses(action.action, onOpen)}
        </div>
        {clauseIds.length>0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {clauseIds.map(cid=>{
              const kb = CONTRACT_KB.clauses.find(c=>c.id===cid);
              const dc = DOC_COLOR[kb?.doc] || "#60a5fa";
              return (
                <span key={cid}
                  onClick={()=>onOpen&&onOpen(cid)}
                  style={{fontSize:9,fontWeight:700,color:dc,background:dc+"18",border:"1px solid "+dc+"44",borderRadius:3,padding:"1px 7px",cursor:"pointer",userSelect:"none"}}
                  title={kb ? kb.topic : cid}
                >
                  {cid}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FollowupChat({ result, mode, amendments=[] }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, {role:"user",content:userMsg}];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          system: buildFollowupPrompt(mode, result, messages, amendments),
          messages:[{role:"user",content:userMsg}]
        })
      });
      if (!res.ok) throw new Error("API "+res.status);
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("").trim();
      setMessages([...newMessages,{role:"assistant",content:text}]);
    } catch(e) {
      setMessages([...newMessages,{role:"assistant",content:"오류가 발생했습니다: "+e.message}]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{background:"#0a0a14",border:"1px solid #1e2030",borderRadius:8,overflow:"hidden"}}>
      <div style={{padding:"10px 14px",borderBottom:"1px solid #1a1a2e",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#60a5fa",boxShadow:"0 0 6px #60a5fa"}}/>
        <span style={{fontSize:11,color:"#8899aa",letterSpacing:"0.08em"}}>후속 질문</span>
        <span style={{fontSize:10,color:"#475569"}}>{"어떤 탭에서든 분석 내용에 대해 자유롭게 질문하세요"}</span>
      </div>
      {messages.length > 0 && (
        <div style={{maxHeight:280,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"85%",padding:"8px 12px",borderRadius:6,background:m.role==="user"?"#0f1e35":"#0f0f1a",border:`1px solid ${m.role==="user"?"#1e3a5f":"#1e2030"}`,fontSize:13,color:"#c8d0dc",lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:"#0f0f1a",border:"1px solid #1e2030",borderRadius:6,padding:"4px 8px"}}><TypingDots/></div></div>}
          <div ref={bottomRef}/>
        </div>
      )}
      <div style={{padding:"10px 12px",borderTop: messages.length>0 ? "1px solid #1a1a2e" : "none",display:"flex",gap:8}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder="이 분석에 대해 추가 질문..."
          style={{flex:1,background:"#07070f",border:"1px solid #1e2030",borderRadius:4,padding:"7px 10px",fontSize:11,color:"#e2e8f0",fontFamily:"inherit",outline:"none"}}
        />
        <button onClick={send} disabled={!input.trim()||loading} style={{padding:"7px 14px",background:input.trim()&&!loading?"#1e3a6e":"#0f1525",border:`1px solid ${input.trim()&&!loading?"#60a5fa44":"#1e2030"}`,borderRadius:4,fontSize:11,color:input.trim()&&!loading?"#60a5fa":"#6677aa",cursor:input.trim()&&!loading?"pointer":"not-allowed",fontFamily:"inherit"}}>
          전송
        </button>
      </div>
    </div>
  );
}

function AnalysisResult({ result, query, mode, amendments=[] }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [viewingClause, setViewingClause] = useState(null);
  const riskColor = RISK_COLOR[result.risk_level] || "#10b981";
  const riskBg    = RISK_BG[result.risk_level]    || "#082a14";

  const sections = [
    {id:"overview", label:"개요"},
    {id:"clauses",  label:`관련 조항 (${result.triggered_clauses?.length||0})`},
    {id:"analysis", label:"법적 분석"},
    {id:"actions",  label:`조치 (${result.immediate_actions?.length||0})`},
  ];

  return (
    <>
      <div style={{background:"#0d0d1a",border:`1px solid ${riskColor}33`,borderRadius:10,overflow:"hidden",marginBottom: viewingClause ? "46vh" : 0}}>
        {/* HEADER */}
        <div style={{background:riskBg,padding:"14px 18px",borderBottom:`1px solid ${riskColor}22`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",background:riskColor+"22",border:`1px solid ${riskColor}44`,borderRadius:4}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:riskColor,boxShadow:`0 0 6px ${riskColor}`}}/>
              <span style={{fontSize:12,fontWeight:700,color:riskColor,letterSpacing:"0.1em"}}>{result.risk_level} RISK</span>
            </div>
            <span style={{fontSize:11,color:"#8899aa"}}>{result.triggered_clauses?.length||0}개 조항 · {result.related_conflicts?.length||0}개 충돌 연결</span>
          </div>
          <div style={{fontSize:14,color:"#f0f4f8",fontWeight:500,lineHeight:1.5}}>{result.situation_summary}</div>
        </div>
        {/* TABS */}
        <div style={{display:"flex",borderBottom:"1px solid #1a1a2e",background:"#0a0a14"}}>
          {sections.map(s=>(
            <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{padding:"8px 14px",border:"none",background:"none",cursor:"pointer",fontSize:11,color:activeSection===s.id?"#e2e8f0":"#8899aa",borderBottom:activeSection===s.id?"2px solid #60a5fa":"2px solid transparent",fontFamily:"inherit",transition:"all 0.12s"}}>
              {s.id==="chat" ? <span style={{color:activeSection==="chat"?"#60a5fa":"#2d5a8a"}}>💬 {s.label}</span> : s.label}
            </button>
          ))}
        </div>
        <div style={{padding:16}}>
          {/* OVERVIEW */}
          {activeSection==="overview" && (
            <div>
              <div style={{padding:"10px 14px",background:"#0a0a0f",borderRadius:6,borderLeft:`3px solid ${riskColor}`,marginBottom:12}}>
                <div style={{fontSize:11,color:"#8899aa",marginBottom:4,letterSpacing:"0.08em"}}>BOTTOM LINE</div>
                <div style={{fontSize:14,color:"#f0f4f8",fontWeight:500,lineHeight:1.6}}>{result.bottom_line}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div style={{background:"#0a1020",border:"1px solid #1e3050",borderRadius:6,padding:12}}>
                  <div style={{fontSize:11,color:"#60a5fa",marginBottom:8,fontWeight:700}}>KT 방어 논거</div>
                  <div style={{fontSize:13,color:"#c8d0dc",lineHeight:1.7}}>{formatArgument(result.kt_defense, setViewingClause)}</div>
                </div>
                <div style={{background:"#100a0a",border:"1px solid #3f1515",borderRadius:6,padding:12}}>
                  <div style={{fontSize:11,color:"#ff2d20",marginBottom:8,fontWeight:700}}>Palantir 측 논거</div>
                  <div style={{fontSize:13,color:"#c8d0dc",lineHeight:1.7}}>{formatArgument(result.palantir_position, setViewingClause)}</div>
                </div>
              </div>
              {result.related_conflicts?.length>0 && (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                    <div style={{fontSize:10,color:"#8899aa"}}>연결된 기존 충돌</div>
                    <span title="이번 이슈가 시스템에 등록된 기존 충돌(XC/IC/EC) 중 어떤 것과 관련있는지 AI가 판단한 결과입니다." style={{fontSize:9,color:"#60a5fa",background:"#0f1e35",border:"1px solid #1e3a6e",borderRadius:"50%",width:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"help",flexShrink:0}}>{"?"}</span>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {result.related_conflicts.map(cid=>(
                      <span key={cid} style={{fontSize:10,color:"#f59e0b",background:"#2a1f08",padding:"3px 8px",borderRadius:3,border:"1px solid #3a2a08"}}>{cid}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* CLAUSES */}
          {activeSection==="clauses" && (
            <div>
              {result.triggered_clauses?.length>0
                ? result.triggered_clauses.map((c,i)=><ClauseCard key={i} clause={c} onViewFull={setViewingClause}/>)
                : <div style={{fontSize:12,color:"#6677aa",textAlign:"center",padding:20}}>관련 조항 없음</div>
              }
            </div>
          )}
          {/* ANALYSIS */}
          {activeSection==="analysis" && (
            <div>
              <div style={{fontSize:11,color:"#9aaabb",marginBottom:8,letterSpacing:"0.08em"}}>위험도 판단 근거</div>
              <div style={{padding:"10px 14px",background:"#0a0a0f",borderRadius:6,borderLeft:`2px solid ${riskColor}44`,marginBottom:14}}>
                <div style={{fontSize:13,color:"#c8d0dc",lineHeight:1.7}}>{result.risk_reason}</div>
              </div>
              <div style={{fontSize:11,color:"#9aaabb",marginBottom:8,letterSpacing:"0.08em"}}>법적 효과 분석</div>
              <div style={{padding:"10px 14px",background:"#0a0a0f",borderRadius:6}}>
                <div style={{fontSize:13,color:"#c8d0dc",lineHeight:1.8,whiteSpace:"pre-line"}}>{result.legal_analysis}</div>
              </div>
            </div>
          )}
          {/* ACTIONS */}
          {activeSection==="actions" && (
            <div>
              {result.immediate_actions?.length>0
                ? result.immediate_actions.map((a,i)=><ActionCard key={i} action={a} index={i} onOpen={setViewingClause}/>)
                : <div style={{fontSize:12,color:"#6677aa",textAlign:"center",padding:20}}>조치 사항 없음</div>
              }
            </div>
          )}

        </div>
      </div>
      {/* CLAUSE DRAWER */}
      {viewingClause && <ClauseDrawer clauseId={viewingClause} onClose={()=>setViewingClause(null)}/>}

      {/* FOLLOWUP CHAT — 모든 탭 하단 고정 */}
      <div style={{marginTop:10}}>
        <FollowupChat result={result} mode={mode} amendments={amendments}/>
      </div>

      {/* REPORT BUTTON */}
      <ReportButton result={result} query={query} mode={mode}/>
    </>
  );
}

function HistoryTab({ history, onSelect, onDelete, onUpdateMemo, onClear }) {
  const [filter, setFilter]     = useState("all");   // all | HIGH | MEDIUM | LOW
  const [editingId, setEditingId] = useState(null);
  const [editMemo, setEditMemo] = useState("");
  const [search, setSearch]     = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = history.filter(h => {
    const matchRisk = filter === "all" || h.result?.risk_level === filter;
    const matchSearch = !search.trim() ||
      h.query.toLowerCase().includes(search.toLowerCase()) ||
      (h.memo||"").toLowerCase().includes(search.toLowerCase()) ||
      (h.result?.situation_summary||"").toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchSearch;
  });

  const startEdit = (h, e) => {
    e.stopPropagation();
    setEditingId(h.id);
    setEditMemo(h.memo || "");
  };

  const saveEdit = (id, e) => {
    e.stopPropagation();
    onUpdateMemo(id, editMemo);
    setEditingId(null);
  };

  const selected = history.find(h => h.id === selectedId);

  return (
    <div style={{display:"grid", gridTemplateColumns:"320px 1fr", height:"100%", overflow:"hidden"}}>

      {/* ── 왼쪽: 목록 ── */}
      <div style={{borderRight:"1px solid #1a1a2e", display:"flex", flexDirection:"column", overflow:"hidden", background:"#0a0a14"}}>

        {/* 검색 + 필터 */}
        <div style={{padding:"12px 14px", borderBottom:"1px solid #1a1a2e"}}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="이슈 내용, 메모 검색..."
            style={{width:"100%", background:"#0f0f1a", border:"1px solid #1e2030", borderRadius:4,
              padding:"6px 10px", fontSize:10, color:"#e2e8f0", fontFamily:"inherit",
              outline:"none", boxSizing:"border-box", marginBottom:8}}
          />
          <div style={{display:"flex", gap:4}}>
            {[["all","전체"], ["HIGH","HIGH"], ["MEDIUM","MED"], ["LOW","LOW"]].map(([v,label]) => {
              const c = v==="HIGH"?"#ff2d20":v==="MEDIUM"?"#f59e0b":v==="LOW"?"#10b981":"#8899aa";
              return (
                <button key={v} onClick={()=>setFilter(v)}
                  style={{flex:1, padding:"4px 0", borderRadius:3, border:`1px solid ${filter===v?c+"88":"#1e2030"}`,
                    background:filter===v?c+"15":"transparent", color:filter===v?c:"#6677aa",
                    fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit"}}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 건수 + 전체삭제 */}
        <div style={{padding:"6px 14px", borderBottom:"1px solid #1a1a2e", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <span style={{fontSize:9, color:"#475569"}}>
            {filtered.length}건 {filter!=="all"||search?`/ 전체 ${history.length}건`:""}
          </span>
          {history.length > 0 && (
            <button onClick={()=>{if(confirm("전체 히스토리를 삭제할까요?")) onClear();}}
              style={{fontSize:9, color:"#475569", background:"none", border:"1px solid #1e2030",
                borderRadius:3, padding:"2px 8px", cursor:"pointer", fontFamily:"inherit"}}>
              전체 삭제
            </button>
          )}
        </div>

        {/* 히스토리 목록 */}
        <div style={{flex:1, overflowY:"auto", padding:"8px 10px"}}>
          {filtered.length === 0 ? (
            <div style={{textAlign:"center", padding:"30px 0", fontSize:10, color:"#475569"}}>
              {history.length === 0 ? "분석 기록이 없습니다" : "검색 결과 없음"}
            </div>
          ) : filtered.map(h => {
            const rc = RISK_COLOR[h.result?.risk_level] || "#8899aa";
            const isSelected = selectedId === h.id;
            return (
              <div key={h.id}
                onClick={()=>{ setSelectedId(h.id); onSelect(h); }}
                style={{marginBottom:6, borderRadius:5, padding:"9px 10px", cursor:"pointer",
                  border:`1px solid ${isSelected?rc+"55":"#1e2030"}`,
                  background:isSelected?rc+"08":"#0f0f1a"}}>

                {/* 상단: 위험도 + 날짜 + 삭제 */}
                <div style={{display:"flex", alignItems:"center", gap:5, marginBottom:4}}>
                  <span style={{fontSize:9, fontWeight:700, color:rc,
                    background:rc+"18", padding:"1px 6px", borderRadius:2}}>
                    {h.result?.risk_level}
                  </span>
                  {h.memo && (
                    <span style={{fontSize:8, color:"#a78bfa", background:"#a78bfa18",
                      padding:"1px 5px", borderRadius:2}}>메모</span>
                  )}
                  <span style={{fontSize:8, color:"#475569", marginLeft:"auto"}}>{h.ts}</span>
                  <button onClick={e=>{e.stopPropagation(); if(confirm("이 항목을 삭제할까요?")) onDelete(h.id);}}
                    style={{background:"none", border:"none", color:"#475569", cursor:"pointer",
                      fontSize:13, padding:"0 2px", fontFamily:"inherit", lineHeight:1}}>×</button>
                </div>

                {/* 이슈 내용 */}
                <div style={{fontSize:10, color:"#c8d0dc", lineHeight:1.4, marginBottom:4}}>
                  {h.query.length > 60 ? h.query.slice(0,60)+"…" : h.query}
                </div>

                {/* 메모 표시/편집 */}
                {editingId === h.id ? (
                  <div onClick={e=>e.stopPropagation()} style={{marginTop:4}}>
                    <textarea
                      value={editMemo} onChange={e=>setEditMemo(e.target.value)}
                      autoFocus
                      style={{width:"100%", background:"#0a0a14", border:"1px solid #a78bfa44",
                        borderRadius:3, padding:"4px 6px", fontSize:9, color:"#e2e8f0",
                        fontFamily:"inherit", resize:"none", height:52, outline:"none", boxSizing:"border-box"}}
                    />
                    <div style={{display:"flex", gap:4, marginTop:3}}>
                      <button onClick={e=>saveEdit(h.id,e)}
                        style={{flex:1, fontSize:9, background:"#1a1040", border:"1px solid #a78bfa44",
                          color:"#a78bfa", borderRadius:3, padding:"3px", cursor:"pointer", fontFamily:"inherit"}}>저장</button>
                      <button onClick={e=>{e.stopPropagation();setEditingId(null);}}
                        style={{flex:1, fontSize:9, background:"none", border:"1px solid #1e2030",
                          color:"#6677aa", borderRadius:3, padding:"3px", cursor:"pointer", fontFamily:"inherit"}}>취소</button>
                    </div>
                  </div>
                ) : (
                  <div style={{display:"flex", alignItems:"flex-start", gap:6}}>
                    {h.memo && (
                      <div style={{fontSize:9, color:"#a78bfa", flex:1, lineHeight:1.4}}>
                        {h.memo.length>50?h.memo.slice(0,50)+"…":h.memo}
                      </div>
                    )}
                    <button onClick={e=>startEdit(h,e)}
                      style={{background:"none", border:"1px solid #1e2030", borderRadius:3,
                        padding:"1px 6px", fontSize:8, color:"#475569", cursor:"pointer",
                        fontFamily:"inherit", whiteSpace:"nowrap", marginLeft:"auto"}}>
                      {h.memo ? "메모 수정" : "메모 추가"}
                    </button>
                  </div>
                )}

                {/* 조항 수 / 충돌 수 */}
                <div style={{display:"flex", gap:8, marginTop:4, fontSize:8, color:"#475569"}}>
                  <span>조항 {h.result?.triggered_clauses?.length||0}개</span>
                  <span>충돌 {h.result?.related_conflicts?.length||0}건</span>
                  <span style={{marginLeft:"auto", color:h.mode==="extended"?"#a78bfa":"#60a5fa"}}>
                    {h.mode==="extended"?"확장":"기본"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 오른쪽: 선택된 분석 결과 ── */}
      <div style={{overflowY:"auto", padding:20}}>
        {selected ? (
          <div>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
              <span style={{fontSize:10, color:"#6677aa"}}>이슈</span>
              <span style={{fontSize:11, color:"#9aaabb", background:"#0f0f1a", border:"1px solid #1e2030",
                borderRadius:4, padding:"3px 9px", flex:1}}>{selected.query}</span>
              <span style={{fontSize:9, color:"#475569"}}>{selected.ts}</span>
            </div>
            {selected.memo && (
              <div style={{marginBottom:12, padding:"8px 12px", background:"#0f0a20",
                border:"1px solid #a78bfa33", borderRadius:5, fontSize:10, color:"#a78bfa", lineHeight:1.5}}>
                📝 {selected.memo}
              </div>
            )}
            <AnalysisResult result={selected.result} query={selected.query} mode={selected.mode} amendments={[]}/>
          </div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", height:"60%", gap:8}}>
            <div style={{fontSize:30, opacity:0.2}}>📋</div>
            <div style={{fontSize:11, color:"#475569", textAlign:"center", lineHeight:1.8}}>
              왼쪽에서 분석 기록을 선택하면<br/>결과와 리포트를 다시 볼 수 있습니다
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



function ReportButton(){return null;}

export default function IssueAnalyzer({ amendments: propAmendments = [], kbPatches: propKbPatches = [], onAmendmentsChange, onKbUpdate, onBack }) {
  const [appTab, setAppTab]           = useState("docs");   // "docs" | "analyze"
  const [mode, setMode]               = useState("basic");
  const [input, setInput]             = useState("");
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [activeHistory, setActiveHistory] = useState(null);
  const [amendments, setAmendments]   = useState([]);
  const [kbSummary, setKbSummary]     = useState({ clauses: CONTRACT_KB.clauses.length, conflicts: CONTRACT_KB.conflicts.length });

  useEffect(()=>{
    (async()=>{
      try {
        await loadAndApplyStoredPatches();
        await loadDynamicKB();
        setKbSummary({ clauses: CONTRACT_KB.clauses.length, conflicts: CONTRACT_KB.conflicts.length });
        const s = await window.storage.get("issue_history");
        if (s?.value) setHistory(JSON.parse(s.value));
      } catch(e){}
    })();
  },[]);

  const handleAmendmentsChange = (list) => { setAmendments(list); };
  const handleKBUpdated = ({ clauses, conflicts }) => {
    setKbSummary({ clauses: clauses.length, conflicts: conflicts.length });
  };

  const saveHistory = async (h) => {
    try { await window.storage.set("issue_history", JSON.stringify(h.slice(-50))); } catch(e){}
  };

  const deleteHistory = async (id) => {
    const nh = history.filter(h => h.id !== id);
    setHistory(nh);
    if (activeHistory === id) setActiveHistory(null);
    await saveHistory(nh);
  };

  const updateMemo = async (id, memo) => {
    const nh = history.map(h => h.id === id ? {...h, memo} : h);
    setHistory(nh);
    await saveHistory(nh);
  };

  const clearHistory = async () => {
    setHistory([]); setActiveHistory(null);
    try { await window.storage.delete("issue_history"); } catch(e){}
  };

  const analyze = async () => {
    if (!input.trim()||loading) return;
    const query = input.trim();
    setInput(""); setLoading(true); setError(null); setActiveHistory(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:2000,
          system:buildSystemPrompt(mode, amendments),
          messages:[{role:"user",content:query}]
        })
      });
      if (!res.ok) { const t=await res.text(); throw new Error("API "+res.status+": "+t.slice(0,100)); }
      const data = await res.json();
      if (data.error) throw new Error(data.error.message||JSON.stringify(data.error));
      const text = data.content?.map(b=>b.text||"").join("").trim();
      if (!text) throw new Error("빈 응답");

      const getField = (tag) => { const m=text.match(new RegExp("##"+tag+"##\\s*([^\\n#][^\\n]*)","i")); return m?m[1].trim():""; };
      const getClauses = () => text.split("\n").filter(l=>l.trim().startsWith("##CLAUSE##")).map(line=>{
        const raw=line.replace(/^##CLAUSE##\s*/,""); const obj={};
        raw.split("|").forEach(p=>{const eq=p.indexOf("=");if(eq>-1)obj[p.slice(0,eq).trim()]=p.slice(eq+1).trim();});
        return {clause_id:obj.clause_id||"",doc:obj.doc||"",topic:obj.topic||"",relevance:obj.relevance||"",kt_position:obj.kt_position||"",urgency:obj.urgency||"단기"};
      }).filter(c=>c.clause_id);
      const getActions = () => text.split("\n").filter(l=>l.trim().startsWith("##ACTION##")).map(line=>{
        const raw=line.replace(/^##ACTION##\s*/,""); const obj={};
        raw.split("|").forEach(p=>{const eq=p.indexOf("=");if(eq>-1)obj[p.slice(0,eq).trim()]=p.slice(eq+1).trim();});
        return {step:obj.step||"",timeframe:obj.timeframe||"",action:obj.action||"",clauses:obj.clauses||""};
      }).filter(a=>a.action);
      const conflictsRaw = getField("CONFLICTS");
      const riskRaw = getField("RISK").toUpperCase();
      const result = {
        situation_summary: getField("SUMMARY")||query,
        risk_level: ["HIGH","MEDIUM","LOW"].includes(riskRaw)?riskRaw:"MEDIUM",
        risk_reason: getField("RISK_REASON")||"-",
        legal_analysis: getField("LEGAL")||"-",
        kt_defense: getField("KT_DEFENSE")||"-",
        palantir_position: getField("PALANTIR")||"-",
        bottom_line: getField("BOTTOM_LINE")||"-",
        related_conflicts: conflictsRaw&&conflictsRaw!=="없음"?conflictsRaw.split(",").map(s=>s.trim()).filter(Boolean):[],
        triggered_clauses: getClauses(),
        immediate_actions: getActions()
      };
      const entry={id:Date.now(),query,result,mode,ts:new Date().toLocaleString("ko-KR")};
      const nh=[entry,...history];
      setHistory(nh); setActiveHistory(entry.id); await saveHistory(nh);
    } catch(e) {
      setError("오류: "+e.message);
    } finally { setLoading(false); }
  };

  const current = history.find(h=>h.id===activeHistory);

  return (
    <div style={{fontFamily:"'IBM Plex Mono',monospace",background:"#07070f",height:"100vh",display:"flex",flexDirection:"column",color:"#e2e8f0",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" rel="stylesheet"/>

      {/* ── 헤더 ── */}
      <div style={{background:"#0a0a14",borderBottom:"1px solid #1a1a2e",padding:"0 20px",display:"flex",alignItems:"center",gap:16,height:48,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#60a5fa",boxShadow:"0 0 8px #60a5fa"}}/>
          <span style={{fontSize:12,fontWeight:600,letterSpacing:"0.1em",color:"#c8d0dc"}}>{"CONTRACT INTELLIGENCE"}</span>
          <span style={{fontSize:10,color:"#6677aa"}}>{"KT × Palantir Korea"}</span>
        </div>

        {/* 상단 탭 */}
        <div style={{display:"flex",gap:1,background:"#0f0f1a",borderRadius:5,padding:3,border:"1px solid #1e2030",marginLeft:8}}>
          {[["docs","📂 문서 관리"],["analyze","🔍 이슈 분석"],["hurdle","📊 Hurdle"],["timeline","📜 변경 이력"],["history","📋 히스토리"]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setAppTab(tab)}
              style={{padding:"4px 14px",borderRadius:3,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit",transition:"all 0.12s",
                background:appTab===tab?"#1e3a6e":"transparent",
                color:appTab===tab?"#60a5fa":"#8899aa",
                position:"relative"}}>
              {label}
              {tab==="history" && history.length>0 && (
                <span style={{position:"absolute",top:0,right:2,fontSize:7,background:"#60a5fa",
                  color:"#07070f",borderRadius:"50%",width:12,height:12,
                  display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>
                  {history.length > 9 ? "9+" : history.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* KB 상태 배지 */}
        <div style={{display:"flex",gap:8,marginLeft:"auto",alignItems:"center"}}>
          <span style={{fontSize:9,color:"#475569"}}>KB</span>
          <span style={{fontSize:10,color:"#60a5fa",background:"#60a5fa12",padding:"2px 8px",borderRadius:3,border:"1px solid #60a5fa22"}}>
            조항 {kbSummary.clauses}
          </span>
          <span style={{fontSize:10,color:kbSummary.conflicts>0?"#ff2d20":"#10b981",
            background:kbSummary.conflicts>0?"#ff2d2012":"#10b98112",
            padding:"2px 8px",borderRadius:3,border:`1px solid ${kbSummary.conflicts>0?"#ff2d2022":"#10b98122"}`}}>
            충돌 {kbSummary.conflicts}
          </span>
          {appTab==="analyze" && <>
            <div style={{width:1,height:20,background:"#1e2030",margin:"0 4px"}}/>
            <div style={{display:"flex",background:"#0f0f1a",borderRadius:4,padding:2,border:"1px solid #1e2030"}}>
              {[["basic","기본"],["extended","확장"]].map(([m,label])=>(
                <button key={m} onClick={()=>setMode(m)} style={{padding:"3px 10px",borderRadius:2,border:"none",cursor:"pointer",fontSize:9,fontWeight:600,
                  background:mode===m?(m==="extended"?"#1a1040":"#0f1e35"):"transparent",
                  color:mode===m?(m==="extended"?"#a78bfa":"#60a5fa"):"#8899aa",fontFamily:"inherit"}}>{label}</button>
              ))}
            </div>

          </>}
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div style={{flex:1,overflow:"hidden"}}>

        {/* 문서 관리 탭 */}
        {appTab==="docs" && (
          <DocumentManagerTab
            onKBUpdated={handleKBUpdated}
            onAmendmentsFromUpload={(list) => {
              // 문서관리 탭에서 AMD 업로드 시 amendments state 갱신
              const merged = [...list, ...amendments.filter(a => !list.find(l=>l.id===a.id))];
              setAmendments(merged);
            }}
          />
        )}

        {/* 변경 이력 탭 */}
        {appTab==="timeline" && (
          <ClauseTimelineTab/>
        )}

        {/* 허들 트래커 탭 */}
        {appTab==="hurdle" && (
          <HurdleTracker/>
        )}

        {/* 히스토리 탭 */}
        {appTab==="history" && (
          <HistoryTab
            history={history}
            onSelect={h=>{ setActiveHistory(h.id); setAppTab("analyze"); }}
            onDelete={deleteHistory}
            onUpdateMemo={updateMemo}
            onClear={clearHistory}
          />
        )}

        {/* 이슈 분석 탭 */}
        {appTab==="analyze" && (
          <div style={{display:"grid",gridTemplateColumns:"280px 1fr",height:"100%"}}>
            {/* 왼쪽 */}
            <div style={{background:"#0a0a14",borderRight:"1px solid #1a1a2e",display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{padding:14,borderBottom:"1px solid #1a1a2e"}}>
                <textarea value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>(e.metaKey||e.ctrlKey)&&e.key==="Enter"&&analyze()}
                  placeholder={"계약 관련 상황을 자유롭게 입력하세요.\n\n예) Palantir이 우리 고객에게 직접 접근했다\n    서비스가 갑자기 정지됐다"}
                  style={{width:"100%",background:"#0f0f1a",border:"1px solid #1e2030",borderRadius:6,padding:"9px 11px",
                    fontSize:11,color:"#e2e8f0",fontFamily:"inherit",resize:"none",height:120,outline:"none",lineHeight:1.7,boxSizing:"border-box"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7}}>
                  <span style={{fontSize:9,color:"#1e2d3d"}}>⌘+Enter</span>
                  <button onClick={analyze} disabled={!input.trim()||loading}
                    style={{padding:"6px 14px",background:input.trim()&&!loading?"#1e3a6e":"#0f1525",
                      border:`1px solid ${input.trim()&&!loading?"#60a5fa44":"#1e2030"}`,borderRadius:4,fontSize:11,fontWeight:600,
                      color:input.trim()&&!loading?"#60a5fa":"#6677aa",cursor:input.trim()&&!loading?"pointer":"not-allowed",fontFamily:"inherit"}}>
                    {"분석"}
                  </button>
                </div>
              </div>
              <div style={{padding:"8px 14px",borderBottom:"1px solid #1a1a2e"}}>
                <AmendmentManager onAmendmentsChange={handleAmendmentsChange}/>
              </div>
              <div style={{padding:"8px 14px",borderBottom:"1px solid #1a1a2e"}}>
                <div style={{fontSize:10,color:"#1e2d3d",marginBottom:6}}>샘플 이슈</div>
                {SAMPLE_ISSUES.map((s,i)=>(
                  <button key={i} onClick={()=>setInput(s)}
                    style={{textAlign:"left",background:"none",border:"1px solid #1a1a2a",borderRadius:4,padding:"5px 7px",
                      fontSize:10,color:"#8899aa",cursor:"pointer",fontFamily:"inherit",lineHeight:1.4,width:"100%",marginBottom:3}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#2a3a5a";e.currentTarget.style.color="#c8d0dc";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="#1a1a2a";e.currentTarget.style.color="#8899aa";}}>
                    {s.length>40?s.slice(0,40)+"…":s}
                  </button>
                ))}
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"8px 14px"}}>
                {history.length>0 && <>
                  <div style={{fontSize:10,color:"#1e2d3d",marginBottom:6}}>기록 ({history.length})</div>
                  {history.map(h=>{
                    const rc=RISK_COLOR[h.result?.risk_level]||"#8899aa";
                    return (
                      <div key={h.id} onClick={()=>setActiveHistory(h.id===activeHistory?null:h.id)}
                        style={{padding:"7px 9px",borderRadius:5,border:`1px solid ${activeHistory===h.id?rc+"44":"#1a1a2a"}`,
                          background:activeHistory===h.id?rc+"08":"transparent",cursor:"pointer",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                          <div style={{width:5,height:5,borderRadius:"50%",background:rc}}/>
                          <span style={{fontSize:9,color:rc,fontWeight:600}}>{h.result?.risk_level}</span>
                          {h.memo && <span style={{fontSize:8,color:"#a78bfa"}}>●</span>}
                          <span style={{fontSize:9,color:"#1e2d3d",marginLeft:"auto"}}>{h.ts}</span>
                        </div>
                        <div style={{fontSize:10,color:"#8899aa",lineHeight:1.4}}>{h.query.length>38?h.query.slice(0,38)+"…":h.query}</div>
                      </div>
                    );
                  })}
                </>}
              </div>
            </div>

            {/* 오른쪽 */}
            <div style={{overflowY:"auto",padding:20}}>
              {loading && <div style={{background:"#0d0d1a",border:"1px solid #1e2035",borderRadius:10,padding:16,marginBottom:16}}><TypingDots/></div>}
              {error && <div style={{background:"#1a0808",border:"1px solid #ff2d2044",borderRadius:8,padding:12,marginBottom:16,fontSize:11,color:"#ff2d20"}}>{error}</div>}
              {current && !loading && (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <span style={{fontSize:10,color:"#6677aa"}}>입력 이슈</span>
                    <span style={{fontSize:11,color:"#9aaabb",background:"#0f0f1a",border:"1px solid #1e2030",borderRadius:4,padding:"3px 9px",flex:1}}>{current.query}</span>
                    <span style={{fontSize:9,color:current.mode==="extended"?"#a78bfa":"#60a5fa",background:current.mode==="extended"?"#1a1040":"#0f1e35",padding:"2px 6px",borderRadius:3}}>{current.mode==="extended"?"확장":"기본"}</span>
                  </div>
                  <AnalysisResult result={current.result} query={current.query} mode={current.mode} amendments={amendments}/>
                </div>
              )}
              {!current && !loading && (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60%",gap:10}}>
                  <div style={{width:40,height:40,borderRadius:"50%",border:"1px solid #1e2030",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:12,height:12,borderRadius:"50%",background:"#1e2030"}}/>
                  </div>
                  <div style={{fontSize:12,color:"#6677aa",textAlign:"center",lineHeight:2}}>
                    상황을 입력하면 관련 조항, 법적 효과, 즉각 조치를 분석합니다<br/>
                    <span style={{fontSize:10,color:"#475569"}}>KB 조항 {kbSummary.clauses}개 · 충돌 {kbSummary.conflicts}건 로드됨</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}} *{box-sizing:border-box} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e2030} textarea::placeholder{color:#1e2d3d}`}</style>
    </div>
  );
}
