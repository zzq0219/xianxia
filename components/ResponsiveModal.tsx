import React, { useEffect } from 'react';

interface ResponsiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showDragIndicator?: boolean;
}

/**
 * 响应式模态框组件 - 水墨风格
 * 特点：
 * - 移动端：从底部滑入，占据90%屏幕高度，显示拖动指示器
 * - 桌面端：居中显示，固定最大宽度
 * - 支持点击背景关闭
 * - 自动滚动处理
 * - 水墨风格设计
 */
export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showDragIndicator = true
}) => {
    // 阻止背景滚动
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // 尺寸映射
    const sizeClasses = {
        sm: 'md:max-w-md',
        md: 'md:max-w-2xl',
        lg: 'md:max-w-4xl',
        xl: 'md:max-w-6xl',
        full: 'md:max-w-full md:m-4'
    };

    return (
        <div
            className="fixed inset-0 bg-ink-950/90 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className={`
                    modal-responsive
                    ink-card relative
                    w-full ${sizeClasses[size]}
                    h-[90vh] md:h-auto md:max-h-[85vh]
                    rounded-t-xl md:rounded-lg
                    overflow-hidden
                    flex flex-col
                    animate-fade-in
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 水墨顶部装饰线 */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

                {/* 角落装饰 */}
                <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-gold-500/30" />
                <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-gold-500/30" />

                {/* 移动端拖动指示器 */}
                {showDragIndicator && (
                    <div className="md:hidden flex-shrink-0 pt-3 pb-1 bg-ink-900/50">
                        <div className="w-10 h-1 bg-gold-500/40 rounded-full mx-auto"></div>
                    </div>
                )}

                {/* 标题栏 */}
                <div className="flex-shrink-0 bg-ink-900/50 border-b border-gold-500/20">
                    <div className="flex justify-between items-center p-3 md:p-4">
                        <h2 className="text-lg md:text-2xl font-bold text-gold-400 font-serif tracking-wider truncate pr-2 ink-title">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-ink-800/80 hover:bg-ink-700/80 border border-gold-500/30 hover:border-gold-400/50 text-ink-400 hover:text-gold-400 transition-all duration-300 flex items-center justify-center flex-shrink-0"
                            aria-label="关闭"
                        >
                            <i className="fa-solid fa-times text-lg md:text-xl"></i>
                        </button>
                    </div>
                </div>

                {/* 内容区 - 可滚动 */}
                <div className="flex-grow overflow-y-auto bg-ink-900/30 p-3 md:p-6">
                    {children}
                </div>

                {/* 水墨底部装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

                {/* 底部角落装饰 */}
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-gold-500/30" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-gold-500/30" />
            </div>
        </div>
    );
};

/**
 * 响应式模态框（带底部操作栏）- 水墨风格
 */
export const ResponsiveModalWithFooter: React.FC<ResponsiveModalProps & {
    footer?: React.ReactNode;
}> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    showDragIndicator = true
}) => {
        useEffect(() => {
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'unset';
            }
            return () => {
                document.body.style.overflow = 'unset';
            };
        }, [isOpen]);

        if (!isOpen) return null;

        const sizeClasses = {
            sm: 'md:max-w-md',
            md: 'md:max-w-2xl',
            lg: 'md:max-w-4xl',
            xl: 'md:max-w-6xl',
            full: 'md:max-w-full md:m-4'
        };

        return (
            <div
                className="fixed inset-0 bg-ink-950/90 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
                onClick={onClose}
            >
                <div
                    className={`
                        modal-responsive
                        ink-card relative
                        w-full ${sizeClasses[size]}
                        h-[90vh] md:h-auto md:max-h-[85vh]
                        rounded-t-xl md:rounded-lg
                        overflow-hidden
                        flex flex-col
                        animate-fade-in
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 水墨顶部装饰线 */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

                    {/* 角落装饰 */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-gold-500/30" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-gold-500/30" />

                    {/* 移动端拖动指示器 */}
                    {showDragIndicator && (
                        <div className="md:hidden flex-shrink-0 pt-3 pb-1 bg-ink-900/50">
                            <div className="w-10 h-1 bg-gold-500/40 rounded-full mx-auto"></div>
                        </div>
                    )}

                    {/* 标题栏 */}
                    <div className="flex-shrink-0 bg-ink-900/50 border-b border-gold-500/20">
                        <div className="flex justify-between items-center p-3 md:p-4">
                            <h2 className="text-lg md:text-2xl font-bold text-gold-400 font-serif tracking-wider truncate pr-2 ink-title">
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-ink-800/80 hover:bg-ink-700/80 border border-gold-500/30 hover:border-gold-400/50 text-ink-400 hover:text-gold-400 transition-all duration-300 flex items-center justify-center flex-shrink-0"
                                aria-label="关闭"
                            >
                                <i className="fa-solid fa-times text-lg md:text-xl"></i>
                            </button>
                        </div>
                    </div>

                    {/* 内容区 - 可滚动 */}
                    <div className="flex-grow overflow-y-auto bg-ink-900/30 p-3 md:p-6">
                        {children}
                    </div>

                    {/* 底部操作栏 */}
                    {footer && (
                        <div className="flex-shrink-0 border-t border-gold-500/20 bg-ink-900/50 p-3 md:p-4">
                            {footer}
                        </div>
                    )}

                    {/* 水墨底部装饰线 */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

                    {/* 底部角落装饰 */}
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-gold-500/30" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-gold-500/30" />
                </div>
            </div>
        );
    };

export default ResponsiveModal;