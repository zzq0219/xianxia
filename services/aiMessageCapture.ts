/**
 * AI消息捕获服务
 * 监听SillyTavern的AI消息生成事件，自动保存到记忆系统
 */

import { MemoryCategory } from '../types';

// 消息分类关键词映射
const CATEGORY_KEYWORDS: Record<MemoryCategory, string[]> = {
  '探索': ['探索', '发现', '前往', '到达', '离开', '进入', '出发', '地图', '位置', '区域', '场景', '奇遇', '随机事件', '遇见', '路过', '寻找', '搜索', '调查'],
  '战斗': ['战斗', '攻击', '防御', '技能', '释放', '造成', '受到', '伤害', '击败', '胜利', '失败', '敌人', '怪物', '对手', '竞技场', '对决', '挑战', '回合', '排行榜', '榜单', '排名', '积分'],
  '商城': ['商城', '抽卡', '抽取', '招募', '购买', '卡池', '人物卡牌', '装备', '通用技能', '兽宠', '同人', '灵感', '召唤', '天机', '万象寻仙', '百炼阁', '万法楼', '御兽斋', '异界降临', '神兵天成', '大道顿悟', '灵兽创生', '法宝', '防具', '功法', '灵兽', '契约', '锻造', '领悟', '创造'],
  '医馆': ['医馆', '问诊', '诊断', '治疗', '医治', '症状', '病情', '药物', '处方', '康复', '伤势', '疾病', '患者', '病历', '走火入魔'],
  '悬赏': ['悬赏', '任务', '委托', '接取', '完成', '奖励', '目标', '追捕', '调查', '赏金', '猎人', '追踪', '线索', '千乳圣女'],
  '培育': ['培育', '修炼', '突破', '提升', '境界', '灵力', '功法', '炼丹', '炼器', '成长', '进阶', '繁殖', '孕育', '育灵轩', '监测', '配种', '后代'],
  '商业': ['商业', '交易', '出售', '价格', '灵石', '商店', '商人', '买卖', '交换', '货物', '店铺', '收入', '员工', '经营', '生意', '青楼', '角斗场', '炼丹房', '拍卖行', '情报阁', '监视', '头牌', '角斗士', '奴隶'],
  '声望': ['声望', '名声', '威望', '名气', '事迹', '名望', '江湖', '传闻', '称号', '侠义', '恶行', '风流', '天机阁'],
  '公告': ['公告', '宗门', '世界', '奇遇', '通知', '消息', '天元', '惊蛰', '宗门排行', '野榜', '区域榜', '世界榜'],
  '大牢': ['大牢', '监狱', '囚犯', '审讯', '刑法', '狱卒', '牢房', '劳役', '囚禁', '关押', '拷问', '禁闭', '越狱', '赎金'],
  '其他': [], // 默认分类
};

// 界面场景映射到记忆类别
const SCENE_TO_CATEGORY: Record<string, MemoryCategory> = {
  'exploration': '探索',
  'map': '探索',
  'battle': '战斗',
  'arena': '战斗',
  'shop': '商城',
  'gacha': '商城',
  'hospital': '医馆',
  'consultation': '医馆',
  'bounty': '悬赏',
  'cultivation': '培育',
  'business': '商业',
  'surveillance': '商业',  // 监视也是商业的一部分
  'reputation': '声望',
  'announcement': '公告',
  'telepathy': '其他',  // 传音对话暂时归类到其他
  'interaction': '其他',
  'party': '其他',
  'inventory': '其他',
};

export interface CapturedMessage {
  content: string;
  timestamp: string;
  source: 'ai' | 'user';
  messageId?: number;
  scene?: string; // 当前场景/界面
}

export class AIMessageCaptureService {
  private onMessageCallback?: (message: CapturedMessage, category: MemoryCategory) => void;
  private currentScene: string = 'unknown';
  private isEnabled: boolean = true;
  private eventListenersRegistered: boolean = false;

  /**
   * 设置消息接收回调
   */
  setMessageCallback(callback: (message: CapturedMessage, category: MemoryCategory) => void) {
    this.onMessageCallback = callback;
  }

  /**
   * 设置当前场景
   */
  setCurrentScene(scene: string) {
    this.currentScene = scene;
  }

