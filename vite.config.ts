/**
 * 仙侠卡牌RPG - Vite 构建配置
 * 
 * 核心要求:
 * - 单文件输出 (iframe 嵌入 SillyTavern)
 * - 所有资源内联
 * - 生产环境优化
 * 
 * @version 2.0.0
 * @see docs/DEVELOPMENT_GUIDE.md
 */

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type UserConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// ============================================================================
// 构建配置
// ============================================================================

export default defineConfig(({ mode }): UserConfig => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';
  const isAnalyze = process.env.ANALYZE === 'true';

  console.log(`\n🎮 仙侠卡牌RPG 构建模式: ${mode}`);
  if (isAnalyze) console.log('📊 构建分析模式已启用\n');

  return {
    // ========================================================================
    // 开发服务器配置
    // ========================================================================
    server: {
      port: 3000,
      host: '0.0.0.0',
      // 开发环境热更新配置
      hmr: {
        overlay: true,
      },
      // 允许跨域请求 (iframe 嵌入需要)
      cors: true,
    },

    // ========================================================================
    // 预览服务器配置 (用于测试生产构建)
    // ========================================================================
    preview: {
      port: 4173,
      host: '0.0.0.0',
      cors: true,
    },

    // ========================================================================
    // 插件配置
    // ========================================================================
    plugins: [
      // React 插件 - 支持 Fast Refresh
      // React 19 已不使用 PropTypes，无需额外的 babel 插件
      react(),

      // 单文件打包插件 - 将所有资源内联到 HTML
      viteSingleFile({
        removeViteModuleLoader: true,
        useRecommendedBuildConfig: true,
        inlinePattern: [],
        deleteInlinedFiles: true,
      }),
    ],

    // ========================================================================
    // 路径别名配置
    // ========================================================================
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@components': path.resolve(__dirname, './components'),
        '@services': path.resolve(__dirname, './services'),
        '@hooks': path.resolve(__dirname, './hooks'),
        '@types': path.resolve(__dirname, './types'),
      },
    },

    // ========================================================================
    // 构建配置
    // ========================================================================
    build: {
      // 目标浏览器 - 使用最新 ES 特性
      target: 'esnext',

      // 输出目录
      outDir: 'dist',

      // 资源目录 (单文件模式下不重要)
      assetsDir: 'assets',

      // 禁用 CSS 代码分割 (单文件需要)
      cssCodeSplit: false,

      // 内联所有资源 (图片、字体等)
      assetsInlineLimit: 100000000,

      // 清空输出目录
      emptyOutDir: true,

      // Source Map 配置
      // - 开发: 启用完整 source map
      // - 生产: 禁用 (减小体积)
      sourcemap: isDev ? 'inline' : false,

      // 压缩配置
      minify: isProd ? 'terser' : false,

      // Terser 配置 (仅生产环境)
      ...(isProd && {
        terserOptions: {
          compress: {
            // 移除 console.log (保留 warn 和 error)
            drop_console: false,
            pure_funcs: ['console.log', 'console.debug', 'console.info'],
            // 移除 debugger 语句
            drop_debugger: true,
            // 优化条件表达式
            conditionals: true,
            // 移除无用代码
            dead_code: true,
            // 优化布尔表达式
            booleans: true,
            // 移除未使用的变量
            unused: true,
            // 优化 if 返回语句
            if_return: true,
            // 合并连续语句
            sequences: true,
            // 内联单次调用函数
            inline: 2,
            // 优化 switch 语句
            switches: true,
          },
          mangle: {
            // 保留类名 (调试需要)
            keep_classnames: false,
            // 保留函数名 (调试需要)
            keep_fnames: false,
            // Safari 兼容
            safari10: true,
          },
          format: {
            // 移除注释
            comments: false,
            // ASCII 输出 (兼容性)
            ascii_only: true,
          },
        },
      }),

      // Rollup 配置
      rollupOptions: {
        output: {
          // 确保所有动态导入都内联
          inlineDynamicImports: true,

          // 输出格式
          format: 'iife',

          // 入口文件名
          entryFileNames: 'assets/[name].js',

          // 资源文件名
          assetFileNames: 'assets/[name].[ext]',

          // 压缩标识符
          compact: isProd,

          // 生成更紧凑的代码
          generatedCode: {
            arrowFunctions: true,
            constBindings: true,
            objectShorthand: true,
            preset: 'es2015',
            reservedNamesAsProps: true,
            symbols: true,
          },
        },

        // Tree-shaking 配置
        treeshake: {
          // 启用模块副作用优化
          moduleSideEffects: 'no-external',
          // 标记纯函数调用
          annotations: true,
          // 未知全局副作用处理
          unknownGlobalSideEffects: false,
        },
      },

      // 构建报告
      reportCompressedSize: true,

      // chunk 大小警告阈值 (单文件模式会很大，所以调高)
      chunkSizeWarningLimit: 5000,
    },

    // ========================================================================
    // 优化配置
    // ========================================================================
    optimizeDeps: {
      // 预构建的依赖
      include: ['react', 'react-dom', 'idb', 'zod'],
      // 排除的依赖
      exclude: [],
      // 强制预构建
      force: false,
    },

    // ========================================================================
    // ESBuild 配置
    // ========================================================================
    esbuild: {
      // 生产环境移除 console.log
      ...(isProd && {
        drop: ['debugger'],
        pure: ['console.log', 'console.debug', 'console.info'],
      }),
      // JSX 优化
      jsx: 'automatic',
      // 目标
      target: 'esnext',
      // 保持类名 (调试)
      keepNames: isDev,
      // 法律注释处理
      legalComments: isProd ? 'none' : 'inline',
    },

    // ========================================================================
    // CSS 配置
    // ========================================================================
    css: {
      // 开发环境启用 CSS source map
      devSourcemap: isDev,
      // CSS 模块配置
      modules: {
        // 类名生成规则
        generateScopedName: isDev
          ? '[name]__[local]__[hash:base64:5]'
          : '[hash:base64:8]',
      },
    },

    // ========================================================================
    // 日志配置
    // ========================================================================
    logLevel: isDev ? 'info' : 'warn',

    // ========================================================================
    // 清除屏幕
    // ========================================================================
    clearScreen: true,
  };
});
