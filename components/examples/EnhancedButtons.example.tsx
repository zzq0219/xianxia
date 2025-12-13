import React from 'react';

/**
 * 增强版按钮组件示例集合
 * 展示各种仙侠风格的按钮样式和交互效果
 */

// ==================== 主要按钮 ====================

/**
 * 主要操作按钮（金色主题）
 */
export const PrimaryButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}> = ({ children, onClick, disabled = false, size = 'md' }) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        ${sizeClasses[size]}
        btn-primary-enhanced
        relative overflow-hidden
        font-bold
        rounded-lg
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
        >
            {children}
        </button>
    );
};

/**
 * 次要按钮（蓝色主题）
 */
export const SecondaryButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}> = ({ children, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        px-4 py-2
        btn-secondary-enhanced
        relative overflow-hidden
        font-bold
        rounded-lg
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
        >
            {children}
        </button>
    );
};

/**
 * 危险按钮（红色主题）
 */
export const DangerButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}> = ({ children, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        px-4 py-2
        btn-danger-enhanced
        relative overflow-hidden
        font-bold
        rounded-lg
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
        >
            {children}
        </button>
    );
};

/**
 * 传说级按钮（传说物品、抽卡等特殊场景）
 */
export const LegendaryButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}> = ({ children, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        px-6 py-3
        btn-legendary-enhanced
        relative overflow-hidden
        font-bold text-lg
        rounded-lg
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110 animate-pulse-glow'}
      `}
        >
            <span className="relative z-10 flex items-center gap-2">
                ✨ {children} ✨
            </span>
        </button>
    );
};

// ==================== 图标按钮 ====================

/**
 * 圆形图标按钮
 */
export const IconButton: React.FC<{
    icon: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'primary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}> = ({ icon, onClick, variant = 'default', size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    };

    const variantClasses = {
        default: 'bg-stone-700/50 hover:bg-stone-600/50 border-stone-600 hover:border-xianxia-gold-500 text-gray-300 hover:text-xianxia-gold-400',
        primary: 'bg-xianxia-gold-600/50 hover:bg-xianxia-gold-500/50 border-xianxia-gold-500 hover:border-xianxia-gold-400 text-xianxia-gold-100 shadow-glow-gold',
        danger: 'bg-blood-600/50 hover:bg-blood-500/50 border-blood-500 hover:border-blood-400 text-blood-100 shadow-glow-red',
    };

    return (
        <button
            onClick={onClick}
            className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full
        border
        transition-all duration-200
        flex items-center justify-center
        hover:scale-110
        active:scale-95
      `}
        >
            {icon}
        </button>
    );
};

// ==================== 组合按钮 ====================

/**
 * 带图标的按钮
 */
export const ButtonWithIcon: React.FC<{
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick?: () => void;
    iconPosition?: 'left' | 'right';
}> = ({ icon, children, onClick, iconPosition = 'left' }) => {
    return (
        <button
            onClick={onClick}
            className="
        px-4 py-2
        btn-primary-enhanced
        rounded-lg
        font-bold
        transition-all duration-300
        hover:scale-105
        flex items-center gap-2
      "
        >
            {iconPosition === 'left' && icon}
            {children}
            {iconPosition === 'right' && icon}
        </button>
    );
};

/**
 * 按钮组
 */
export const ButtonGroup: React.FC<{
    buttons: Array<{
        label: string;
        onClick: () => void;
        active?: boolean;
    }>;
}> = ({ buttons }) => {
    return (
        <div className="inline-flex rounded-lg border border-stone-600 overflow-hidden">
            {buttons.map((button, index) => (
                <button
                    key={index}
                    onClick={button.onClick}
                    className={`
            px-4 py-2
            transition-all duration-200
            ${button.active
                            ? 'bg-xianxia-gold-600 text-stone-900 font-bold'
                            : 'bg-stone-800 text-gray-300 hover:bg-stone-700'
                        }
            ${index > 0 ? 'border-l border-stone-600' : ''}
          `}
                >
                    {button.label}
                </button>
            ))}
        </div>
    );
};

// ==================== 特殊按钮 ====================

/**
 * 灵石购买按钮
 */
export const SpiritStoneButton: React.FC<{
    amount: number;
    onClick?: () => void;
    disabled?: boolean;
}> = ({ amount, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        px-4 py-2
        bg-gradient-to-r from-amber-600 to-yellow-500
        hover:from-amber-500 hover:to-yellow-400
        text-stone-900
        font-bold
        rounded-lg
        border-2 border-amber-400
        shadow-lg shadow-amber-500/50
        transition-all duration-300
        flex items-center gap-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
        >
            <span className="text-lg">💎</span>
            <span>{amount} 灵石</span>
        </button>
    );
};

/**
 * 抽卡按钮
 */
