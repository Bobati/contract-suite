import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // 빌드 결과물이 생성되는 폴더를 명시적으로 지정합니다.
    outDir: 'dist',
  }
});
