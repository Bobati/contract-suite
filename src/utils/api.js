// src/utils/api.js
// Vercel 배포 환경: /api/chat 프록시 경유 (API 키 서버에 보관)
// 로컬 개발: /api/chat → Vercel serverless function 또는 직접 호출

export async function callClaude({ system, messages, maxTokens = 4096 }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content?.map(b => b.text || '').join('') || '';
}
