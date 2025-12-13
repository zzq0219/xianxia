import { EtiquetteSystem, WeeklyTheme } from '../types/etiquette';

/**
 * 检查并自动切换主题周
 * @param etiquetteSystem 当前礼仪系统状态
 * @returns 更新后的礼仪系统状态（如果有变化）
 */
export function checkAndSwitchWeeklyTheme(etiquetteSystem: EtiquetteSystem): EtiquetteSystem {
  const now = Date.now();
  
  // 如果没有当前主题，检查是否有待启动的主题
  if (!etiquetteSystem.currentTheme) {
    const upcomingThemes = etiquetteSystem.weeklyThemes
      .filter(t => t.status === 'upcoming')
      .sort((a, b) => a.startTime - b.startTime);
    
    if (upcomingThemes.length > 0) {
      const nextTheme = upcomingThemes[0];
      if (nextTheme.startTime <= now) {
        return activateTheme(etiquetteSystem, nextTheme.id);
      }
    }
    return etiquetteSystem;
  }
  
  // 检查当前主题是否已过期
  if (etiquetteSystem.currentTheme.endTime <= now) {
    console.log('[主题周] 当前主题已过期，准备切换');
    
    // 将当前主题标记为completed
    const updatedThemes = etiquetteSystem.weeklyThemes.map(t =>
      t.id === etiquetteSystem.currentTheme?.id
        ? { ...t, status: 'completed' as const }
        : t
    );
    
    // 查找下一个待启动的主题
    const upcomingThemes = updatedThemes
      .filter(t => t.status === 'upcoming')
      .sort((a, b) => a.startTime - b.startTime);
    
    if (upcomingThemes.length > 0) {
      const nextTheme = upcomingThemes[0];
      console.log(`[主题周] 切换到新主题: ${nextTheme.name}`);
      
      return {
        ...etiquetteSystem,
        weeklyThemes: updatedThemes.map(t =>
          t.id === nextTheme.id
            ? { ...t, status: 'active' as const, startTime: now, endTime: now + 7 * 24 * 60 * 60 * 1000 }
            : t
        ),
        currentTheme: { ...nextTheme, status: 'active', startTime: now, endTime: now + 7 * 24 * 60 * 60 * 1000 },
      };
    }
    
    // 没有待启动的主题，清空当前主题
    console.log('[主题周] 没有待启动的主题，清空当前主题');
    return {
      ...etiquetteSystem,
      weeklyThemes: updatedThemes,
      currentTheme: null,
    };
  }
  
  return etiquetteSystem;
}

/**
 * 激活指定主题
 * @param etiquetteSystem 当前礼仪系统状态
 * @param themeId 要激活的主题ID
 * @returns 更新后的礼仪系统状态
 */
export function activateTheme(etiquetteSystem: EtiquetteSystem, themeId: string): EtiquetteSystem {
  const theme = etiquetteSystem.weeklyThemes.find(t => t.id === themeId);
  if (!theme) return etiquetteSystem;
  
  const now = Date.now();
  const weekDuration = 7 * 24 * 60 * 60 * 1000;
  
  // 将之前的active主题设为completed
  const updatedThemes = etiquetteSystem.weeklyThemes.map(t => {
    if (t.status === 'active') {
      return { ...t, status: 'completed' as const };
    }
    if (t.id === themeId) {
      return { ...t, status: 'active' as const, startTime: now, endTime: now + weekDuration };
    }
    return t;
  });
  
  return {
    ...etiquetteSystem,
    weeklyThemes: updatedThemes,
    currentTheme: { ...theme, status: 'active', startTime: now, endTime: now + weekDuration },
  };
}

/**
 * 从工作栏自动规划主题周
 * @param etiquetteSystem 当前礼仪系统状态
 * @returns 更新后的礼仪系统状态
 */
export function autoScheduleThemesFromWorkbench(etiquetteSystem: EtiquetteSystem): EtiquetteSystem {
  if (!etiquetteSystem.designerWorkbench) return etiquetteSystem;
  
  const now = Date.now();
  const weekDuration = 7 * 24 * 60 * 60 * 1000;
  
  // 获取已完成但还没转化为实际主题的工作项
  const completedWorkItems = etiquetteSystem.designerWorkbench.workItems
    .filter(item => item.status === 'completed' && item.theme)
    .filter(item => {
      // 检查该主题是否已经添加到weeklyThemes中
      const themeExists = etiquetteSystem.weeklyThemes.some(t => 
        t.name === item.theme?.name && 
        t.description === item.theme?.description
      );
      return !themeExists;
    });
  
  if (completedWorkItems.length === 0) return etiquetteSystem;
  
  console.log(`[主题周] 从工作栏自动规划 ${completedWorkItems.length} 个主题`);
  
  // 计算最后一个主题的结束时间
  const lastThemeEndTime = etiquetteSystem.weeklyThemes
    .filter(t => t.status !== 'completed')
    .reduce((max, t) => Math.max(max, t.endTime), now);
  
  // 为每个完成的工作项创建主题周
  let nextStartTime = lastThemeEndTime;
  const newThemes: WeeklyTheme[] = completedWorkItems.map((item, index) => {
    const startTime = nextStartTime + index * weekDuration;
    return {
      ...item.theme!,
      id: `theme_${Date.now()}_${index}`,
      startTime,
      endTime: startTime + weekDuration,
      status: 'upcoming' as const,
      createdAt: Date.now(),
      designedBy: etiquetteSystem.designer?.characterId,
    };
  });
  
  return {
    ...etiquetteSystem,
    weeklyThemes: [...etiquetteSystem.weeklyThemes, ...newThemes],
  };
}

/**
 * 获取主题周的剩余时间
 * @param theme 主题周
 * @returns 剩余时间描述
 */
export function getThemeRemainingTime(theme: WeeklyTheme): string {
  const now = Date.now();
  const remaining = theme.endTime - now;
  
  if (remaining <= 0) return '已结束';
  
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) {
    return `剩余 ${days}天 ${hours}小时`;
  }
  return `剩余 ${hours}小时`;
}

/**
 * 初始化工作栏（当指派新设计师时）
 * @param designerId 设计师角色ID
 * @returns 新的工作栏
 */
export function initializeWorkbench(designerId: string) {
  return {
    designerId,
    workItems: [],
    currentWeek: 1,
    totalWeeksPlanned: 0,
  };
}