  /**
   * 启用/禁用消息捕获
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * 根据内容和场景自动分类消息
   */
  private categorizeMessage(content: string, scene?: string): MemoryCategory {
    // 首先根据场景判断
    if (scene && SCENE_TO_CATEGORY[scene]) {
      return SCENE_TO_CATEGORY[scene];
    }

    // 然后根据关键词判断
    let maxScore = 0;
    let bestCategory: MemoryCategory = '其他';

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.length === 0) continue;

      let score = 0;
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          score++;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestCategory = category as MemoryCategory;
      }
    }

    return bestCategory;
  }

  /**
   * 处理捕获的消息
   */
  private handleCapturedMessage(message: CapturedMessage) {
    if (!this.isEnabled || !this.onMessageCallback) {
      return;
    }

    const category = this.categorizeMessage(message.content, message.scene || this.currentScene);
    this.onMessageCallback(message, category);
  }

  /**
   * 注册SillyTavern事件监听器
   * 需要在SillyTavern环境中调用
   */
  registerEventListeners() {
    if (this.eventListenersRegistered) {
      console.log('[AI消息捕获] 事件监听器已注册');
      return;
    }

    // 检查是否在SillyTavern环境中
    if (typeof window === 'undefined' || !(window as any).eventOn) {
      console.warn('[AI消息捕获] 未检测到SillyTavern环境，无法注册事件监听器');
      return;
    }

    const eventOn = (window as any).eventOn;
    const tavern_events = (window as any).tavern_events;
    const iframe_events = (window as any).iframe_events;

    console.log('[AI消息捕获] 开始注册事件监听器...');

    // 监听AI消息接收事件
    eventOn(tavern_events.MESSAGE_RECEIVED, (messageId: number, type?: string) => {
      console.log(`[AI消息捕获] 接收到消息 #${messageId}, 类型: ${type || 'unknown'}`);
      
      try {
        // 获取最新消息
        const getChatMessages = (window as any).getChatMessages;
        if (getChatMessages) {
          const messages = getChatMessages(-1); // 获取最新一条消息
          if (messages && messages.length > 0) {
            const lastMessage = messages[0];
            
            // 只捕获AI的消息（assistant角色）
            if (lastMessage.role === 'assistant') {
              this.handleCapturedMessage({
                content: lastMessage.message,
                timestamp: new Date().toISOString(),
                source: 'ai',
                messageId: messageId,
                scene: this.currentScene,
              });
            }
          }
        }
      } catch (error) {
        console.error('[AI消息捕获] 处理MESSAGE_RECEIVED事件时出错:', error);
      }
    });

    // 监听生成结束事件（作为备用）
    eventOn(tavern_events.GENERATION_ENDED, (messageId: number) => {
      console.log(`[AI消息捕获] 生成结束 #${messageId}`);
    });

    // 监听iframe生成结束事件
    if (iframe_events && iframe_events.GENERATION_ENDED) {
      eventOn(iframe_events.GENERATION_ENDED, (text: string, generationId: string) => {
        console.log(`[AI消息捕获] Iframe生成结束, ID: ${generationId}`);
        
        if (text && text.trim()) {
          this.handleCapturedMessage({
            content: text,
            timestamp: new Date().toISOString(),
            source: 'ai',
            scene: this.currentScene,
          });
        }
      });
    }

    this.eventListenersRegistered = true;
    console.log('[AI消息捕获] 事件监听器注册完成');
  }

  /**
   * 手动捕获消息（用于非SillyTavern环境或测试）
   */
  captureMessage(content: string, scene?: string) {
    this.handleCapturedMessage({
      content,
      timestamp: new Date().toISOString(),
      source: 'ai',
      scene: scene || this.currentScene,
    });
  }

  /**
   * 清理事件监听器
   */
  cleanup() {
    if (typeof window !== 'undefined' && (window as any).eventClearAll) {
      console.log('[AI消息捕获] 清理事件监听器');
      // 注意：这会清除所有监听器，实际使用时可能需要更精细的控制
      // 这里仅作为示例
    }
    this.eventListenersRegistered = false;
  }
}

// 创建单例实例
export const aiMessageCapture = new AIMessageCaptureService();