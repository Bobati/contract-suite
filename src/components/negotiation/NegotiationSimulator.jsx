// src/components/negotiation/NegotiationSimulator.jsx
// 협상 시뮬레이터

import { useState, useRef } from 'react';
import { callClaude } from '../../utils/api.js';

export default function NegotiationSimulator({ amendments = [] }) {
  const [mode,         setMode]         = useState('file'); // 'file' | 'text'
  const [inputText,    setInputText]    = useState('');
  const [ktGoals,      setKtGoals]      = useState('');
  const [fileContent,  setFileContent]  = useState(null);
  const [fileName,     setFileName]     = useState('');
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const fileRef = useRef(null);

  // PDF/\ud14d\uc2a4\ud2b8 \ud30c\uc77c \uc77d\uae30
  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      setFileContent({ type: 'pdf', b64 });
    } else {
      const text = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsText(file, 'utf-8');
      });
      setFileContent({ type: 'text', text });
    }
  };

  const SYSTEM = () => {
    const kbSummary = CONTRACT_KB.clauses.slice(0, 30).map(c =>
      `${c.id}: ${c.topic} \u2014 ${c.core}`
    ).join('\n');
    const amdSummary = amendments.slice(0, 5).map(a =>
      `${a.fileName} (${a.docType}): ${a.summary}`
    ).join('\n');
    return `\ub2f9\uc2e0\uc740 KT(\ud55c\uad6d\ud1b5\uc2e0)\uc758 \uc218\uc11d \uacc4\uc57d \ud611\uc0c1 \uc790\ubb38\uc785\ub2c8\ub2e4.
KT\ub294 Palantir\uc640 \uc804\ub7b5\uc801 \ud30c\ud2b8\ub108\uc2ed \uacc4\uc57d(SAA)\uc744 \uccb4\uacb0\ud588\uc73c\uba70, \ud604\uc7ac Amendment \ud611\uc0c1 \uc911\uc785\ub2c8\ub2e4.

## \ud604\uc7ac \uacc4\uc57d KB \uc694\uc57d
${kbSummary}

## \uae30\uc874 Amendment \uc774\ub825
${amdSummary || '\uc5c6\uc74c'}

\ub2f9\uc2e0\uc758 \uc5ed\ud560:
- Palantir \uc81c\uc548\uc758 \uc870\ud56d\ubcc4 \uc758\ubbf8\uc640 KT \uc601\ud5a5\uc744 \ubd84\uc11d
- \uc870\ud56d \uac04 \ubc14\ud130(tradeoff) \uc804\ub7b5 \uc218\ub9bd
- KT \uc785\uc7a5\uc5d0\uc11c \ucd5c\uc801\uc758 \ud611\uc0c1 \ud328\ud0a4\uc9c0 \uad6c\uc131
- \uc2e4\uc804 \ud611\uc0c1 \ub300\ubcf8\uae4c\uc9c0 \uc81c\uc2dc`;
  };

  const buildPrompt = (docContent) => `
\ub2e4\uc74c\uc740 Palantir\uac00 \uc81c\uc2dc\ud55c \ud611\uc0c1 \ubb38\uc11c\uc785\ub2c8\ub2e4:

---
${docContent}
---

KT \ud611\uc0c1 \ubaa9\ud45c:
${ktGoals || '(\uba85\uc2dc \uc5c6\uc74c \u2014 KT \uc804\ubc18\uc801 \uc774\uc775 \uad00\uc810\uc5d0\uc11c \ubd84\uc11d)'}

\uc544\ub798 JSON \ud615\uc2dd\uc73c\ub85c\ub9cc \uc751\ub2f5. \ubc31\ud2f1 \uc5c6\uc774 \uc21c\uc218 JSON:
{
  "summary": "Palantir \uc81c\uc548\uc758 \ud575\uc2ec \uc758\ub3c4 1~2\ubb38\uc7a5 (\uc26c\uc6b4 \ud55c\uad6d\uc5b4)",
  "clauseAnalysis": [
    {
      "clauseId": "SAA-X.X \ub610\ub294 \uc2e0\uaddc",
      "title": "\uc870\ud56d \uc81c\ubaa9",
      "palantirProposal": "Palantir\uac00 \uc6d0\ud558\ub294 \uac83 (\ud55c\uad6d\uc5b4 1~2\ubb38\uc7a5, \uc27d\uac8c)",
      "ktRisk": "KT\uc5d0 \ubbf8\uce58\ub294 \uc2e4\uc9c8\uc801 \uc601\ud5a5 (\ud55c\uad6d\uc5b4, \uad6c\uccb4\uc801)",
      "riskLevel": "HIGH|MEDIUM|LOW",
      "ktPosition": "ACCEPT|MODIFY|REJECT"
    }
  ],
  "barterPackages": [
    {
      "packageName": "\ud328\ud0a4\uc9c0\uba85 (\uc608: '\uc870\uae30\uc885\ub8cc \uc644\ud654 + QRC \ub2e8\ucd95')",
      "ktGives": ["KT\uac00 \uc591\ubcf4\ud558\ub294 \uac83\ub4e4"],
      "ktGets": ["KT\uac00 \uc5bb\ub294 \uac83\ub4e4"],
      "rationale": "\uc774 \ubc14\ud130\uac00 \ud569\ub9ac\uc801\uc778 \uc774\uc720",
      "successProbability": "HIGH|MEDIUM|LOW"
    }
  ],
  "redLines": ["\uc808\ub300 \uc591\ubcf4 \ubd88\uac00 \uc870\uac74 (\uad6c\uccb4\uc801)"],
  "negotiationScript": {
    "opening": "\ud611\uc0c1 \uccab \ub9c8\ub514 (\ud55c\uad6d\uc5b4 \uc2e4\uc804 \ub300\ubcf8)",
    "keyArguments": ["\ud575\uc2ec \ub17c\uac70 3~4\uac1c"],
    "concessions": "\ucd5c\ud6c4 \uc218\ub2e8 \uc591\ubcf4 \uc804\ub7b5"
  },
  "recommendation": "\ucd5c\uc885 \uad8c\uace0\uc0ac\ud56d (\uc218\uc6a9/\uc218\uc815/\uac70\ubd80 + \uc774\uc720)"
}`;

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      let msgContent;
      if (mode === 'file' && fileContent) {
        if (fileContent.type === 'pdf') {
          msgContent = [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileContent.b64 } },
            { type: 'text', text: buildPrompt('[\uc704 \ucca8\ubd80 PDF \ubb38\uc11c\ub97c \ubd84\uc11d\ud558\uc2dc\uc624]') }
          ];
        } else {
          msgContent = buildPrompt(fileContent.text);
        }
      } else {
        msgContent = buildPrompt(inputText);
      }

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: SYSTEM(),
          messages: [{ role: 'user', content: msgContent }]
        })
      });
      const data = await resp.json();
      const raw = data.content.map(b => b.text || '').join('');
      const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
      const parsed = JSON.parse(raw.slice(s, e + 1));
      setResult(parsed);
      setActiveSection(0);
    } catch(err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const canAnalyze = !loading && (
    (mode === 'file' && fileContent) ||
    (mode === 'text' && inputText.trim().length > 20)
  );

  const riskColor  = { HIGH:'#ff4444', MEDIUM:'#f59e0b', LOW:'#10b981' };
  const posColor   = { ACCEPT:'#10b981', MODIFY:'#f59e0b', REJECT:'#ff4444' };
  const posLabel   = { ACCEPT:'\u2713 \uc218\uc6a9', MODIFY:'~ \uc218\uc815', REJECT:'\u2717 \uac70\ubd80' };
  const probColor  = { HIGH:'#10b981', MEDIUM:'#f59e0b', LOW:'#ff4444' };

  const sections = result && !result.error ? [
    '\ud83d\udccb \uc870\ud56d\ubcc4 \ubd84\uc11d',
    '\ud83d\udd04 \ubc14\ud130 \uc804\ub7b5',
    '\ud83d\udeab Red Lines',
    '\ud83c\udfa4 \ud611\uc0c1 \ub300\ubcf8',
  ] : [];

  return (
    <div style={{height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'#07070f'}}>

      {/* \ud5e4\ub354 */}
      <div style={{padding:'10px 20px', borderBottom:'1px solid #1a1a2e',
        background:'#0a0a14', flexShrink:0}}>
        <div style={{fontSize:13, fontWeight:700, color:'#8899bb'}}>\ud83e\udd1d \ud611\uc0c1 \uc2dc\ubbac\ub808\uc774\ud130</div>
        <div style={{fontSize:9, color:'#475569', marginTop:2}}>
          Palantir Amendment \uc81c\uc548\uc11c\ub97c \uc5c5\ub85c\ub4dc\ud558\uac70\ub098 \ubd99\uc5ec\ub123\uc73c\uba74 \u2014 \uc870\ud56d\ubcc4 \ubd84\uc11d, \ubc14\ud130 \uc804\ub7b5, \ud611\uc0c1 \ub300\ubcf8\uc744 \uc81c\uc2dc\ud569\ub2c8\ub2e4
        </div>
      </div>

      <div style={{flex:1, display:'grid', gridTemplateColumns:'360px 1fr', overflow:'hidden'}}>

        {/* \uc67c\ucabd: \uc785\ub825 */}
        <div style={{borderRight:'1px solid #1a1a2e', display:'flex', flexDirection:'column',
          overflow:'hidden', background:'#0a0a14'}}>
          <div style={{flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12}}>

            {/* \uc785\ub825 \ubc29\uc2dd \uc120\ud0dd */}
            <div style={{display:'flex', gap:4}}>
              {[['file','\ud83d\udcce \ud30c\uc77c \uc5c5\ub85c\ub4dc'],['text','\u270f\ufe0f \ud14d\uc2a4\ud2b8 \uc785\ub825']].map(([m,label]) => (
                <button key={m} onClick={() => setMode(m)}
                  style={{flex:1, padding:'6px 0', borderRadius:4, border:'none',
                    cursor:'pointer', fontSize:10, fontWeight:600, fontFamily:'inherit',
                    background: mode===m ? '#1e3a6e' : '#0f0f1a',
                    color: mode===m ? '#60a5fa' : '#475569',
                    border: '1px solid ' + (mode===m ? '#60a5fa44' : '#1e2030')}}>
                  {label}
                </button>
              ))}
            </div>

            {/* \ud30c\uc77c \uc5c5\ub85c\ub4dc */}
            {mode === 'file' && (
              <div>
                <input ref={fileRef} type='file' accept='.pdf,.txt,.docx'
                  style={{display:'none'}}
                  onChange={e => handleFile(e.target.files[0])}/>
                <div onClick={() => fileRef.current?.click()}
                  style={{padding:'20px', border:'1px dashed #334155', borderRadius:6,
                    textAlign:'center', cursor:'pointer', background:'#0f0f1a',
                    transition:'border-color 0.2s'}}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#60a5fa'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='#334155'}>
                  {fileContent ? (
                    <div>
                      <div style={{fontSize:18, marginBottom:4}}>\ud83d\udcc4</div>
                      <div style={{fontSize:10, color:'#60a5fa', fontWeight:600}}>{fileName}</div>
                      <div style={{fontSize:9, color:'#475569', marginTop:2}}>\ud074\ub9ad\ud558\uc5ec \ubcc0\uacbd</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{fontSize:20, marginBottom:6, opacity:0.4}}>\ud83d\udcce</div>
                      <div style={{fontSize:10, color:'#475569'}}>
                        Amendment \uc81c\uc548\uc11c \uc5c5\ub85c\ub4dc<br/>
                        <span style={{fontSize:9, color:'#334155'}}>PDF \u00b7 TXT \uc9c0\uc6d0</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* \ud14d\uc2a4\ud2b8 \uc785\ub825 */}
            {mode === 'text' && (
              <div style={{display:'flex', flexDirection:'column', gap:4}}>
                <div style={{fontSize:10, color:'#6677aa', fontWeight:700}}>
                  Palantir \uc81c\uc548 \ub0b4\uc6a9
                </div>
                <div style={{fontSize:9, color:'#334155', lineHeight:1.6, padding:'6px 8px',
                  background:'#0f0f1a', borderRadius:4, border:'1px solid #1a1a2e'}}>
                  \ud83d\udca1 <strong style={{color:'#475569'}}>\uc608\uc2dc:</strong> \uc774\uba54\uc77c/\ubb38\uc11c\uc5d0\uc11c \ubc1b\uc740 Palantir \uc694\uad6c\uc0ac\ud56d\uc744 \uadf8\ub300\ub85c \ubd99\uc5ec\ub123\uc73c\uc138\uc694.<br/>
                  "Section 6.3\uc744 \uc218\uc815\ud558\uc5ec Surviving QRC\ub97c 5\ub144\uc73c\ub85c \uc5f0\uc7a5\ud558\uace0, \u00a78.2 \ubc30\uc0c1 \ud55c\ub3c4\ub97c $200K\ub85c \ub0ae\ucd94\uae38 \uc6d0\ud569\ub2c8\ub2e4."
                </div>
                <textarea value={inputText} onChange={e => setInputText(e.target.value)}
                  placeholder={'Palantir \uc774\uba54\uc77c, \uc870\ud56d \uc218\uc815 \uc694\uccad, \ud611\uc0c1 \uba54\ubaa8 \ub4f1\uc744 \ubd99\uc5ec\ub123\uc73c\uc138\uc694...\n\n\uc870\ud56d \ubc88\ud638\ub098 \uc815\ud655\ud55c \ubb38\uad6c\ub97c \ubab0\ub77c\ub3c4 \ub429\ub2c8\ub2e4.\n"\uacc4\uc57d \uae30\uac04\uc744 \uc5f0\uc7a5\ud558\uace0 \uc2f6\ub2e4", "\uc774 \uc870\ud56d\uc744 \uc0ad\uc81c\ud558\uc790" \uac19\uc740 \ub0b4\uc6a9\ub3c4 OK.'}
                  style={{height:160, width:'100%', background:'#0f0f1a', border:'1px solid #1e2030',
                    borderRadius:4, color:'#c8d0dc', padding:'8px 10px', fontSize:10,
                    fontFamily:'inherit', resize:'none', lineHeight:1.6,
                    boxSizing:'border-box'}}/>
              </div>
            )}

            {/* KT \ud611\uc0c1 \ubaa9\ud45c */}
            <div>
              <div style={{fontSize:10, color:'#6677aa', fontWeight:700, marginBottom:4}}>
                \ud83c\udfaf KT \ud611\uc0c1 \ubaa9\ud45c <span style={{color:'#334155', fontWeight:400}}>(\uc120\ud0dd)</span>
              </div>
              <div style={{fontSize:9, color:'#334155', marginBottom:5, lineHeight:1.6}}>
                \uc6b0\ub9ac\uac00 \uaf2d \uc5bb\uace0 \uc2f6\uc740 \uac83, \ub610\ub294 \ub9c9\uc544\uc57c \ud558\ub294 \uac83\uc744 \uc790\uc720\ub86d\uac8c \uc801\uc73c\uc138\uc694
              </div>
              <textarea value={ktGoals} onChange={e => setKtGoals(e.target.value)}
                placeholder={'\uc608:\n- Surviving QRC \uacc4\uc0b0 \uae30\uac04 3\ub144\u21921\ub144 \ub2e8\ucd95\n- \u00a78.2 KT \ubc30\uc0c1 \ud55c\ub3c4 \ud604\uc7ac \uc720\uc9c0\n- \uc870\uae30\uc885\ub8cc \uc870\uac74 \uc644\ud654'}
                style={{width:'100%', height:80, background:'#0f0f1a', border:'1px solid #1e2030',
                  borderRadius:4, color:'#c8d0dc', padding:'7px 9px', fontSize:10,
                  fontFamily:'inherit', resize:'none', lineHeight:1.6,
                  boxSizing:'border-box'}}/>
            </div>

            <button onClick={analyze} disabled={!canAnalyze}
              style={{padding:'10px', borderRadius:5, border:'none',
                cursor: canAnalyze ? 'pointer' : 'default',
                fontFamily:'inherit', fontSize:11, fontWeight:700,
                background: canAnalyze ? '#1e3a6e' : '#1e2030',
                color: canAnalyze ? '#60a5fa' : '#334155',
                transition:'all 0.2s'}}>
              {loading ? '\u2699 \ubd84\uc11d \uc911...' : '\ud83d\udd0d \ud611\uc0c1 \uc804\ub7b5 \ubd84\uc11d'}
            </button>

            {/* \ubd84\uc11d \uacb0\uacfc \uc694\uc57d (\uc67c\ucabd \ud558\ub2e8) */}
            {result && !result.error && !loading && (
              <div style={{padding:'10px 12px', background:'#0f1e35',
                borderRadius:6, border:'1px solid #1e3a6e'}}>
                <div style={{fontSize:9, color:'#60a5fa', fontWeight:700, marginBottom:6}}>
                  \ubd84\uc11d \uc644\ub8cc
                </div>
                <div style={{fontSize:10, color:'#c8d0dc', lineHeight:1.6}}>
                  {result.summary}
                </div>
                <div style={{marginTop:8, fontSize:9, color:'#6677aa'}}>
                  \ucd5c\uc885 \uad8c\uace0: <span style={{color:'#e2e8f0', fontWeight:600}}>{result.recommendation}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* \uc624\ub978\ucabd: \uacb0\uacfc */}
        <div style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>

          {loading && (
            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center',
              flexDirection:'column', gap:12}}>
              <div style={{fontSize:28}}>\u2699\ufe0f</div>
              <div style={{fontSize:11, color:'#475569'}}>\ud611\uc0c1 \uc804\ub7b5 \ubd84\uc11d \uc911...</div>
              <div style={{fontSize:9, color:'#334155'}}>\uc870\ud56d \ubd84\uc11d \u2192 \ubc14\ud130 \ud328\ud0a4\uc9c0 \uad6c\uc131 \u2192 \ud611\uc0c1 \ub300\ubcf8 \uc791\uc131</div>
            </div>
          )}

          {!loading && !result && (
            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center',
              flexDirection:'column', gap:10, color:'#1e2d3d'}}>
              <div style={{fontSize:36}}>\ud83e\udd1d</div>
              <div style={{fontSize:12, color:'#334155'}}>Palantir \uc81c\uc548\uc744 \uc785\ub825\ud558\uba74</div>
              <div style={{display:'flex', flexDirection:'column', gap:6, marginTop:4}}>
                {['\ud83d\udccb \uac01 \uc870\ud56d\uc774 KT\uc5d0 \ubbf8\uce58\ub294 \uc601\ud5a5 \ubd84\uc11d',
                  '\ud83d\udd04 \ubc14\ud130 \ud328\ud0a4\uc9c0 \uad6c\uc131 (A \uc591\ubcf4 \u2192 B \ud68d\ub4dd)',
                  '\ud83d\udeab \uc808\ub300 \uc591\ubcf4 \ubd88\uac00 Red Lines \uc815\ub9ac',
                  '\ud83c\udfa4 \uc2e4\uc804 \ud611\uc0c1 \ub300\ubcf8 \uc81c\uc2dc'].map(t => (
                  <div key={t} style={{fontSize:10, color:'#334155', display:'flex', alignItems:'center', gap:6}}>
                    <span style={{color:'#1e3a6e'}}>\u25b8</span>{t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && result && !result.error && (
            <>
              {/* \uc139\uc158 \ud0ed */}
              <div style={{display:'flex', gap:1, padding:'8px 16px',
                borderBottom:'1px solid #1a1a2e', background:'#0a0a14', flexShrink:0}}>
                {sections.map((s, i) => (
                  <button key={i} onClick={() => setActiveSection(i)}
                    style={{padding:'4px 12px', borderRadius:3, border:'none',
                      cursor:'pointer', fontSize:10, fontWeight:600, fontFamily:'inherit',
                      background: activeSection===i ? '#1e3a6e' : 'transparent',
                      color: activeSection===i ? '#60a5fa' : '#475569'}}>
                    {s}
                  </button>
                ))}
              </div>

              <div style={{flex:1, overflowY:'auto', padding:16}}>

                {/* \uc870\ud56d\ubcc4 \ubd84\uc11d */}
                {activeSection === 0 && (
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {(result.clauseAnalysis || []).map((c, i) => {
                      const rc = riskColor[c.riskLevel] || '#8899aa';
                      const pc = posColor[c.ktPosition] || '#8899aa';
                      return (
                        <div key={i} style={{borderRadius:6, overflow:'hidden',
                          border:'1px solid ' + rc + '33', background:'#0a0a14'}}>
                          <div style={{padding:'8px 12px', background: rc + '0d',
                            display:'flex', alignItems:'center', gap:8}}>
                            <span style={{fontSize:9, fontWeight:700, color:rc,
                              background:rc+'22', padding:'2px 7px', borderRadius:3}}>
                              {c.riskLevel}
                            </span>
                            <span style={{fontSize:10, fontWeight:700, color:'#e2e8f0'}}>
                              {c.clauseId}
                            </span>
                            <span style={{fontSize:10, color:'#8899aa'}}>{c.title}</span>
                            <span style={{marginLeft:'auto', fontSize:9, fontWeight:700,
                              color:pc, background:pc+'18', padding:'2px 7px', borderRadius:3}}>
                              {posLabel[c.ktPosition]}
                            </span>
                          </div>
                          <div style={{padding:'10px 12px', display:'grid',
                            gridTemplateColumns:'1fr 1fr', gap:10}}>
                            <div>
                              <div style={{fontSize:8, color:'#a78bfa', fontWeight:700,
                                marginBottom:4}}>Palantir\uac00 \uc6d0\ud558\ub294 \uac83</div>
                              <div style={{fontSize:10, color:'#9aaabb', lineHeight:1.6}}>
                                {c.palantirProposal}
                              </div>
                            </div>
                            <div>
                              <div style={{fontSize:8, color:rc, fontWeight:700,
                                marginBottom:4}}>KT \uc601\ud5a5</div>
                              <div style={{fontSize:10, color:'#9aaabb', lineHeight:1.6}}>
                                {c.ktRisk}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* \ubc14\ud130 \uc804\ub7b5 */}
                {activeSection === 1 && (
                  <div style={{display:'flex', flexDirection:'column', gap:10}}>
                    {(result.barterPackages || []).map((pkg, i) => {
                      const pc = probColor[pkg.successProbability] || '#8899aa';
                      return (
                        <div key={i} style={{borderRadius:8, overflow:'hidden',
                          border:'1px solid #1e3a6e', background:'#0a0a14'}}>
                          <div style={{padding:'10px 14px', background:'#0f1e35',
                            display:'flex', alignItems:'center', gap:8}}>
                            <span style={{fontSize:11, fontWeight:700, color:'#60a5fa'}}>
                              \ud328\ud0a4\uc9c0 {i+1}
                            </span>
                            <span style={{fontSize:10, color:'#c8d0dc', fontWeight:600}}>
                              {pkg.packageName}
                            </span>
                            <span style={{marginLeft:'auto', fontSize:9, color:pc,
                              background:pc+'18', padding:'2px 7px', borderRadius:3, fontWeight:700}}>
                              \uc131\uacf5\ud655\ub960 {pkg.successProbability}
                            </span>
                          </div>
                          <div style={{padding:'12px 14px', display:'grid',
                            gridTemplateColumns:'1fr 1fr', gap:12}}>
                            <div style={{padding:'8px 10px', background:'#1a0a0a',
                              borderRadius:5, border:'1px solid #ff444422'}}>
                              <div style={{fontSize:8, color:'#ff6b6b', fontWeight:700,
                                marginBottom:6}}>KT\uac00 \uc591\ubcf4\ud558\ub294 \uac83</div>
                              {pkg.ktGives.map((g, j) => (
                                <div key={j} style={{fontSize:9, color:'#cc8888',
                                  marginBottom:4, paddingLeft:8,
                                  borderLeft:'2px solid #ff444433', lineHeight:1.5}}>
                                  {g}
                                </div>
                              ))}
                            </div>
                            <div style={{padding:'8px 10px', background:'#0a1a0a',
                              borderRadius:5, border:'1px solid #10b98122'}}>
                              <div style={{fontSize:8, color:'#10b981', fontWeight:700,
                                marginBottom:6}}>KT\uac00 \uc5bb\ub294 \uac83</div>
                              {pkg.ktGets.map((g, j) => (
                                <div key={j} style={{fontSize:9, color:'#88bb99',
                                  marginBottom:4, paddingLeft:8,
                                  borderLeft:'2px solid #10b98133', lineHeight:1.5}}>
                                  {g}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{padding:'8px 14px', borderTop:'1px solid #1e2030',
                            fontSize:9, color:'#6677aa', lineHeight:1.5}}>
                            \ud83d\udca1 {pkg.rationale}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Red Lines */}
                {activeSection === 2 && (
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    <div style={{fontSize:10, color:'#8899aa', lineHeight:1.7, marginBottom:4}}>
                      \uc544\ub798 \uc870\uac74\uc740 \uc5b4\ub5a4 \ubc14\ud130 \ud328\ud0a4\uc9c0\uc5d0\uc11c\ub3c4 \uc591\ubcf4\ud574\uc120 \uc548 \ub429\ub2c8\ub2e4.
                    </div>
                    {(result.redLines || []).map((r, i) => (
                      <div key={i} style={{padding:'10px 14px', borderRadius:6,
                        background:'#1a0808', border:'1px solid #ff444433',
                        display:'flex', gap:10, alignItems:'flex-start'}}>
                        <span style={{color:'#ff4444', fontSize:14, flexShrink:0}}>\ud83d\udeab</span>
                        <span style={{fontSize:10, color:'#cc8888', lineHeight:1.6}}>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* \ud611\uc0c1 \ub300\ubcf8 */}
                {activeSection === 3 && (
                  <div style={{display:'flex', flexDirection:'column', gap:12}}>
                    <div style={{padding:'12px 14px', borderRadius:6,
                      background:'#0f1e35', border:'1px solid #1e3a6e'}}>
                      <div style={{fontSize:9, color:'#60a5fa', fontWeight:700, marginBottom:6}}>
                        \ud83c\udfa4 \uc624\ud504\ub2dd \uba58\ud2b8
                      </div>
                      <div style={{fontSize:11, color:'#c8d0dc', lineHeight:1.8,
                        fontStyle:'italic', padding:'8px 12px', background:'#0a0a14',
                        borderRadius:4, borderLeft:'3px solid #60a5fa'}}>
                        "{result.negotiationScript?.opening}"
                      </div>
                    </div>
                    <div style={{padding:'12px 14px', borderRadius:6,
                      background:'#0a1a0a', border:'1px solid #10b98133'}}>
                      <div style={{fontSize:9, color:'#10b981', fontWeight:700, marginBottom:8}}>
                        \ud83d\udcaa \ud575\uc2ec \ub17c\uac70
                      </div>
                      {(result.negotiationScript?.keyArguments || []).map((arg, i) => (
                        <div key={i} style={{padding:'7px 10px', marginBottom:6,
                          background:'#0a0a14', borderRadius:4,
                          borderLeft:'2px solid #10b98144', fontSize:10,
                          color:'#9aaabb', lineHeight:1.6}}>
                          <span style={{color:'#10b981', fontWeight:700, marginRight:8}}>
                            {i+1}.
                          </span>
                          {arg}
                        </div>
                      ))}
                    </div>
                    <div style={{padding:'12px 14px', borderRadius:6,
                      background:'#1a1a08', border:'1px solid #f59e0b33'}}>
                      <div style={{fontSize:9, color:'#f59e0b', fontWeight:700, marginBottom:6}}>
                        \ud83e\udd1d \ucd5c\ud6c4 \uc591\ubcf4 \uc804\ub7b5
                      </div>
                      <div style={{fontSize:10, color:'#bbaa77', lineHeight:1.6}}>
                        {result.negotiationScript?.concessions}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </>
          )}

          {!loading && result?.error && (
            <div style={{padding:20, color:'#ff6b6b', fontSize:10}}>
              \uc624\ub958: {result.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
