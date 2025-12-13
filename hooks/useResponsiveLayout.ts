import { useEffect, useState } from 'react';

interface LayoutConfig {
  isCompact: boolean;        // 紧凑模式（高度 < 600px）
  isMiniMode: boolean;        // 迷你模式（高度 < 500px）
  isMobile: boolean;          // 移动端（宽度 < 768px）
  availableHeight: number;    // 可用高度
  availableWidth: number;     // 可用宽度
  contentHeight: number;      // 内容区域高度
  shouldHideTopBar: boolean;  // 是否隐藏顶栏
}

/**
 * 响应式布局Hook - 专为iframe环境优化
 * 根据容器尺寸自动调整UI布局
 */
export const useResponsiveLayout = (): LayoutConfig => {
  const [layout, setLayout] = useState<LayoutConfig>({
    isCompact: false,
    isMiniMode: false,
    isMobile: false,
    availableHeight: window.innerHeight,
    availableWidth: window.innerWidth,
    contentHeight: window.innerHeight,
    shouldHideTopBar: false,
  });

  useEffect(() => {
    const updateLayout = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;

      // 计算各种断点
      const isMiniMode = height < 500;
      const isCompact = height < 600;
      const isMobile = width < 768;

      // 计算内容区域高度
      // 顶栏: 64px (正常) / 48px (紧凑) / 0px (隐藏)
      // 底栏: 112px (正常) / 80px (紧凑)
      const topBarHeight = isMiniMode ? 0 : isCompact ? 48 : 64;
      const bottomBarHeight = isCompact ? 80 : 112;
      const contentHeight = height - topBarHeight - bottomBarHeight;

      setLayout({
        isCompact,
        isMiniMode,
        isMobile,
        availableHeight: height,
        availableWidth: width,
        contentHeight: Math.max(contentHeight, 200), // 最小200px
        shouldHideTopBar: isMiniMode,
      });
    };

    // 初始化
    updateLayout();

    // 监听窗口变化
    window.addEventListener('resize', updateLayout);
    
    // iframe特殊处理：监听父窗口的尺寸变化
    const observer = new ResizeObserver(updateLayout);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('resize', updateLayout);
      observer.disconnect();
    };
  }, []);

  return layout;
};

/**
 * 滚动控制Hook - 用于顶栏自动隐藏
 */
export const useScrollDirection = () => {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return isScrollingDown;
};