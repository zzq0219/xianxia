import { useEffect, useRef } from 'react';

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 返回一个新的防抖函数
 */
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const DEBOUNCE_DELAY = 150;
const HEIGHT_CHANGE_THRESHOLD = 10; // 只有高度变化超过此值才发送消息

/**
 * @file useIframeHeightSync.ts
 * @description React Hook for synchronizing iframe height with its content.
 *              Inspired by the Vue composable, adapted for React and SillyTavern.
 *
 * Features:
 * - Automatically syncs iframe height with the parent window (SillyTavern).
 * - Uses ResizeObserver to efficiently detect content height changes.
 * - Uses postMessage, suitable for cross-origin iframes.
 * - Debounces height updates to optimize performance.
 * - Only sends updates when the height change exceeds a certain threshold to avoid unnecessary messages.
 */
export function useIframeHeightSync() {
  const lastSentHeight = useRef<number>(0);

  useEffect(() => {
    // 1. 检查是否在 iframe 中
    if (window.self === window.top) {
      console.log('[IframeHeightSync] Not in an iframe, skipping activation.');
      return;
    }

    // 2. 定义发送高度的函数
    const sendHeight = () => {
      // 使用 document.documentElement.scrollHeight 获取整个文档的高度
      const newHeight = document.documentElement.scrollHeight;

      const heightDiff = Math.abs(newHeight - lastSentHeight.current);

      // 仅在高度实际变化且超过阈值时发送消息
      if (newHeight > 0 && heightDiff >= HEIGHT_CHANGE_THRESHOLD) {
        // SillyTavern 期望的消息格式
        window.parent.postMessage({ type: 'set-frame-height', height: newHeight }, '*');
        lastSentHeight.current = newHeight;
        console.log(`[IframeHeightSync] Sent height update: ${newHeight}px`);
      }
    };

    // 3. 创建防抖版本的发送函数
    const debouncedSendHeight = debounce(sendHeight, DEBOUNCE_DELAY);

    // 4. 使用 ResizeObserver 监听内容高度变化
    const observer = new ResizeObserver(debouncedSendHeight);

    // 监听 <html> 元素，这是最可靠的整体高度来源
    const targetNode = document.documentElement;
    observer.observe(targetNode);
    console.log('[IframeHeightSync] Activated. Observing document element.');

    // 5. 初始时发送一次高度，确保初次加载时高度正确
    // 延迟发送以等待页面完全渲染
    const initialTimer = setTimeout(sendHeight, 300);

    // 6. 清理函数
    return () => {
      observer.disconnect();
      clearTimeout(initialTimer);
      console.log('[IframeHeightSync] Deactivated.');
    };
  }, []); // 空依赖数组确保只在组件挂载和卸载时运行
}