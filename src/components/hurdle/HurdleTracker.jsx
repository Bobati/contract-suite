// src/components/hurdle/HurdleTracker.jsx
// KT-Palantir Hurdle 이행 트래커

import { useState } from 'react';
import { callClaude } from '../../utils/api.js';

const HURDLE_TARGET  = 55_000_000;  // KT가 보유한 라이선스 총량 ($50M 선구매 + $5M 추가)

const PURCHASE_SCHEDULE = [         // KT → Palantir 연간 선구매 (SAA 고정 스케줄, 합계 $50M)
  { year: 1, amount: 8_000_000,  bonus: 0,         label: "Y1" },
  { year: 2, amount: 10_000_000, bonus: 0,         label: "Y2" },
  { year: 3, amount: 10_000_000, bonus: 0,         label: "Y3" },
  { year: 4, amount: 11_000_000, bonus: 0,         label: "Y4" },
  { year: 5, amount: 11_000_000, bonus: 5_000_000, label: "Y5" }, // Y5: +$5M 추가 라이선스
];

export default function HurdleTracker() {
  const STORAGE_KEY    = "hurdle_data_v3";
  const PURCHASE_KEY   = "hurdle_purchase_v1";

  // 파트너 Revenue 실적 레코드
  const [records,    setRecords]    = useState([]);
  // 연간 선구매 실제 지급 여부
  const [purchased,  setPurchased]  = useState({});  // { "1": true, "2": false, ... }
  // 계약 시작 연도
  const [startYear,  setStartYear]  = useState(2025);
  const [showForm,   setShowForm]   = useState(false);
  const [activeTab,  setActiveTab]  = useState("revenue"); // "revenue" | "purchase"
  // form: 계약 기간·연도별 지급 포함
  // yearlyAmounts: ["1500000","2000000",...] 계약 기간만큼
  const EMPTY_FORM = { date:"", years:"1", yearlyAmounts:[""], customer:"", customerType:"Target Market", note:"" };
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [editId,     setEditId]     = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const s1 = await window.storage.get(STORAGE_KEY);
        if (s1?.value) {
          const parsed = JSON.parse(s1.value);
          setRecords(parsed.records || []);
          setStartYear(parsed.startYear || 2025);
        }
        const s2 = await window.storage.get(PURCHASE_KEY);
        if (s2?.value) setPurchased(JSON.parse(s2.value));
      } catch(e) {}
    })();
  }, []);

  const saveRecords = async (recs, sy) => {
    try { await window.storage.set(STORAGE_KEY, JSON.stringify({ records: recs, startYear: sy })); } catch(e) {}
  };
  const savePurchased = async (p) => {
    try { await window.storage.set(PURCHASE_KEY, JSON.stringify(p)); } catch(e) {}
  };

  // ── Revenue 실적 계산 ──────────────────────────────────────────────────────
  const totalRevenue   = records.reduce((s, r) => s + (r.amount || 0), 0);
  const remaining      = Math.max(0, HURDLE_TARGET - totalRevenue);
  const pct            = Math.min(100, (totalRevenue / HURDLE_TARGET) * 100);
  const riskLevel      = pct >= 100 ? "달성" : pct >= 70 ? "LOW" : pct >= 40 ? "MEDIUM" : "HIGH";
  const riskColor      = { 달성:"#10b981", LOW:"#10b981", MEDIUM:"#f59e0b", HIGH:"#ff2d20" }[riskLevel];

  // ── 선구매 계산 ────────────────────────────────────────────────────────────
  const totalPurchased = PURCHASE_SCHEDULE.reduce((s, p) => purchased[p.year] ? s + p.amount : s, 0);
  const totalLicense   = PURCHASE_SCHEDULE.reduce((s, p) => purchased[p.year] ? s + p.amount + p.bonus : s, 0);
  const unusedLicense  = Math.max(0, totalLicense - totalRevenue);

  const fmt = (n) => n >= 1_000_000 ? `$${(n/1_000_000).toFixed(1)}M` : `$${n.toLocaleString()}`;

  // Revenue 월별 누적
  const monthlyData = (() => {
    const sorted = [...records].sort((a,b) => a.date.localeCompare(b.date));
    const map = {};
    for (const r of sorted) {
      const ym = r.date.slice(0,7);
      map[ym] = (map[ym]||0) + r.amount;
    }
    let cum = 0;
    return Object.entries(map).map(([ym, amt]) => {
      cum += amt;
      return { label: ym, amount: amt, cumulative: cum };
    });
  })();
  const maxCum = Math.max(HURDLE_TARGET, ...monthlyData.map(d=>d.cumulative), 1);

  const addOrUpdate = async () => {
    if (!form.date || !form.yearlyAmounts.length) return;
    const yearlyParsed = form.yearlyAmounts.map(a => parseFloat(String(a).replace(/,/g,'')) || 0);
    const amount = yearlyParsed.reduce((s,v)=>s+v, 0);
    if (amount <= 0) return;
    const record = { ...form, amount, yearlyAmounts: yearlyParsed, years: parseInt(form.years)||1 };
    let newRecs;
    if (editId) {
      newRecs = records.map(r => r.id === editId ? { ...r, ...record, id: r.id } : r);
      setEditId(null);
    } else {
      newRecs = [...records, { id: Date.now(), ...record }];
    }
    setRecords(newRecs);
    await saveRecords(newRecs, startYear);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const deleteRecord = async (id) => {
    const newRecs = records.filter(r => r.id !== id);
    setRecords(newRecs);
    await saveRecords(newRecs, startYear);
  };

  const startEdit = (r) => {
    const yrs = r.years || 1;
    const ya = r.yearlyAmounts && r.yearlyAmounts.length === yrs
      ? r.yearlyAmounts.map(String)
      : Array(yrs).fill(String(Math.round(r.amount / yrs)));
    setForm({ date:r.date, years:String(yrs), yearlyAmounts:ya,
      customer:r.customer||"", customerType:r.customerType||"Target Market", note:r.note||"" });
    setEditId(r.id); setShowForm(true);
  };

  const togglePurchased = async (year) => {
    const next = { ...purchased, [year]: !purchased[year] };
    setPurchased(next);
    await savePurchased(next);
  };

  const ctColor = { "Target Market":"#60a5fa", "KT그룹":"#34d399" };

  return (
    <div style={{height:"100%", overflowY:"auto", padding:24, background:"#07070f"}}>
      <div style={{maxWidth:960, margin:"0 auto"}}>

        {/* 타이틀 */}
        <div style={{marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16}}>
          <div>
            <div style={{fontSize:14, fontWeight:700, color:"#c8d0dc", marginBottom:4}}>Hurdle 달성 트래커</div>
            <div style={{fontSize:10, color:"#475569", lineHeight:1.7}}>
              SAA §6.3 — KT 라이선스 총량: <span style={{color:"#60a5fa"}}>{fmt(HURDLE_TARGET)}</span>
              &nbsp;(선구매 $50M + Y5 추가 $5M) &nbsp;|&nbsp; 미달성 해지 시 Surviving QRC good faith 협상
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{fontSize:9, color:"#475569"}}>계약 시작</span>
            <input type="number" value={startYear} onChange={e=>{ setStartYear(+e.target.value); saveRecords(records,+e.target.value); }}
              style={{width:64, background:"#0f0f1a", border:"1px solid #1e2030", borderRadius:4,
                padding:"4px 6px", fontSize:11, color:"#e2e8f0", fontFamily:"inherit", outline:"none", textAlign:"center"}}/>
          </div>
        </div>

        {/* ── 요약 카드 4개 ── */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:20}}>
          {[
            { label:"선구매 누적",    value:fmt(totalPurchased), sub:`${fmt(50_000_000)} 목표`,   color:"#a78bfa" },
            { label:"확보 라이선스",  value:fmt(totalLicense),   sub:`미사용 ${fmt(unusedLicense)}`, color:"#34d399" },
            { label:"Revenue 달성",  value:fmt(totalRevenue),   sub:`${pct.toFixed(1)}% / Hurdle`, color:riskColor },
            { label:"Hurdle 상태",   value:riskLevel,           sub:riskLevel==="달성"?"QRC 협상력 확보":"미달 시 협상 불리", color:riskColor },
          ].map((c,i) => (
            <div key={i} style={{background:"#0a0a14", border:`1px solid ${c.color}33`, borderRadius:8, padding:"12px 14px"}}>
              <div style={{fontSize:9, color:"#6677aa", marginBottom:5}}>{c.label}</div>
              <div style={{fontSize:18, fontWeight:700, color:c.color, marginBottom:3}}>{c.value}</div>
              <div style={{fontSize:8, color:"#475569"}}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* ── 내부 탭 ── */}
        <div style={{display:"flex", borderBottom:"1px solid #1a1a2e", marginBottom:16, gap:0}}>
          {[["revenue","📈 Revenue 실적 (Hurdle)"],["purchase","💳 연간 선구매 스케줄"]].map(([k,label])=>(
            <button key={k} onClick={()=>setActiveTab(k)}
              style={{padding:"8px 18px", fontSize:11, fontWeight:600, border:"none", cursor:"pointer",
                fontFamily:"inherit", background:"transparent",
                borderBottom:activeTab===k?"2px solid #60a5fa":"2px solid transparent",
                color:activeTab===k?"#60a5fa":"#6677aa"}}>
              {label}
            </button>
          ))}
        </div>

        {/* ══════════ Revenue 탭 ══════════ */}
        {activeTab==="revenue" && (<>

          {/* 프로그레스 바 */}
          <div style={{marginBottom:16, background:"#0a0a14", border:"1px solid #1e2030", borderRadius:8, padding:16}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
              <span style={{fontSize:10, color:"#8899aa", fontWeight:600}}>Hurdle 달성률</span>
              <span style={{fontSize:10, color:riskColor, fontWeight:700}}>{fmt(totalRevenue)} / {fmt(HURDLE_TARGET)}</span>
            </div>
            <div style={{background:"#0f0f1a", borderRadius:4, height:14, overflow:"hidden", position:"relative"}}>
              <div style={{position:"absolute", height:"100%", borderRadius:4,
                background:`linear-gradient(90deg, ${riskColor}88, ${riskColor})`,
                width:`${pct}%`, transition:"width 0.4s"}}/>
              <div style={{position:"absolute", left:"70%", top:0, width:1, height:"100%", background:"#f59e0b66"}}/>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", marginTop:4, fontSize:8, color:"#2a3a4a"}}>
              <span>$0</span>
              <span style={{color:"#f59e0b55"}}>70% ($38.5M)</span>
              <span>{fmt(HURDLE_TARGET)}</span>
            </div>
          </div>

          {/* 월별 추이 그래프 */}
          {monthlyData.length > 0 && (
            <div style={{marginBottom:16, background:"#0a0a14", border:"1px solid #1e2030", borderRadius:8, padding:16}}>
              <div style={{fontSize:10, color:"#8899aa", fontWeight:600, marginBottom:12}}>월별 누적 Revenue 추이</div>
              <svg width="100%" viewBox={`0 0 ${Math.max(monthlyData.length*72,300)} 140`} style={{overflow:"visible"}}>
                <line x1="0" y1={110*(1-HURDLE_TARGET/maxCum)} x2="100%" y2={110*(1-HURDLE_TARGET/maxCum)}
                  stroke="#ff2d2055" strokeWidth="1" strokeDasharray="4,3"/>
                <text x="4" y={110*(1-HURDLE_TARGET/maxCum)-4} fontSize="8" fill="#ff2d2088">$55M</text>
                {monthlyData.map((d,i) => {
                  const W = Math.max(monthlyData.length*72,300);
                  const x = monthlyData.length===1 ? W/2 : (i/(monthlyData.length-1))*(W-40)+20;
                  const y = 110*(1-d.cumulative/maxCum);
                  const bH = 110*(d.amount/maxCum);
                  return (
                    <g key={d.label}>
                      <rect x={x-12} y={110-bH} width={24} height={bH} fill="#60a5fa18" rx="2"/>
                      <circle cx={x} cy={y} r="4" fill="#60a5fa"/>
                      <text x={x} y={130} fontSize="7" fill="#475569" textAnchor="middle">{d.label}</text>
                      <text x={x} y={y-8} fontSize="7" fill="#60a5fa" textAnchor="middle">{fmt(d.cumulative)}</text>
                    </g>
                  );
                })}
                {monthlyData.length > 1 && (
                  <polyline
                    points={monthlyData.map((d,i)=>{
                      const W=Math.max(monthlyData.length*72,300);
                      const x=monthlyData.length===1?W/2:(i/(monthlyData.length-1))*(W-40)+20;
                      return `${x},${110*(1-d.cumulative/maxCum)}`;
                    }).join(" ")}
                    fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round"/>
                )}
              </svg>
            </div>
          )}

          {/* 입력 폼 */}
          <div style={{marginBottom:12, display:"flex", justifyContent:"flex-end"}}>
            <button onClick={()=>{ setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }}
              style={{padding:"6px 16px", background:"#1e3a6e", border:"1px solid #60a5fa44",
                borderRadius:5, color:"#60a5fa", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit"}}>
              {showForm?"닫기":"+ 실적 입력"}
            </button>
          </div>
          {showForm && (
            <div style={{marginBottom:14, padding:16, background:"#0a0a14", border:"1px solid #1e2030", borderRadius:8}}>
              {/* 1행: 체결일 / 고객 유형 / 고객사 / 계약기간 / 내용 */}
              <div style={{display:"grid", gridTemplateColumns:"140px 130px 1fr 100px 1fr", gap:10, marginBottom:12, alignItems:"end"}}>
                <div>
                  <div style={{fontSize:9, color:"#6677aa", marginBottom:4}}>계약 체결일</div>
                  <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}
                    style={{width:"100%",background:"#0f0f1a",border:"1px solid #1e2030",borderRadius:4,
                      padding:"6px 8px",fontSize:11,color:"#e2e8f0",fontFamily:"inherit",outline:"none",
                      boxSizing:"border-box",colorScheme:"dark"}}/>
                </div>
                <div>
                  <div style={{fontSize:9, color:"#6677aa", marginBottom:4}}>고객 유형</div>
                  <select value={form.customerType} onChange={e=>setForm({...form,customerType:e.target.value})}
                    style={{width:"100%",background:"#0f0f1a",border:"1px solid #1e2030",borderRadius:4,
                      padding:"6px 8px",fontSize:11,color:"#e2e8f0",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}>
                    {["Target Market","KT그룹"].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:9, color:"#6677aa", marginBottom:4}}>고객사</div>
                  <input value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}
                    placeholder="현대자동차"
                    style={{width:"100%",background:"#0f0f1a",border:"1px solid #1e2030",borderRadius:4,
                      padding:"6px 8px",fontSize:11,color:"#e2e8f0",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{fontSize:9, color:"#6677aa", marginBottom:4}}>계약 기간</div>
                  <select value={form.years} onChange={e=>{
                    const y = parseInt(e.target.value)||1;
                    const prev = form.yearlyAmounts;
                    const next = Array(y).fill("").map((_,i)=>prev[i]||"");
                    setForm({...form, years:String(y), yearlyAmounts:next});
                  }}
                    style={{width:"100%",background:"#0f0f1a",border:"1px solid #1e2030",borderRadius:4,
                      padding:"6px 8px",fontSize:11,color:"#e2e8f0",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}>
                    {[1,2,3,4,5].map(y=><option key={y} value={y}>{y}년</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:9, color:"#6677aa", marginBottom:4}}>계약 내용</div>
                  <input value={form.note} onChange={e=>setForm({...form,note:e.target.value})}
                    placeholder="플랫폼 라이선스"
                    style={{width:"100%",background:"#0f0f1a",border:"1px solid #1e2030",borderRadius:4,
                      padding:"6px 8px",fontSize:11,color:"#e2e8f0",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
                </div>
              </div>

              {/* 2행: 연도별 지급액 */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:9, color:"#6677aa", marginBottom:6}}>
                  연도별 지급액 (USD) &nbsp;
                  <span style={{color:"#2a3a4a"}}>
                    총액: ${form.yearlyAmounts.reduce((s,v)=>s+(parseFloat(String(v).replace(/,/g,''))||0),0).toLocaleString()}
                  </span>
                </div>
                <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                  {form.yearlyAmounts.map((amt, i) => (
                    <div key={i} style={{display:"flex", flexDirection:"column", gap:3, minWidth:100}}>
                      <div style={{fontSize:8, color:"#475569"}}>{i+1}년차</div>
                      <input
                        value={amt}
                        onChange={e=>{
                          const next = [...form.yearlyAmounts];
                          next[i] = e.target.value;
                          setForm({...form, yearlyAmounts:next});
                        }}
                        placeholder="1500000"
                        style={{background:"#0f0f1a",border:"1px solid #1e2030",borderRadius:4,
                          padding:"6px 8px",fontSize:11,color:"#e2e8f0",fontFamily:"inherit",
                          outline:"none",width:"100%",boxSizing:"border-box"}}/>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:"flex", gap:8}}>
                <button onClick={addOrUpdate}
                  style={{padding:"6px 20px",background:"#1e3a6e",border:"1px solid #60a5fa44",
                    borderRadius:4,color:"#60a5fa",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  {editId?"수정 완료":"저장"}
                </button>
                <button onClick={()=>{setShowForm(false);setEditId(null);setForm(EMPTY_FORM);}}
                  style={{padding:"6px 14px",background:"none",border:"1px solid #1e2030",
                    borderRadius:4,color:"#6677aa",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>취소</button>
              </div>
            </div>
          )}

          {/* 실적 테이블 */}
          <div style={{background:"#0a0a14",border:"1px solid #1e2030",borderRadius:8,overflow:"hidden",marginBottom:16}}>
            <div style={{padding:"10px 16px",borderBottom:"1px solid #1e2030",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:10,color:"#8899aa",fontWeight:600}}>Revenue 실적 ({records.length}건)</span>
              <span style={{fontSize:9,color:"#475569"}}>{records.length>0?`합계 ${fmt(totalRevenue)}`:""}</span>
            </div>
            {records.length===0 ? (
              <div style={{padding:"28px",textAlign:"center",fontSize:10,color:"#475569",lineHeight:1.8}}>
                실적 없음 — "+ 실적 입력"으로 고객 계약 체결 건을 기록하세요
              </div>
            ) : (
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #1e2030"}}>
                    {["계약일","고객사","유형","계약구조","총액","내용",""].map((h,i)=>(
                      <th key={i} style={{padding:"7px 12px",textAlign:"left",fontSize:9,color:"#475569",fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...records].sort((a,b)=>b.date.localeCompare(a.date)).map(r=>{
                    const cc = ctColor[r.customerType]||"#8899aa";
                    return (
                      <tr key={r.id} style={{borderBottom:"1px solid #0f0f1a"}}>
                        <td style={{padding:"7px 12px",color:"#9aaabb",whiteSpace:"nowrap"}}>{r.date}</td>
                        <td style={{padding:"7px 12px",color:"#c8d0dc",fontWeight:500}}>{r.customer||"-"}</td>
                        <td style={{padding:"7px 12px"}}>
                          <span style={{fontSize:8,fontWeight:700,color:cc,background:cc+"18",padding:"1px 5px",borderRadius:2}}>{r.customerType}</span>
                        </td>
                        <td style={{padding:"7px 12px"}}>
                          {r.yearlyAmounts && r.years > 1 ? (
                            <div>
                              <span style={{fontSize:9,color:"#9aaabb"}}>{r.years}년 계약</span>
                              <div style={{display:"flex",gap:3,marginTop:2,flexWrap:"wrap"}}>
                                {r.yearlyAmounts.map((a,i)=>(
                                  <span key={i} style={{fontSize:8,color:"#60a5fa66",background:"#60a5fa0a",
                                    padding:"1px 4px",borderRadius:2}}>Y{i+1}:{fmt(a)}</span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span style={{fontSize:9,color:"#9aaabb"}}>1년 계약</span>
                          )}
                        </td>
                        <td style={{padding:"7px 12px",color:"#60a5fa",fontWeight:600,whiteSpace:"nowrap"}}>{fmt(r.amount)}</td>
                        <td style={{padding:"7px 12px",color:"#6677aa",fontSize:9}}>{r.note||"-"}</td>
                        <td style={{padding:"7px 12px"}}>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>startEdit(r)}
                              style={{background:"none",border:"1px solid #1e2030",borderRadius:2,
                                padding:"2px 7px",fontSize:8,color:"#6677aa",cursor:"pointer",fontFamily:"inherit"}}>수정</button>
                            <button onClick={()=>deleteRecord(r.id)}
                              style={{background:"none",border:"none",color:"#475569",cursor:"pointer",
                                fontSize:13,fontFamily:"inherit",lineHeight:1}}>×</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* 리스크 인사이트 */}
          {records.length>0 && (
            <div style={{padding:"12px 16px",
              background:riskLevel==="HIGH"?"#1a0808":riskLevel==="MEDIUM"?"#1a1208":"#081a0f",
              border:`1px solid ${riskColor}33`,borderRadius:8}}>
              <div style={{fontSize:10,color:riskColor,fontWeight:700,marginBottom:6}}>⚖️ Hurdle 리스크 분석 (SAA §6.3)</div>
              <div style={{fontSize:10,color:"#9aaabb",lineHeight:1.8}}>
                {riskLevel==="달성"
                  ? `Hurdle ${fmt(HURDLE_TARGET)} 달성. 계약 해지 시에도 SAA §6.3에 따라 Surviving QRC 수익 배분 협상 권리 보유.`
                  : riskLevel==="LOW"
                    ? `${pct.toFixed(1)}% 달성 — 잔여 ${fmt(remaining)} 추가 확보 시 Hurdle 충족 가능.`
                    : riskLevel==="MEDIUM"
                      ? `${pct.toFixed(1)}% 달성 — 잔여 ${fmt(remaining)} 미확보 시 해지 후 SAA §6.3 협상에서 KT 협상력 약화 우려.`
                      : `${pct.toFixed(1)}% 달성 — 목표 대비 현저히 부족. Hurdle 미달성 해지 시 Surviving QRC 수익이 KT에 불리하게 배분될 리스크 HIGH.`
                }
              </div>
            </div>
          )}
        </>)}

        {/* ══════════ 선구매 스케줄 탭 ══════════ */}
        {activeTab==="purchase" && (
          <div>
            <div style={{fontSize:10,color:"#6677aa",marginBottom:14,lineHeight:1.7}}>
              SAA에 고정된 KT → Palantir 연간 선구매 스케줄입니다. 실제 지급 완료 시 체크하세요.<br/>
              Y5 지급 시 Palantir으로부터 추가 $5M 라이선스를 수취합니다.
            </div>

            {/* 선구매 진행 바 */}
            <div style={{marginBottom:20,background:"#0a0a14",border:"1px solid #1e2030",borderRadius:8,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:10,color:"#8899aa",fontWeight:600}}>선구매 진행률</span>
                <span style={{fontSize:10,color:"#a78bfa",fontWeight:700}}>{fmt(totalPurchased)} / $50M</span>
              </div>
              <div style={{background:"#0f0f1a",borderRadius:4,height:10,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:4,background:"linear-gradient(90deg,#a78bfa88,#a78bfa)",
                  width:`${Math.min(100,(totalPurchased/50_000_000)*100)}%`,transition:"width 0.4s"}}/>
              </div>
            </div>

            {/* 연도별 카드 */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
              {PURCHASE_SCHEDULE.map(p=>{
                const yr = startYear + p.year - 1;
                const done = !!purchased[p.year];
                const totalWithBonus = p.amount + p.bonus;
                return (
                  <div key={p.year}
                    style={{background:"#0a0a14",border:`1px solid ${done?"#a78bfa44":"#1e2030"}`,
                      borderRadius:8,padding:14,cursor:"pointer",transition:"all 0.15s",
                      opacity:done?1:0.7}}
                    onClick={()=>togglePurchased(p.year)}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{fontSize:11,fontWeight:700,color:done?"#a78bfa":"#6677aa"}}>{p.label}</span>
                      <span style={{fontSize:9,color:"#475569"}}>{yr}년</span>
                    </div>
                    <div style={{fontSize:16,fontWeight:700,color:done?"#c8d0dc":"#475569",marginBottom:4}}>
                      {fmt(p.amount)}
                    </div>
                    {p.bonus>0 && (
                      <div style={{fontSize:9,color:"#34d399",marginBottom:6}}>
                        +{fmt(p.bonus)} 라이선스 추가 수취
                      </div>
                    )}
                    <div style={{fontSize:9,color:"#475569",marginBottom:8}}>
                      확보 라이선스: {fmt(totalWithBonus)}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${done?"#a78bfa":"#1e2030"}`,
                        background:done?"#a78bfa":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {done && <span style={{fontSize:8,color:"#07070f",fontWeight:700}}>✓</span>}
                      </div>
                      <span style={{fontSize:9,color:done?"#a78bfa":"#475569"}}>{done?"지급 완료":"미지급"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 합계 요약 */}
            <div style={{marginTop:16,padding:"12px 16px",background:"#0a0a14",border:"1px solid #1e2030",borderRadius:8}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,fontSize:10}}>
                <div>
                  <div style={{color:"#6677aa",marginBottom:3}}>총 선구매 (5년)</div>
                  <div style={{color:"#a78bfa",fontWeight:700,fontSize:14}}>$50M</div>
                </div>
                <div>
                  <div style={{color:"#6677aa",marginBottom:3}}>총 확보 라이선스</div>
                  <div style={{color:"#34d399",fontWeight:700,fontSize:14}}>$55M <span style={{fontSize:10,fontWeight:400}}>(Y5 +$5M 포함)</span></div>
                </div>
                <div>
                  <div style={{color:"#6677aa",marginBottom:3}}>현재 확보 라이선스</div>
                  <div style={{color:"#60a5fa",fontWeight:700,fontSize:14}}>{fmt(totalLicense)}</div>
                  <div style={{color:"#475569",fontSize:8,marginTop:2}}>미사용 {fmt(unusedLicense)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
