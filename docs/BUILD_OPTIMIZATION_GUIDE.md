# 仙侠卡牌RPG - 构建优化指南

> 📅 更新日期: 2024-12-13
> 🔖 版本: 2.0.0
> 📁 配置文件: `vite.config.ts`, `package.json`

---

## 目录

1. [构建系统概述](#1-构建系统概述)
2. [构建命令](#2-构建命令)
3. [配置详解](#3-配置详解)
4. [优化策略](#4-优化策略)
5. [常见问题](#5-常见问题)

---

## 1. 构建系统概述

### 1.1 核心要求

本项目作为 SillyTavern 的 iframe 嵌入式扩展，有以下特殊构建要求：

| 要求 | 说明 | 实现方式 |
|------|------|----------|
| **单文件输出** | 所有代码打包为一个 HTML 文件 | `vite-plugin-singlefile` |
| **资源内联** | 图片、CSS、JS 全部内联 | `assetsInlineLimit: 100000000` |
| **无外部依赖** | 不依赖 CDN 或外部资源 | 完整打包所有依赖 |
| **兼容性** | 支持现代浏览器 | `target: 'esnext'` |

### 1.2 技术栈

```
构建工具: Vite 6.2.0
打包器: Rollup (Vite 内置)
压缩器: Terser (生产环境)
转译器: esbuild (开发环境)
```

### 1.3 项目规模

| 指标 | 数值 |
|------|------|
| 组件数量 | 70+ |
| 服务数量 | 28 |
| 类型定义行数 | 1439 |
| 主应用行数 | 3173 |
| 预计产物大小 | ~1-2 MB (gzip 后 ~300-500 KB) |

---

## 2. 构建命令

### 2.1 常用命令

```bash
# 开发环境 - 启动开发服务器 (HMR)
npm run dev

# 生产构建 - 完整构建流程 (类型检查 + 构建)
npm run build

# 快速构建 - 跳过类型检查
npm run build:fast

# 构建分析 - 生成构建报告
npm run build:analyze

# 预览构建 - 本地预览生产版本
npm run preview

# 类型检查
npm run typecheck
npm run typecheck:watch  # 监听模式

# 清理
npm run clean       # 清理 dist
npm run clean:all   # 清理 dist 和 Vite 缓存
```

### 2.2 命令说明

| 命令 | 用途 | 耗时 |
|------|------|------|
| `dev` | 日常开发，支持热更新 | 启动 ~2-3s |
| `build` | 发布前完整构建 | ~20-40s |
| `build:fast` | 快速迭代测试 | ~10-20s |
| `build:analyze` | 分析包大小，优化依赖 | ~15-30s |
| `preview` | 本地测试生产版本 | 启动 ~1s |

### 2.3 CI/CD 推荐流程

```yaml
# GitHub Actions 示例
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

---

## 3. 配置详解

### 3.1 Vite 配置结构

```typescript
// vite.config.ts 主要配置区块
{
  server: { ... },      // 开发服务器配置
  preview: { ... },     // 预览服务器配置
  plugins: [ ... ],     // 插件配置
  resolve: { ... },     // 路径别名
  build: { ... },       // 构建配置 (核心)
  optimizeDeps: { ... }, // 依赖预构建
  esbuild: { ... },     // esbuild 配置
  css: { ... },         // CSS 配置
}
```

### 3.2 核心构建配置

```typescript
build: {
  // 目标浏览器
  target: 'esnext',
  
  // 单文件模式必需配置
  cssCodeSplit: false,
  assetsInlineLimit: 100000000,
  
  // 生产环境压缩
  minify: 'terser',
  
  // Rollup 配置
  rollupOptions: {
    output: {
      inlineDynamicImports: true,
      format: 'iife',
    },
    treeshake: {
      moduleSideEffects: 'no-external',
      annotations: true,
    },
  },
}
```

### 3.3 Terser 压缩配置

```typescript
terserOptions: {
  compress: {
    // 移除调试代码
    pure_funcs: ['console.log', 'console.debug', 'console.info'],
    drop_debugger: true,
    
    // 代码优化
    dead_code: true,
    unused: true,
    conditionals: true,
    booleans: true,
    if_return: true,
    sequences: true,
    inline: 2,
    switches: true,
  },
  mangle: {
    safari10: true,
  },
  format: {
    comments: false,
    ascii_only: true,
  },
}
```

### 3.4 路径别名

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, '.'),
    '@components': path.resolve(__dirname, './components'),
    '@services': path.resolve(__dirname, './services'),
    '@hooks': path.resolve(__dirname, './hooks'),
    '@types': path.resolve(__dirname, './types'),
  },
}
```

**使用示例**:
```typescript
// 旧写法
import { Modal } from '../../../components/Modal';

// 新写法
import { Modal } from '@components/Modal';
```

---

## 4. 优化策略

### 4.1 代码优化

#### 4.1.1 Tree Shaking

项目已配置完整的 Tree Shaking：

```typescript
treeshake: {
  moduleSideEffects: 'no-external',
  annotations: true,
  unknownGlobalSideEffects: false,
}
```

**最佳实践**:
- ✅ 使用命名导出而非默认导出
- ✅ 避免在模块顶层执行副作用代码
- ✅ 使用 `/*#__PURE__*/` 注释标记纯函数

```typescript
// ✅ 好的写法
export const utilFunction = /*#__PURE__*/ createUtil();

// ❌ 避免
const sideEffect = doSomething(); // 模块顶层副作用
export default sideEffect;
```

#### 4.1.2 代码分割

由于单文件要求，项目禁用了代码分割：

```typescript
output: {
  inlineDynamicImports: true,
}
```

如果将来需要支持非 iframe 模式，可以启用：

```typescript
// 非单文件模式
output: {
  manualChunks: {
    'vendor': ['react', 'react-dom'],
    'utils': ['idb', 'zod'],
  },
}
```

### 4.2 资源优化

#### 4.2.1 图片处理

当前配置将所有图片内联为 Base64：

```typescript
assetsInlineLimit: 100000000,
```

**建议**:
- 使用 SVG 图标（体积小，支持缩放）
- 压缩 PNG/JPG 图片
- 考虑使用 WebP 格式

#### 4.2.2 CSS 优化

```typescript
css: {
  devSourcemap: isDev,
  modules: {
    generateScopedName: isDev
      ? '[name]__[local]__[hash:base64:5]'
      : '[hash:base64:8]',
  },
}
```

### 4.3 开发体验优化

#### 4.3.1 依赖预构建

```typescript
optimizeDeps: {
  include: ['react', 'react-dom', 'idb', 'zod'],
}
```

#### 4.3.2 HMR 配置

```typescript
server: {
  hmr: {
    overlay: true,
  },
}
```

### 4.4 生产环境优化清单

| 优化项 | 状态 | 说明 |
|--------|------|------|
| Terser 压缩 | ✅ | 已启用 |
| 移除 console.log | ✅ | 保留 warn/error |
| 移除 debugger | ✅ | 已启用 |
| Tree Shaking | ✅ | 已启用 |
| 源码映射 | ✅ | 生产环境禁用 |
| 注释移除 | ✅ | 已启用 |

---

## 5. 常见问题

### 5.1 构建失败

#### 类型错误

```bash
# 查看详细类型错误
npm run typecheck

# 跳过类型检查快速构建
npm run build:fast
```

#### 内存不足

```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

### 5.2 包体积过大

1. **分析构建产物**:
   ```bash
   npm run build:analyze
   ```

2. **检查大型依赖**:
   - 使用 `import()` 动态导入大型库
   - 检查是否有重复依赖

3. **检查图片资源**:
   - 压缩图片
   - 转换为 SVG 或 WebP

### 5.3 开发服务器问题

#### 端口被占用

```bash
# 使用其他端口
npm run dev -- --port 3001
```

#### HMR 不生效

1. 检查浏览器 Console 是否有 WebSocket 错误
2. 清理 Vite 缓存: `npm run clean:all`
3. 重启开发服务器

### 5.4 iframe 嵌入问题

#### 跨域问题

开发服务器已配置 CORS：

```typescript
server: {
  cors: true,
}
```

#### 样式冲突

确保使用 Tailwind CSS 的 preflight 或 scoped 样式。

---

## 附录

### A. 环境变量

项目不使用 `.env` 文件，所有配置通过以下方式管理：

| 配置类型 | 管理方式 |
|----------|----------|
| 向量 API | 游戏内设置界面 |
| SillyTavern 集成 | 自动从宿主获取 |
| 构建分析 | `ANALYZE=true` 环境变量 |

### B. 依赖版本

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "idb": "^8.0.3",
  "zod": "^4.1.13",
  "vite": "^6.2.0",
  "typescript": "~5.8.2"
}
```

### C. 浏览器支持

```json
{
  "browserslist": [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "last 2 Safari versions",
    "last 2 Edge versions"
  ]
}
```

---

> 📝 **文档说明**: 本指南详细说明了仙侠卡牌RPG项目的构建配置和优化策略。构建过程中如遇问题，请先参考本文档的常见问题章节。