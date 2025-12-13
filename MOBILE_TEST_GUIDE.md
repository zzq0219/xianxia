# 📱 手机端测试指南

## 概述

本指南介绍如何使用 `mobile-iframe-test.html` 测试仙侠卡牌RPG游戏的手机端体验。

## 🚀 快速开始

### 1. 启动开发服务器

```bash
npm run dev
```

确保应用运行在 `http://localhost:3000`

### 2. 打开测试页面

在浏览器中访问：
```
http://localhost:3000/mobile-iframe-test.html
```

或者直接双击 `mobile-iframe-test.html` 文件打开。

## 🎮 测试功能

### 控制面板

测试页面顶部提供了一个控制面板，包含以下功能：

1. **📱 尺寸显示**：实时显示当前窗口尺寸（宽×高）
2. **🔳 全屏按钮**：切换全屏模式，体验完整游戏界面
3. **👁️ 显示/隐藏**：切换控制面板的显示状态
4. **🔄 刷新按钮**：重新加载游戏iframe

### 全屏模式特性

- 点击"全屏"按钮进入全屏模式
- 进入全屏后会显示2秒的提示信息
- 控制面板会在3秒后自动隐藏
- 可以随时点击"显示/隐藏"按钮重新显示控制面板
- 全屏模式下，游戏的顶栏（人物信息、地理位置、灵石数量）会正常显示

## 🔧 已修复的问题

### 全屏时顶栏消失问题

**问题描述**：
在手机界面打开全屏时，顶栏的几个功能键会消失，包括：
- 人物信息界面
- 当前地理位置
- 当前灵石数量

**解决方案**：
修改了 `components/TopStatusBar.tsx` 的显示逻辑：

```typescript
// 修改前：
if (layout.shouldHideTopBar) {
  return null;
}

// 修改后：
// 全屏模式下强制显示顶栏（即使在迷你模式）
// 只在非全屏且shouldHideTopBar为true时才隐藏
if (layout.shouldHideTopBar && !isFullscreen) {
  return null;
}
```

现在顶栏会在以下情况显示：
- ✅ 全屏模式（无论窗口高度）
- ✅ 正常模式（高度 ≥ 500px）
- ❌ 非全屏且极小窗口（高度 < 500px）

## 📱 移动设备测试

### 方法1：浏览器开发者工具

1. 在Chrome/Edge中打开测试页面
2. 按 `F12` 打开开发者工具
3. 点击设备工具栏图标（或按 `Ctrl+Shift+M`）
4. 选择不同的移动设备预设：
   - iPhone SE (375×667)
   - iPhone 12 Pro (390×844)
   - iPad (768×1024)
   - Galaxy S20 (360×800)

### 方法2：真机测试

1. 确保手机和电脑在同一WiFi网络
2. 查找电脑的局域网IP地址：
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` 或 `ip addr`
3. 在手机浏览器访问：
   ```
   http://[你的IP地址]:3000/mobile-iframe-test.html
   ```
   例如：`http://192.168.1.100:3000/mobile-iframe-test.html`

## 🎯 测试检查清单

### 基础功能
- [ ] 页面正常加载
- [ ] iframe内容完整显示
- [ ] 控制面板功能正常
- [ ] 全屏切换正常工作

### 顶栏显示
- [ ] 非全屏模式下，正常高度显示顶栏
- [ ] 全屏模式下，顶栏始终显示
- [ ] 顶栏包含完整信息：
  - [ ] 人物头像和名字
  - [ ] 当前地理位置
  - [ ] 灵石数量
  - [ ] 全屏切换按钮

### 响应式布局
- [ ] 手机尺寸（< 768px）显示紧凑版顶栏
- [ ] 平板/桌面尺寸显示完整版顶栏
- [ ] 极小窗口（< 500px）非全屏时隐藏顶栏
- [ ] 极小窗口（< 500px）全屏时显示顶栏

### 交互体验
- [ ] 触摸滚动流畅
- [ ] 按钮点击响应及时
- [ ] 过渡动画流畅
- [ ] 无意外的双击缩放

## 🛠️ 技术细节

### 响应式断点

```typescript
// 来自 hooks/useResponsiveLayout.ts
const isMiniMode = height < 500;    // 迷你模式
const isCompact = height < 600;     // 紧凑模式
const isMobile = width < 768;       // 移动端模式
```

### 全屏检测

测试页面使用标准的 Fullscreen API：
- `document.fullscreenElement`
- `document.webkitFullscreenElement` (Safari)
- `document.mozFullScreenElement` (Firefox)
- `document.msFullscreenElement` (IE/Edge)

应用内部使用 `hooks/useFullscreen.ts` 实现跨浏览器兼容。

## 🐛 故障排除

### 问题：顶栏仍然不显示

**检查**：
1. 确认已应用最新的 `TopStatusBar.tsx` 修改
2. 刷新浏览器页面（Ctrl+F5 强制刷新）
3. 检查浏览器控制台是否有错误

### 问题：全屏按钮无效

**原因**：部分浏览器需要用户手势触发全屏
**解决**：确保通过点击按钮触发，而非自动触发

### 问题：iframe加载失败

**检查**：
1. 确认开发服务器正在运行
2. 确认端口3000未被占用
3. 检查防火墙设置
4. 尝试在浏览器中直接访问 `http://localhost:3000`

### 问题：手机真机无法访问

**检查**：
1. 手机和电脑在同一WiFi网络
2. 电脑防火墙允许3000端口访问
3. 使用正确的局域网IP地址（不是127.0.0.1）
4. vite配置允许网络访问：
   ```typescript
   // vite.config.ts
   server: {
     host: '0.0.0.0',  // 允许外部访问
     port: 3000
   }
   ```

## 📝 相关文件

- `mobile-iframe-test.html` - 手机端测试页面
- `components/TopStatusBar.tsx` - 顶栏组件
- `hooks/useFullscreen.ts` - 全屏功能Hook
- `hooks/useResponsiveLayout.ts` - 响应式布局Hook
- `hooks/useIframeHeightSync.ts` - Iframe高度同步Hook

## 💡 提示

1. **最佳体验**：建议在全屏模式下进行游戏测试
2. **性能测试**：可以使用Chrome DevTools的性能监视器查看FPS
3. **网络测试**：使用Chrome DevTools的网络限速功能模拟慢速网络
4. **触摸测试**：开发者工具可以模拟触摸事件
5. **自动化测试**：考虑使用Playwright或Puppeteer进行自动化测试

## 🎉 成功标准

测试成功的标志：
✅ 全屏模式下所有UI元素正常显示
✅ 顶栏信息完整可见
✅ 响应式布局在各种尺寸下正常工作
✅ 交互流畅无卡顿
✅ 无JavaScript错误

---

**更新时间**：2025-01-14
**维护者**：Kilo Code