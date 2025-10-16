import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  root: 'src',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,

    // 빌드 최적화 옵션
    minify: mode === 'production' ? 'terser' : 'esbuild',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    // 청크 분할 전략
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      output: {
        // 파일명 해싱 전략
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },

    // 청크 크기 경고 임계값 (KB)
    chunkSizeWarningLimit: 500,

    // 소스맵 설정
    sourcemap: mode === 'development',

    // CSS 코드 스플리팅
    cssCodeSplit: true,

    // 에셋 인라인 임계값 (4KB 미만은 base64 인라인)
    assetsInlineLimit: 4096,

    // 모던 브라우저 타겟팅
    target: 'esnext',

    // 리포팅
    reportCompressedSize: true,
    cssMinify: true
  },

  // esbuild 옵션 (개발 모드에서도 console/debugger 제거)
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : []
  }
}));
