import React from 'react';

/**
 * 增强版进度条组件示例集合
 * 展示各种仙侠风格的进度条和状态显示
 */

// ==================== 基础进度条 ====================

/**
 * HP 生命值进度条
 */
export const HPBar: React.FC<{
    current: number;
    max: number;
    showLabel?: boolean;
    animated?: boolean;
}> = ({ current, max, showLabel = true, animated = true }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className="space-y-1">
            {showLabel && (
                <div className="flex justify-between text-xs">
                    <span className="text-red-400 font-medium">❤️ 生命</span>
                    <span className="text-gray-300 font-mono">
                        {Math.floor(current)}/{max}
                    </span>
                </div>
            )}
            <div className={`hp-bar-enhanced ${animated ? '' : 'no-animation'}`}>
                <div
                    className="hp-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

/**
 * MP 法力值进度条
 */
export const MPBar: React.FC<{
    current: number;
    max: number;
    showLabel?: boolean;
    animated?: boolean;
}> = ({ current, max, showLabel = true, animated = true }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className="space-y-1">
            {showLabel && (
                <div className="flex justify-between text-xs">
                    <span className="text-blue-400 font-medium">💧 法力</span>
                    <span className="text-gray-300 font-mono">
                        {Math.floor(current)}/{max}
                    </span>
                </div>
            )}
            <div className={`mp-bar-enhanced ${animated ? '' : 'no-animation'}`}>
                <div
                    className="mp-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

/**
 * EXP 经验值进度条
 */
export const EXPBar: React.FC<{
    current: number;
    max: number;
    level?: number;
    showLabel?: boolean;
}> = ({ current, max, level, showLabel = true }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className="space-y-1">
            {showLabel && (
                <div className="flex justify-between text-xs">
                    <span className="text-purple-400 font-medium">
                        ⭐ {level ? `等级 ${level}` : '经验'}
                    </span>
                    <span className="text-gray-300 font-mono">
                        {Math.floor(current)}/{max}
                    </span>
                </div>
            )}
            <div className="exp-bar-enhanced">
                <div
                    className="exp-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// ==================== 特殊进度条 ====================

/**
 * 修炼进度条（带境界显示）
 */
export const CultivationBar: React.FC<{
    current: number;
    max: number;
    realm: string;
}> = ({ current, max, realm }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xianxia-gold-400 font-bold">🔮 {realm}</span>
                <span className="text-gray-300 text-sm">
                    {percentage.toFixed(1)}%
                </span>
            </div>
            <div className="relative h-6 rounded-full bg-stone-800 border border-xianxia-gold-600/30 overflow-hidden">
                {/* 背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-xianxia-gold-500/10 to-transparent animate-shimmer" />

                {/* 进度填充 */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-xianxia-gold-500 to-xianxia-gold-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                >
                    {/* 内部高光 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                </div>

                {/* 文字 */}
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white text-shadow-strong">
                    {Math.floor(current)} / {max}
                </div>
            </div>
        </div>
    );
};

/**
 * 战斗充能条
 */
export const ChargeBar: React.FC<{
    current: number;
    max: number;
    label?: string;
}> = ({ current, max, label = '能量' }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    const isReady = percentage >= 100;

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className={`font-medium ${isReady ? 'text-xianxia-gold-400 animate-pulse' : 'text-gray-400'}`}>
                    ⚡ {label}
                </span>
                <span className="text-gray-300">{Math.floor(percentage)}%</span>
            </div>
            <div className={`relative h-3 rounded-full bg-stone-800 border overflow-hidden ${isReady ? 'border-xianxia-gold-400 shadow-glow-gold animate-pulse-glow' : 'border-stone-600'
                }`}>
                <div
                    className={`h-full transition-all duration-300 ${isReady
                            ? 'bg-gradient-to-r from-xianxia-gold-500 to-xianxia-gold-400 animate-shimmer'
                            : 'bg-gradient-to-r from-blue-600 to-blue-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

/**
 * Boss 血量条（分段式）
 */
export const BossHPBar: React.FC<{
    current: number;
    max: number;
    name: string;
    segments?: number;
}> = ({ current, max, name, segments = 5 }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    const segmentWidth = 100 / segments;

    return (
        <div className="space-y-2">
            {/* Boss 名称 */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-blood-400 text-shadow-glow flex items-center gap-2">
                    👹 {name}
                </h3>
                <span className="text-gray-300 text-sm font-mono">
                    {Math.floor(current)}/{max}
                </span>
            </div>

            {/* 分段血条 */}
            <div className="relative h-8 rounded-lg bg-stone-900 border-2 border-blood-600 shadow-glow-red overflow-hidden">
                {/* 背景分段线 */}
                <div className="absolute inset-0 flex">
                    {Array.from({ length: segments }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 border-r border-stone-700 last:border-r-0"
                        />
                    ))}
                </div>

                {/* 血量填充 */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                >
                    {/* 内部高光 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />

                    {/* 流动光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
            </div>
        </div>
    );
};

// ==================== 圆形进度条 ====================

/**
 * 圆形进度条（用于倒计时、技能冷却等）
 */
export const CircularProgress: React.FC<{
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
}> = ({
    percentage,
    size = 100,
    strokeWidth = 8,
    color = '#fcd34d',
    label
}) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative inline-flex items-center justify-center">
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* 背景圆 */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(41, 37, 36, 0.5)"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />

                    {/* 进度圆 */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                        style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
                    />
                </svg>

                {/* 中心文字 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-xianxia-gold-400">
                        {Math.round(percentage)}%
                    </span>
                    {label && (
                        <span className="text-xs text-gray-400">{label}</span>
                    )}
                </div>
            </div>
        );
    };

// ==================== 组合状态显示 ====================

/**
 * 角色完整状态面板
 */
export const CharacterStatusPanel: React.FC<{
    name: string;
    level: number;
    hp: { current: number; max: number };
    mp: { current: number; max: number };
    exp: { current: number; max: number };
}> = ({ name, level, hp, mp, exp }) => {
    return (
        <div className="ornate-border border-xianxia-gold-600 p-4 space-y-3 bg-gradient-to-br from-stone-800 to-stone-900 rounded-lg">
            {/* 标题 */}
            <div className="flex items-center justify-between border-b border-stone-700 pb-2">
                <h3 className="text-lg font-bold text-xianxia-gold-300">{name}</h3>
                <span className="px-3 py-1 bg-xianxia-gold-600 text-stone-900 rounded-full text-sm font-bold">
                    Lv.{level}
                </span>
            </div>

            {/* 状态条 */}
            <HPBar current={hp.current} max={hp.max} />
            <MPBar current={mp.current} max={mp.max} />
            <EXPBar current={exp.current} max={exp.max} level={level} />
        </div>
    );
};

// ==================== 使用示例 ====================

export const ProgressBarShowcase: React.FC = () => {
    return (
        <div className="p-8 space-y-8 bg-stone-900">
            {/* 基础进度条 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">基础进度条</h3>
                <div className="space-y-4 max-w-md">
                    <HPBar current={750} max={1000} />
                    <MPBar current={320} max={500} />
                    <EXPBar current={4500} max={10000} level={25} />
                </div>
            </section>

            {/* 特殊进度条 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">特殊进度条</h3>
                <div className="space-y-4 max-w-md">
                    <CultivationBar current={6800} max={10000} realm="筑基期" />
                    <ChargeBar current={85} max={100} label="大招能量" />
                    <ChargeBar current={100} max={100} label="必杀技" />
                </div>
            </section>

            {/* Boss 血条 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">Boss 血条</h3>
                <div className="max-w-2xl">
                    <BossHPBar
                        current={47500}
                        max={100000}
                        name="九幽魔尊"
                        segments={5}
                    />
                </div>
            </section>

            {/* 圆形进度 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">圆形进度</h3>
                <div className="flex gap-8">
                    <CircularProgress percentage={75} label="技能冷却" />
                    <CircularProgress
                        percentage={100}
                        color="#ef4444"
                        label="准备就绪"
                        size={120}
                    />
                </div>
            </section>

            {/* 完整状态面板 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">完整状态面板</h3>
                <div className="max-w-md">
                    <CharacterStatusPanel
                        name="剑灵仙子"
                        level={45}
                        hp={{ current: 8500, max: 10000 }}
                        mp={{ current: 3200, max: 5000 }}
                        exp={{ current: 75000, max: 100000 }}
                    />
                </div>
            </section>
        </div>
    );
};

/**
 * 使用说明：
 * 
 * 1. 引入所需的进度条组件：
 *    import { HPBar, MPBar, BossHPBar } from './components/examples/EnhancedProgressBars.example';
 * 
 * 2. 确保已引入 enhanced-ui.css 样式文件
 * 
 * 3. 使用示例：
 *    <HPBar current={character.hp} max={character.maxHp} />
 *    <BossHPBar current={boss.hp} max={boss.maxHp} name={boss.name} />
 * 
 * 4. 样式类参考：
 *    - hp-bar-enhanced: HP进度条样式
 *    - mp-bar-enhanced: MP进度条样式
 *    - exp-bar-enhanced: 经验条样式
 *    - animate-shimmer: 闪光动画
 *    - shadow-glow-gold/red: 发光阴影
 */