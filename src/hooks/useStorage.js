// src/hooks/useStorage.js
// 브라우저 localStorage 기반 스토리지
// (아티팩트 환경 제거 — 배포 전용)

export const storage = {
  async get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  },
  async remove(key) {
    try { localStorage.removeItem(key); } catch {}
  },
};

export const STORAGE_KEYS = {
  KB_PATCHES:    'kb_patches_v1',
  AMENDMENTS:    'amendments_v2',
  ISSUE_HISTORY: 'issue_history',
  DOCS_META:     'docs_meta_v1',
};
