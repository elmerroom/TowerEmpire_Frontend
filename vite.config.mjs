import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      react({
        babel: {
          plugins: isProd
            ? [
                // Удаляем prop-types
                ['transform-react-remove-prop-types', { removeImport: true }],
              ]
            : [],
        },
      }),
      tsconfigPaths(),
      svgr(),
      isProd &&
        compression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 10240, // файл размером от 10 КБ и больше будет gzip-сжат
          deleteOriginFile: false,
          compressionOptions: { level: 9 },
        }),
      isProd &&
        compression({
          algorithm: 'brotli',
          ext: '.br',
          threshold: 10240,
          deleteOriginFile: false,
          compressionOptions: { level: 11 },
        }),
      // Описание бандла
      isProd &&
        visualizer({
          filename: 'build/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean), // Убирает 'false' значения из массива плагинов

    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
    },

    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true,
    },

    build: {
      target: 'es2020',
      outDir: 'build',
      assetsDir: 'assets',
      sourcemap: !isProd,
      minify: isProd ? 'terser' : false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
          manualChunks(id) {
            // Разделяем тяжелые либы
            if (id.includes('node_modules')) {
              // React экосистема - KEEP TOGETHER (don't split, causes undefined errors)
              // Splitting react and react-dom breaks initialization
              if (id.includes('react-router') || id.includes('react-redux')) {
                return 'react-libs';
              }

              // UI библиотеки
              if (id.includes('bootstrap') || id.includes('react-bootstrap')) {
                return 'ui-bootstrap';
              }

              // Анимации и движение
              if (id.includes('framer-motion') || id.includes('motion')) {
                return 'animations';
              }

              // 3D графика (очень тяжелая)
              if (id.includes('three')) {
                return 'three';
              }

              // Нишевые либы (документация, эмодзи)
              if (
                id.includes('emoji-mart') ||
                id.includes('redoc') ||
                id.includes('rapidoc')
              ) {
                return 'utils-heavy';
              }

              // Redux и стейт менеджмент
              if (id.includes('redux') || id.includes('@reduxjs')) {
                return 'state-mgmt';
              }

              // Остальное в один большой чанк
              return 'vendor';
            }
          },
        },
      },
      // Удаляем console.log()
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 3,
        },
        mangle: true,
        format: {
          comments: false,
        },
      },
    },

    resolve: {
      alias: {
        '@': '/src',
      },
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
  };
});
