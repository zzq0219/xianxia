# 劳役系统UI设计文档

## 概述
劳役系统允许玩家将囚犯分配到矿山或采药点进行劳役，劳役完成后可以领取AI生成的材料奖励。

## 技术实现

### 数据结构
- **LaborSite**: 劳役位置（矿山/采药）
  - id: 位置ID
  - type: '矿山' | '采药'
  - name: 位置名称
  - description: 位置描述
  - maxWorkers: 2（固定）
  - workers: LaborWorker[]

- **LaborWorker**: 正在劳役的囚犯
  - prisonerId: 囚犯ID
  - prisonerName: 囚犯名字
  - startTime: 开始时间戳
  - endTime: 结束时间戳
  - duration: 持续时间（小时）
  - status: 'working' | 'completed'

- **LaborMaterial**: 劳役材料
  - id, name, type ('ore'|'herb'), rarity, description, value

### UI组件结构

```
劳役区界面
├── 劳役位置列表
│   ├── 矿山卡片
│   │   ├── 位置信息（名称、描述）
│   │   ├── 工位1（空闲/工作中）
│   │   │   ├── 囚犯信息（名字、头像）
│   │   │   ├── 进度条（实时更新）
│   │   │   ├── 剩余时间
│   │   │   └── "领取结果"按钮（完成后）
│   │   └── 工位2（同上）
│   └── 采药点卡片（同上）
└── 材料库存面板
    └── 材料列表（名称、类型、稀有度、数量）
```

## UI设计细节

### 1. 劳役位置卡片
- **布局**: 网格布局，每个位置一个卡片
- **颜色方案**:
  - 矿山: 橙色/棕色主题
  - 采药: 绿色/青色主题
- **图标**:
  - 矿山: fa-mountain / fa-hammer
  - 采药: fa-leaf / fa-seedling

### 2. 工位状态显示

#### 空闲工位
```
┌─────────────────────┐
│   [空闲工位]         │
│                     │
│   👤 无囚犯         │
│                     │
│  [+] 分配囚犯       │
└─────────────────────┘
```

#### 工作中工位
```
┌─────────────────────┐
│ 🔨 工作中            │
│                     │
│ 👤 张三（炼气五层）  │
│ ━━━━━━━━━━ 65%     │
│ ⏱️ 剩余: 2小时30分  │
│                     │
│ [等待完成...]        │
└─────────────────────┘
```

#### 完成工位
```
┌─────────────────────┐
│ ✅ 已完成            │
│                     │
│ 👤 张三（炼气五层）  │
│ ━━━━━━━━━━ 100%    │
│ ⏱️ 可领取            │
│                     │
│ [领取结果] 按钮      │
└─────────────────────┘
```

### 3. 分配囚犯流程
1. 点击"分配囚犯"按钮
2. 弹出对话框：
   - 选择囚犯（下拉列表，显示可用囚犯）
   - 输入劳役时长（小时，1-24）
   - 预览信息
   - 确认/取消按钮

### 4. 进度条实时更新
- 使用 `useEffect` + `setInterval` 每秒更新进度
- 计算公式: `progress = (now - startTime) / (endTime - startTime) * 100`
- 颜色渐变:
  - 0-30%: 红色
  - 31-70%: 黄色
  - 71-99%: 橙色
  - 100%: 绿色

### 5. 材料库存面板
```
┌─────────────────────────────────────┐
│ 📦 材料库存                          │
├─────────────────────────────────────┤
│ 🪨 灵石矿 (珍品) x45               │
│ 🌿 七星草 (良品) x32               │
│ ⚡ 雷纹石 (绝品) x12               │
│ 🍃 云雾花 (优品) x28               │
└─────────────────────────────────────┘
```

## 实现步骤

### 步骤1: 添加劳役区渲染函数
在 `PrisonModal.tsx` 中添加 `renderLaborArea()` 函数

### 步骤2: 创建工位组件
```typescript
interface LaborSlotProps {
  site: LaborSite;
  slotIndex: number;
  worker: LaborWorker | null;
  onAssign: (siteId: string) => void;
  onClaim: (siteId: string, workerId: string) => void;
  prisoners: Prisoner[];
}
```

