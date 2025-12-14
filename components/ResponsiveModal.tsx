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
 * 响应式模态框组件
 * 特点：
 * - 移动端：从底部滑入，占据90%屏幕高度，显示拖动指示器
 * - 桌面端：居中显示，固定最大宽度
 * - 支持点击背景关闭
 * - 自动滚动处理
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
            className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className={`
          modal-responsive
          ornate-border border-xianxia-gold-600 
          bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 
          w-full ${sizeClasses[size]}
          h-[90vh] md:h-auto md:max-h-[85vh]
          rounded-t-2xl md:rounded-xl
          shadow-2xl overflow-hidden backdrop-blur-lg 
          flex flex-col
          animate-slide-up-mobile
        `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 移动端拖动指示器 */}
                {showDragIndicator && (
                    <div className="md:hidden flex-shrink-0 pt-2 pb-1 bg-black/10">
                        <div className="modal-drag-indicator"></div>
                    </div>
                )}

                {/* 标题栏 */}
                <div className="flex-shrink-0 bg-black/20 border-b border-stone-700/50">
                    <div className="flex justify-between items-center p-3 md:p-4">
                        <h2 className="text-lg md:text-2xl font-bold text-gradient-gold text-shadow-glow font-serif truncate pr-2">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-amber-300 hover:text-white transition-colors touch-target flex-shrink-0"
                            aria-label="关闭"
                        >
                            <i className="fa-solid fa-times text-xl md:text-2xl"></i>
                        </button>
                    </div>
                </div>

                {/* 内容区 - 可滚动 */}
                <div className="flex-grow overflow-y-auto scroll-mobile scrollbar-xianxia p-3 md:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * 响应式模态框（带底部操作栏）
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
                className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
                onClick={onClose}
            >
                <div
                    className={`
          modal-responsive
          ornate-border border-xianxia-gold-600 
          bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 
          w-full ${sizeClasses[size]}
          h-[90vh] md:h-auto md:max-h-[85vh]
          rounded-t-2xl md:rounded-xl
          shadow-2xl overflow-hidden backdrop-blur-lg 
          flex flex-col
          animate-slide-up-mobile
        `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 移动端拖动指示器 */}
                    {showDragIndicator && (
                        <div className="md:hidden flex-shrink-0 pt-2 pb-1 bg-black/10">
                            <div className="modal-drag-indicator"></div>
                        </div>
                    )}

                    {/* 标题栏 */}
                    <div className="flex-shrink-0 bg-black/20 border-b border-stone-700/50">
                        <div className="flex justify-between items-center p-3 md:p-4">
                            <h2 className="text-lg md:text-2xl font-bold text-gradient-gold text-shadow-glow font-serif truncate pr-2">
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-amber-300 hover:text-white transition-colors touch-target flex-shrink-0"
                                aria-label="关闭"
                            >
                                <i className="fa-solid fa-times text-xl md:text-2xl"></i>
                            </button>
                        </div>
                    </div>

                    {/* 内容区 - 可滚动 */}
                    <div className="flex-grow overflow-y-auto scroll-mobile scrollbar-xianxia p-3 md:p-6">
                        {children}
                    </div>

                    {/* 底部操作栏 */}
                    {footer && (
                        <div className="flex-shrink-0 border-t border-stone-700/50 bg-black/20 p-3 md:p-4">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        );
    };

export default ResponsiveModal;