import React from 'react';

interface ZoomControlsProps {
    scale: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    minScale?: number;
    maxScale?: number;
    className?: string;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
    scale,
    onZoomIn,
    onZoomOut,
    onReset,
    minScale = 0.5,
    maxScale = 3,
    className = ''
}) => {
    const scalePercentage = Math.round(scale * 100);
    const isMinZoom = scale <= minScale;
    const isMaxZoom = scale >= maxScale;

    return (
        <div className={`flex items-center gap-2 bg-gradient-to-r from-black/80 via-stone-900/70 to-black/80 backdrop-blur-md rounded-lg px-3 py-2 border-2 border-amber-500/40 shadow-lg ${className}`}
            style={{ boxShadow: '0 4px 20px rgba(251, 191, 36, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)' }}
        >
            {/* 缩小按钮 */}
            <button
                onClick={onZoomOut}
                disabled={isMinZoom}
                className="w-9 h-9 flex items-center justify-center text-amber-300 hover:text-amber-100 hover:bg-gradient-to-br hover:from-amber-900/50 hover:to-amber-700/50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-amber-500/30 hover:shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                title="缩小 (Ctrl + -)"
            >
                <i className="fa-solid fa-minus text-sm drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"></i>
            </button>

            {/* 缩放比例显示 */}
            <div className="flex items-center gap-2 px-2 min-w-[100px]">
                <span className="text-amber-200 text-sm font-mono font-semibold whitespace-nowrap drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                    {scalePercentage}%
                </span>

                {/* 缩放滑块 (仅在桌面端显示) */}
                <input
                    type="range"
                    min={minScale * 100}
                    max={maxScale * 100}
                    value={scale * 100}
                    onChange={(e) => {
                        const newScale = parseFloat(e.target.value) / 100;
                        if (newScale > scale) {
                            onZoomIn();
                        } else {
                            onZoomOut();
                        }
                    }}
                    className="hidden md:block w-20 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    style={{
                        background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((scale - minScale) / (maxScale - minScale)) * 100}%, #44403c ${((scale - minScale) / (maxScale - minScale)) * 100}%, #44403c 100%)`
                    }}
                />
            </div>

            {/* 放大按钮 */}
            <button
                onClick={onZoomIn}
                disabled={isMaxZoom}
                className="w-9 h-9 flex items-center justify-center text-amber-300 hover:text-amber-100 hover:bg-gradient-to-br hover:from-amber-900/50 hover:to-amber-700/50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-amber-500/30 hover:shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                title="放大 (Ctrl + +)"
            >
                <i className="fa-solid fa-plus text-sm drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"></i>
            </button>

            {/* 分隔线 */}
            <div className="w-px h-6 bg-amber-500/30"></div>

            {/* 重置视图按钮 */}
            <button
                onClick={onReset}
                className="w-9 h-9 flex items-center justify-center text-amber-300 hover:text-amber-100 hover:bg-gradient-to-br hover:from-amber-900/50 hover:to-amber-700/50 rounded-md transition-all border border-transparent hover:border-amber-500/30 hover:shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                title="重置视图 (Home)"
            >
                <i className="fa-solid fa-compress text-sm drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"></i>
            </button>

            {/* 缩放提示 (仅移动端) */}
            <div className="md:hidden flex items-center gap-1 pl-2 border-l border-amber-500/30">
                <span className="text-amber-400/70 text-xs">
                    <i className="fa-solid fa-hand-pointer"></i>
                </span>
                <span className="text-amber-200/70 text-xs whitespace-nowrap">双指缩放</span>
            </div>
        </div>
    );
};

export default ZoomControls;