### 步骤3: 实现进度条组件
```typescript
const ProgressBar: React.FC<{startTime: number; endTime: number}> = ({...}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const total = endTime - startTime;
      const elapsed = now - startTime;
      setProgress(Math.min(100, (elapsed / total) * 100));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, endTime]);
  
  return <div className="progress-bar">...</div>;
};
```

### 步骤4: 分配囚犯对话框
- 使用模态框或内嵌表单
- 验证输入（时长1-24小时）
- 显示预计完成时间

### 步骤5: 材料库存显示
- 按类型分类（矿石/草药）
- 按稀有度排序
- 显示总价值

## 交互逻辑

### 分配劳役
```typescript
const handleAssignClick = (siteId: string) => {
  // 1. 获取可用囚犯（状态不包含'劳役中'）
  const available = prisoners.filter(p => !p.status.includes('劳役中'));
  
  // 2. 显示选择器
  setAssignDialog({
    isOpen: true,
    siteId,
    availablePrisoners: available
  });
};

const handleConfirmAssign = (prisonerId: string, duration: number) => {
  onAssignLabor(prisonerId, assignDialog.siteId, duration);
  setAssignDialog({ isOpen: false, siteId: '', availablePrisoners: [] });
};
```

### 领取结果
```typescript
const handleClaimClick = (siteId: string, workerId: string) => {
  if (onClaimLaborResult) {
    onClaimLaborResult(siteId, workerId);
  }
};
```

## 样式设计

### 颜色主题
```css
.labor-mine {
  --primary: #f97316; /* orange-500 */
  --secondary: #78350f; /* orange-950 */
  --accent: #fdba74; /* orange-300 */
}

.labor-herb {
  --primary: #22c55e; /* green-500 */
  --secondary: #14532d; /* green-950 */
  --accent: #86efac; /* green-300 */
}
```

### 响应式设计
- 桌面: 2列布局（矿山 | 采药）
- 平板: 1列布局，堆叠显示
- 手机: 全宽卡片

## 错误处理

### 前端验证
- [x] 工位已满提示
- [x] 囚犯已在劳役中提示
- [x] 时长范围验证（1-24小时）

### 后端错误
- [x] AI生成失败提示
- [x] 网络错误重试机制

## 待实现功能（可选）

### 阶段2增强
- [ ] 劳役加速道具
- [ ] 囚犯技能影响产量
- [ ] 材料品质随机事件
- [ ] 劳役中突发事件（逃跑、受伤等）
- [ ] 批量分配功能
- [ ] 劳役记录历史查询

### 阶段3优化
- [ ] 自动劳役（归顺度高的囚犯）
- [ ] 材料市场交易
- [ ] 劳役成就系统
- [ ] 数据可视化图表

## 测试要点

1. **功能测试**
   - [ ] 正常分配劳役
   - [ ] 正常领取结果
   - [ ] 工位满员拒绝
   - [ ] 囚犯重复分配拒绝
   - [ ] 进度条实时更新

2. **边界测试**
   - [ ] 时长 = 0
   - [ ] 时长 > 24
   - [ ] 同时多个工位工作
   - [ ] 快速点击防抖

3. **集成测试**
   - [ ] AI生成材料正确
   - [ ] 材料添加到库存
   - [ ] 囚犯状态正确更新
   - [ ] 记忆系统记录正确

## 性能优化

1. **进度条优化**
   - 使用 `requestAnimationFrame` 替代 `setInterval`
   - 页面不可见时暂停更新

2. **材料列表优化**
   - 虚拟滚动（材料 > 100时）
   - 懒加载图标

3. **状态管理优化**
   - 避免不必要的重新渲染
   - 使用 `useMemo` 缓存计算结果

## 完成标准

- [x] 类型定义完整
- [x] AI服务函数实现
- [x] App.tsx业务逻辑实现
- [ ] PrisonModal劳役区UI实现 ⬅️ 当前步骤
- [ ] 分配囚犯对话框
- [ ] 进度条实时更新
- [ ] 材料库存显示
- [ ] 完整交互流程测试

---

**文档版本**: 1.0  
**最后更新**: 2025-11-22  
**负责人**: AI Assistant