export const GachaButton: React.FC<{
    type: '单抽' | '十连';
    cost: number;
    onClick?: () => void;
}> = ({ type, cost, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`
        px-6 py-3
        ${type === '十连'
                    ? 'btn-legendary-enhanced animate-pulse-glow'
                    : 'btn-primary-enhanced'
                }
        rounded-lg
        font-bold text-lg
        transition-all duration-300
        hover:scale-105
        relative overflow-hidden
      `}
        >
            <div className="relative z-10 flex flex-col items-center">
                <span>{type}</span>
                <span className="text-xs opacity-80">💎 {cost} 灵石</span>
            </div>

            {/* 闪光效果 */}
            {type === '十连' && (
                <div className="absolute inset-0 shimmer-effect opacity-30" />
            )}
        </button>
    );
};

/**
 * 战斗按钮
 */
export const BattleButton: React.FC<{
    action: string;
    onClick?: () => void;
    disabled?: boolean;
    highlight?: boolean;
}> = ({ action, onClick, disabled = false, highlight = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        px-6 py-3
        font-bold text-lg
        rounded-lg
        transition-all duration-300
        ${highlight
                    ? 'btn-legendary-enhanced animate-pulse-fast shadow-glow-gold-lg'
                    : 'btn-danger-enhanced'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
      `}
        >
            ⚔️ {action}
        </button>
    );
};

// ==================== 使用示例 ====================

export const ButtonShowcase: React.FC = () => {
    return (
        <div className="p-8 space-y-8 bg-stone-900">
            {/* 基础按钮 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">基础按钮</h3>
                <div className="flex flex-wrap gap-4">
                    <PrimaryButton onClick={() => alert('主要操作')}>
                        主要按钮
                    </PrimaryButton>
                    <SecondaryButton onClick={() => alert('次要操作')}>
                        次要按钮
                    </SecondaryButton>
                    <DangerButton onClick={() => alert('危险操作')}>
                        危险按钮
                    </DangerButton>
                    <PrimaryButton disabled>禁用按钮</PrimaryButton>
                </div>
            </section>

            {/* 尺寸变体 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">尺寸变体</h3>
                <div className="flex flex-wrap items-center gap-4">
                    <PrimaryButton size="sm">小按钮</PrimaryButton>
                    <PrimaryButton size="md">中按钮</PrimaryButton>
                    <PrimaryButton size="lg">大按钮</PrimaryButton>
                </div>
            </section>

            {/* 特殊按钮 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">特殊按钮</h3>
                <div className="flex flex-wrap gap-4">
                    <LegendaryButton onClick={() => alert('传说级操作')}>
                        传说按钮
                    </LegendaryButton>
                    <SpiritStoneButton amount={1000} />
                    <GachaButton type="单抽" cost={100} />
                    <GachaButton type="十连" cost={900} />
                    <BattleButton action="攻击" highlight />
                </div>
            </section>

            {/* 图标按钮 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">图标按钮</h3>
                <div className="flex flex-wrap gap-4">
                    <IconButton icon="⚙️" variant="default" />
                    <IconButton icon="✓" variant="primary" />
                    <IconButton icon="×" variant="danger" />
                    <IconButton icon="⭐" variant="primary" size="lg" />
                </div>
            </section>

            {/* 组合按钮 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">组合按钮</h3>
                <div className="flex flex-wrap gap-4">
                    <ButtonWithIcon icon="⚔️">开始战斗</ButtonWithIcon>
                    <ButtonWithIcon icon="→" iconPosition="right">
                        前往下一关
                    </ButtonWithIcon>
                </div>
            </section>

            {/* 按钮组 */}
            <section>
                <h3 className="text-xl font-bold text-xianxia-gold-400 mb-4">按钮组</h3>
                <ButtonGroup
                    buttons={[
                        { label: '全部', onClick: () => { }, active: true },
                        { label: '装备', onClick: () => { } },
                        { label: '技能', onClick: () => { } },
                        { label: '道具', onClick: () => { } },
                    ]}
                />
            </section>
        </div>
    );
};

/**
 * 使用说明：
 * 
 * 1. 引入所需的按钮组件：
 *    import { PrimaryButton, SecondaryButton, LegendaryButton } from './components/examples/EnhancedButtons.example';
 * 
 * 2. 确保已引入 enhanced-ui.css 样式文件
 * 
 * 3. 使用示例：
 *    <PrimaryButton onClick={handleClick}>确认</PrimaryButton>
 *    <LegendaryButton onClick={handleGacha}>十连抽卡</LegendaryButton>
 * 
 * 4. 样式类参考：
 *    - btn-primary-enhanced: 主要按钮样式
 *    - btn-secondary-enhanced: 次要按钮样式
 *    - btn-danger-enhanced: 危险按钮样式
 *    - btn-legendary-enhanced: 传说级按钮样式
 *    - animate-pulse-glow: 脉冲发光动画
 *    - shadow-glow-gold: 金色发光阴影
 */