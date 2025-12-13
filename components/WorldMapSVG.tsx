import React, { useState } from 'react';
import { Location, locations } from '../locations';

interface WorldMapSVGProps {
    onLocationSelect: (location: Location) => void;
    currentLocationName: string;
}

const WorldMapSVG: React.FC<WorldMapSVGProps> = ({ onLocationSelect, currentLocationName }) => {
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const viewBoxWidth = 1200;
    const viewBoxHeight = 1200;

    // 处理鼠标滚轮缩放
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
    };

    // 处理拖拽
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setTranslateX(e.clientX - dragStart.x);
            setTranslateY(e.clientY - dragStart.y);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // 获取区域颜色
    const getRegionGradient = (region: Location['region']) => {
        switch (region) {
            case '东荒': return { color: '#22c55e', opacity: 0.15, x: '20%', y: '20%' };
            case '西境': return { color: '#fcd34d', opacity: 0.15, x: '75%', y: '20%' };
            case '南疆': return { color: '#ef4444', opacity: 0.15, x: '75%', y: '75%' };
            case '北原': return { color: '#3b82f6', opacity: 0.15, x: '20%', y: '75%' };
            case '中州': return { color: '#a855f7', opacity: 0.2, x: '50%', y: '50%' };
            default: return { color: '#ffffff', opacity: 0.1, x: '50%', y: '50%' };
        }
    };

    // 渲染山脉路径
    const renderMountains = () => {
        const mountains = [
            { d: "M100,800 Q150,700 200,750 T300,800 T400,750 T500,800", opacity: 0.3 },
            { d: "M200,900 Q250,820 300,850 T400,900 T500,850 T600,900", opacity: 0.25 },
            { d: "M700,300 Q750,200 800,250 T900,300 T1000,250 T1100,300", opacity: 0.3 },
            { d: "M50,400 Q100,320 150,350 T250,400 T350,350 T450,400", opacity: 0.2 },
            { d: "M800,700 Q850,620 900,650 T1000,700 T1100,650 T1150,700", opacity: 0.25 },
        ];

        return mountains.map((mountain, index) => (
            <path
                key={`mountain-${index}`}
                d={mountain.d}
                fill="none"
                stroke="#574d3d"
                strokeWidth="3"
                opacity={mountain.opacity}
                strokeLinecap="round"
                filter="url(#ink-blur)"
            />
        ));
    };

    // 渲染河流
    const renderRivers = () => {
        const rivers = [
            { d: "M100,200 Q200,250 300,200 T500,250 T700,200", color: "#60a5fa" },
            { d: "M500,700 Q600,750 700,720 T900,700", color: "#a855f7" },
        ];

        return rivers.map((river, index) => (
            <g key={`river-${index}`}>
                <path
                    d={river.d}
                    fill="none"
                    stroke={river.color}
                    strokeWidth="4"
                    opacity="0.4"
                    strokeLinecap="round"
                    filter="url(#glow)"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="100"
                        dur="5s"
                        repeatCount="indefinite"
                    />
                </path>
                <path
                    d={river.d}
                    fill="none"
                    stroke={river.color}
                    strokeWidth="2"
                    opacity="0.6"
                    strokeLinecap="round"
                    strokeDasharray="10 20"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="30"
                        dur="3s"
                        repeatCount="indefinite"
                    />
                </path>
            </g>
        ));
    };

    // 渲染地点标记
    const renderLocationMarker = (loc: Location) => {
        const isCurrent = loc.name === currentLocationName;
        const isHovered = hoveredLocation === loc.id;
        const gradient = getRegionGradient(loc.region);

        const iconColor = isCurrent ? "#fbbf24" : isHovered ? "#fcd34d" : "#e5e7eb";
        const pulseScale = isCurrent ? 1.2 : isHovered ? 1.15 : 1;

        // 根据类型选择图标
        const renderIcon = () => {
            switch (loc.type) {
                case 'Sect':
                    return (
                        <g>
                            <path d="M-10 12 L0 -10 L10 12 Z" fill={iconColor} opacity="0.9" />
                            <rect x="-6" y="4" width="12" height="8" fill={iconColor} opacity="0.9" />
                            <rect x="-3" y="8" width="6" height="4" fill="#1c1917" opacity="0.8" />
                        </g>
                    );
                case 'City':
                    return (
                        <g>
                            <rect x="-10" y="-6" width="20" height="18" fill={iconColor} opacity="0.9" rx="2" />
                            <rect x="-7" y="-2" width="5" height="10" fill="#1c1917" opacity="0.6" />
                            <rect x="2" y="-2" width="5" height="10" fill="#1c1917" opacity="0.6" />
                        </g>
                    );
                case 'Cave':
                    return (
                        <g>
                            <ellipse cx="0" cy="0" rx="12" ry="10" fill={iconColor} opacity="0.9" />
                            <ellipse cx="0" cy="-2" rx="7" ry="5" fill="#1c1917" opacity="0.7" />
                        </g>
                    );
                case 'Mountain':
                    return (
                        <g>
                            <path d="M-14 12 L0 -12 L14 12 Z" fill="none" stroke={iconColor} strokeWidth="2.5" opacity="0.9" />
                            <path d="M-8 12 L0 -4 L8 12" fill="none" stroke={iconColor} strokeWidth="2" opacity="0.7" />
                        </g>
                    );
                case 'Forest':
                    return (
                        <g>
                            <path d="M0 -10 L-8 2 L-3 2 L-10 12 L10 12 L3 2 L8 2 Z" fill={iconColor} opacity="0.9" />
                            <rect x="-2" y="8" width="4" height="6" fill="#78716c" opacity="0.8" />
                        </g>
                    );
                case 'River':
                    return (
                        <g>
                            <path d="M-12 -6 Q-6 0 0 0 T12 6" fill="none" stroke={iconColor} strokeWidth="3" opacity="0.9" strokeLinecap="round" />
                            <path d="M-12 0 Q-6 6 0 6 T12 12" fill="none" stroke={iconColor} strokeWidth="2.5" opacity="0.7" strokeLinecap="round" />
                        </g>
                    );
                default:
                    return <circle r="8" fill={iconColor} opacity="0.9" />;
            }
        };

        return (
            <g
                key={loc.id}
                transform={`translate(${loc.x}, ${loc.y})`}
                onMouseEnter={() => setHoveredLocation(loc.id)}
                onMouseLeave={() => setHoveredLocation(null)}
                onClick={() => onLocationSelect(loc)}
                style={{ cursor: 'pointer' }}
            >
                {/* 光晕效果 */}
                {(isCurrent || isHovered) && (
                    <circle
                        r="25"
                        fill={gradient.color}
                        opacity={isCurrent ? 0.3 : 0.2}
                        filter="url(#glow)"
                    >
                        <animate
                            attributeName="r"
                            values="25;30;25"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="opacity"
                            values={isCurrent ? "0.3;0.5;0.3" : "0.2;0.3;0.2"}
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </circle>
                )}

                {/* 主图标 */}
                <g style={{ transform: `scale(${pulseScale})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}>
                    {renderIcon()}
                </g>

                {/* 文字标签 */}
                <text
                    y="28"
                    fill="#fef3c7"
                    fontSize={isHovered || isCurrent ? "16" : "14"}
                    fontWeight={isCurrent ? "bold" : "normal"}
                    textAnchor="middle"
                    filter="url(#text-shadow)"
                    style={{
                        fontFamily: 'serif',
                        opacity: isHovered || isCurrent ? 1 : 0.8,
                        transition: 'all 0.3s ease',
                        pointerEvents: 'none'
                    }}
                >
                    {loc.name}
                </text>

                {/* 重要标记星标 */}
                {loc.isMajor && (
                    <text
                        x="15"
                        y="-15"
                        fill="#fbbf24"
                        fontSize="20"
                        filter="url(#glow)"
                    >
                        ★
                        <animate
                            attributeName="opacity"
                            values="0.6;1;0.6"
                            dur="1.5s"
                            repeatCount="indefinite"
                        />
                    </text>
                )}
            </g>
        );
    };

    return (
        <div
            className="w-full h-full bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 overflow-hidden rounded-lg border-2 border-amber-600/50 shadow-2xl relative"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {/* 控制提示 */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-amber-500/30">
                <p className="text-amber-200 text-sm font-serif">
                    <span className="text-amber-400">🖱️</span> 滚轮缩放 | <span className="text-amber-400">✋</span> 拖拽移动
                </p>
            </div>

            {/* 图例 */}
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg border border-amber-500/30 space-y-1">
                <p className="text-amber-300 text-sm font-bold font-serif mb-2">五域方位</p>
                {['东荒', '西境', '南疆', '北原', '中州'].map(region => {
                    const grad = getRegionGradient(region as Location['region']);
                    return (
                        <div key={region} className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: grad.color, opacity: 0.8 }}></div>
                            <span className="text-amber-100 font-serif">{region}</span>
                        </div>
                    );
                })}
            </div>

            <svg
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                className="w-full h-full"
                style={{
                    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                }}
            >
                <defs>
                    {/* 水墨模糊滤镜 */}
                    <filter id="ink-blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                        <feComponentTransfer>
                            <feFuncA type="discrete" tableValues="0 1" />
                        </feComponentTransfer>
                    </filter>

                    {/* 发光效果 */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* 文字阴影 */}
                    <filter id="text-shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
                    </filter>

                    {/* 水墨纹理 */}
                    <filter id="watercolor">
                        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="10" />
                        <feDisplacementMap in="SourceGraphic" scale="15" />
                    </filter>

                    {/* 区域渐变 */}
                    {['东荒', '西境', '南疆', '北原', '中州'].map(region => {
                        const grad = getRegionGradient(region as Location['region']);
                        return (
                            <radialGradient key={`grad-${region}`} id={`grad-${region}`} cx={grad.x} cy={grad.y} r="60%">
                                <stop offset="0%" stopColor={grad.color} stopOpacity={grad.opacity * 1.5} />
                                <stop offset="100%" stopColor={grad.color} stopOpacity="0" />
                            </radialGradient>
                        );
                    })}
                </defs>

                {/* 背景 */}
                <rect width={viewBoxWidth} height={viewBoxHeight} fill="#0c0a09" />

                {/* 纹理层 */}
                <rect width={viewBoxWidth} height={viewBoxHeight} fill="#1c1917" opacity="0.5" filter="url(#watercolor)" />

                {/* 区域颜色层 */}
                {['中州', '东荒', '西境', '南疆', '北原'].map(region => (
                    <rect
                        key={`region-${region}`}
                        width={viewBoxWidth}
                        height={viewBoxHeight}
                        fill={`url(#grad-${region})`}
                    />
                ))}

                {/* 山脉 */}
                {renderMountains()}

                {/* 河流 */}
                {renderRivers()}

                {/* 云雾效果 */}
                <g opacity="0.15">
                    {[...Array(8)].map((_, i) => (
                        <ellipse
                            key={`cloud-${i}`}
                            cx={150 + i * 150}
                            cy={100 + (i % 3) * 300}
                            rx="80"
                            ry="40"
                            fill="#f5f5f4"
                            filter="url(#ink-blur)"
                        >
                            <animate
                                attributeName="cx"
                                values={`${150 + i * 150};${200 + i * 150};${150 + i * 150}`}
                                dur={`${15 + i * 3}s`}
                                repeatCount="indefinite"
                            />
                        </ellipse>
                    ))}
                </g>

                {/* 地点标记 */}
                {locations.map(loc => renderLocationMarker(loc))}

                {/* 装饰性星辰 */}
                <g opacity="0.6">
                    {[...Array(20)].map((_, i) => (
                        <circle
                            key={`star-${i}`}
                            cx={100 + (i * 123) % viewBoxWidth}
                            cy={50 + (i * 89) % viewBoxHeight}
                            r="1.5"
                            fill="#fef3c7"
                        >
                            <animate
                                attributeName="opacity"
                                values="0.3;1;0.3"
                                dur={`${2 + (i % 3)}s`}
                                repeatCount="indefinite"
                            />
                        </circle>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default WorldMapSVG;