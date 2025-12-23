import React, { useEffect, useState } from 'react';

/**
 * 增强版弹窗组件示例
 * 展示如何应用美化样式到Modal组件
 */

interface EnhancedModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    variant?: 'default' | 'legendary' | 'announcement' | 'battle';
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    variant = 'default',
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            // 防止背景滚动
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    // 尺寸映射
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw] max-h-[95vh]',
    };

    // 变体样式
    const variantClasses = {
        default: 'ornate-border border-xianxia-gold-600',
        legendary: 'ornate-border-legendary border-xianxia-gold-400 card-legendary-glow',
        announcement: 'ornate-border-double border-spiritual-500',
        battle: 'ornate-border border-blood-600 shadow-glow-red',
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/70 backdrop-blur-sm
        ${isOpen ? 'animate-fade-in-up' : 'animate-fade-out'}
      `}
            onClick={handleOverlayClick}
        >
            {/* 弹窗容器 */}
            <div
                className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          w-full
          relative
          bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950
          rounded-xl
          shadow-2xl
          overflow-hidden
          ${isOpen ? 'animate-slide-in' : 'animate-slide-out'}
        `}
            >
                {/* 装饰性背景图案 */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                </div>

                {/* 顶部光效 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />

                {/* 标题栏 */}
                <div className="relative px-6 py-4 border-b border-stone-700/50 bg-gradient-to-r from-stone-800/50 to-stone-900/50">
                    <h2 className="text-2xl font-bold text-center text-gradient-gold text-shadow-glow">
                        {title}
                    </h2>

                    {/* 标题装饰 */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-24 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />

                    {/* 关闭按钮 */}
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="
                absolute right-4 top-1/2 -translate-y-1/2
                w-8 h-8 rounded-full
                bg-stone-700/50 hover:bg-stone-600/50
                border border-stone-600 hover:border-xianxia-gold-500
                text-gray-400 hover:text-xianxia-gold-400
                transition-all duration-200
                flex items-center justify-center
                group
              "
                        >
                            <span className="text-xl group-hover:rotate-90 transition-transform duration-200">×</span>
                        </button>
                    )}
                </div>

                {/* 内容区域 */}
                <div className="relative px-6 py-6 max-h-[70vh] overflow-y-auto scrollbar-xianxia">
                    {children}
                </div>

                {/* 底部装饰 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />
            </div>
        </div>
    );
};

/**
 * 使用示例 1: 默认弹窗
 */
export const DefaultModalExample: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-primary-enhanced"
            >
                打开弹窗
            </button>

            <EnhancedModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="人物详情"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">这里是弹窗内容...</p>
                </div>
            </EnhancedModal>
        </>
    );
};

/**
 * 使用示例 2: 传说级弹窗（抽卡结果）
 */
export const LegendaryModalExample: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-legendary-enhanced"
            >
                查看传说角色
            </button>

            <EnhancedModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="✨ 传说降临 ✨"
                variant="legendary"
                size="lg"
            >
                <div className="text-center space-y-6">
                    <div className="animate-float">
                        <img
                            src="/legendary-character.png"
                            alt="传说角色"
                            className="w-64 h-64 mx-auto object-contain"
                        />
                    </div>
                    <h3 className="text-3xl font-bold text-gradient-gold">
                        九天玄女
                    </h3>
                    <p className="text-gray-300">
                        恭喜获得绝品稀有度角色！
                    </p>
                </div>
            </EnhancedModal>
        </>
    );
};

/**
 * 使用示例 3: 公告弹窗
 */
export const AnnouncementModalExample: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-secondary-enhanced"
            >
                查看公告
            </button>

            <EnhancedModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="📜 宗门公告 📜"
                variant="announcement"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-stone-800/50 border border-spiritual-600/30">
                        <h4 className="text-lg font-bold text-spiritual-400 mb-2">
                            宗门大比即将开始
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            天元32年，惊蛰之日，各峰弟子齐聚演武场，一决高下...
                        </p>
                    </div>
                </div>
            </EnhancedModal>
        </>
    );
};

/**
 * 完整样式类说明：
 * 
 * Modal容器相关：
 * - ornate-border: 基础华丽边框
 * - ornate-border-legendary: 传说级边框
 * - ornate-border-double: 双重边框
 * - card-legendary-glow: 传说级发光效果
 * - shadow-glow-gold/red/blue: 各色发光阴影
 * 
 * 动画相关：
 * - animate-fade-in-up: 淡入上移
 * - animate-slide-in: 滑入效果
 * - animate-float: 漂浮动画
 * 
 * 按钮相关：
 * - btn-primary-enhanced: 主要按钮
 * - btn-secondary-enhanced: 次要按钮
 * - btn-legendary-enhanced: 传说级按钮
 * 
 * 文字相关：
 * - text-gradient-gold: 金色渐变文字
 * - text-shadow-glow: 文字发光效果
 * 
 * 滚动条：
 * - scrollbar-xianxia: 仙侠风格滚动条
 */