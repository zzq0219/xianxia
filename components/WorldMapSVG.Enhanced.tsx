import React, { useMemo, useState } from 'react';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { Location, Realm, getLocationsByRealm, realms } from '../locations';
import ZoomControls from './ZoomControls';

interface WorldMapSVGEnhancedProps {
    onLocationSelect: (location: Location) => void;
    currentLocationName: string;
    isMobile?: boolean;
}

const WorldMapSVGEnhanced: React.FC<WorldMapSVGEnhancedProps> = ({
    onLocationSelect,
    currentLocationName,
    isMobile = false
}) => {
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
    const [currentRealm, setCurrentRealm] = useState<Realm>('人界');

    const viewBoxWidth = 1200;
    const viewBoxHeight = 1000;

    // 使用触摸手势 Hook
    const [gestureState, gestureHandlers] = useTouchGestures({
        initialScale: 1,
        minScale: 0.5,
        maxScale: 3
    });

    const { scale, translateX, translateY, isDragging } = gestureState;
    const {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleWheel,
        resetView,
        zoomIn,
        zoomOut
    } = gestureHandlers;

    // 获取当前界面的地点
    const currentLocations = useMemo(() =>
        getLocationsByRealm(currentRealm),
        [currentRealm]
    );

    // 获取界面配置
    const getRealmConfig = (realm: Realm) => {
        switch (realm) {
            case '天界':
                return {
                    bgGradient: ['#0c1445', '#1e3a8a', '#3b82f6'],
                    cloudColor: '#ffffff',
                    mountainColor: '#60a5fa',
                    waterColor: '#93c5fd',
                    textColor: '#dbeafe',
                    accentColor: '#fbbf24',
                    glowColor: '#60a5fa'
                };
            case '人界':
                return {
                    bgGradient: ['#1c1917', '#292524', '#44403c'],
                    cloudColor: '#a8a29e',
                    mountainColor: '#57534e',
                    waterColor: '#60a5fa',
                    textColor: '#e7e5e4',
                    accentColor: '#fbbf24',
                    glowColor: '#f59e0b'
                };
            case '冥界':
                return {
                    bgGradient: ['#09090b', '#18181b', '#27272a'],
                    cloudColor: '#3f3f46',
                    mountainColor: '#27272a',
                    waterColor: '#52525b',
                    textColor: '#d4d4d8',
                    accentColor: '#a855f7',
                    glowColor: '#7c3aed'
                };
        }
    };

    const config = getRealmConfig(currentRealm);

    // 渲染天界背景
    const renderCelestialBackground = () => (
        <g>
            {/* 渐变天空 */}
            <defs>
                <linearGradient id="celestial-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0c1445" />
                    <stop offset="40%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <radialGradient id="celestial-glow" cx="50%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
                <filter id="cloud-blur">
                    <feGaussianBlur stdDeviation="8" />
                </filter>
            </defs>
            <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#celestial-sky)" />
            <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#celestial-glow)" />

            {/* 星星 */}
            {[...Array(50)].map((_, i) => (
                <circle
                    key={`star-${i}`}
                    cx={Math.random() * viewBoxWidth}
                    cy={Math.random() * viewBoxHeight * 0.6}
                    r={Math.random() * 2 + 0.5}
                    fill="#ffffff"
                    opacity={Math.random() * 0.5 + 0.3}
                />
            ))}

            {/* 云层 - 远景 */}
            <ellipse cx="200" cy="200" rx="150" ry="40" fill="#ffffff" opacity="0.1" filter="url(#cloud-blur)" />
            <ellipse cx="600" cy="150" rx="200" ry="50" fill="#ffffff" opacity="0.15" filter="url(#cloud-blur)" />
            <ellipse cx="1000" cy="180" rx="180" ry="45" fill="#ffffff" opacity="0.1" filter="url(#cloud-blur)" />

            {/* 仙山轮廓 - 远景 */}
            <path d="M0,600 Q100,450 200,550 Q300,400 400,500 Q500,350 600,480 Q700,380 800,500 Q900,420 1000,520 Q1100,450 1200,550 L1200,1000 L0,1000 Z"
                fill="#1e40af" opacity="0.3" />

            {/* 仙山轮廓 - 中景 */}
            <path d="M0,700 Q150,550 300,650 Q450,500 600,620 Q750,480 900,600 Q1050,520 1200,650 L1200,1000 L0,1000 Z"
                fill="#2563eb" opacity="0.4" />

            {/* 云海 */}
            <ellipse cx="300" cy="750" rx="250" ry="60" fill="#ffffff" opacity="0.2" filter="url(#cloud-blur)" />
            <ellipse cx="700" cy="720" rx="300" ry="70" fill="#ffffff" opacity="0.25" filter="url(#cloud-blur)" />
            <ellipse cx="1050" cy="760" rx="200" ry="50" fill="#ffffff" opacity="0.2" filter="url(#cloud-blur)" />

            {/* 仙山轮廓 - 近景 */}
            <path d="M0,800 Q200,650 400,750 Q600,600 800,720 Q1000,650 1200,780 L1200,1000 L0,1000 Z"
                fill="#3b82f6" opacity="0.5" />

            {/* 瀑布效果 */}
            <path d="M580,650 Q590,750 585,850" stroke="#93c5fd" strokeWidth="3" fill="none" opacity="0.6" />
            <path d="M590,650 Q600,750 595,850" stroke="#bfdbfe" strokeWidth="2" fill="none" opacity="0.4" />
        </g>
    );

    // 渲染人界背景
    const renderMortalBackground = () => (
        <g>
            {/* 渐变天空 */}
            <defs>
                <linearGradient id="mortal-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1c1917" />
                    <stop offset="30%" stopColor="#292524" />
                    <stop offset="100%" stopColor="#44403c" />
                </linearGradient>
                <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                </linearGradient>
                <filter id="mountain-shadow">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
                </filter>
            </defs>
            <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#mortal-sky)" />

            {/* 月亮 */}
            <circle cx="950" cy="120" r="50" fill="#fef3c7" opacity="0.8" />
            <circle cx="930" cy="110" r="50" fill="url(#mortal-sky)" />

            {/* 远山 - 最远层 */}
            <path d="M0,500 Q100,400 200,450 Q350,350 500,420 Q650,320 800,400 Q950,340 1100,420 L1200,450 L1200,1000 L0,1000 Z"
                fill="#44403c" opacity="0.4" />

            {/* 远山 - 中层 */}
            <path d="M0,550 Q150,420 300,500 Q500,380 700,480 Q900,400 1100,500 L1200,520 L1200,1000 L0,1000 Z"
                fill="#57534e" opacity="0.5" />

            {/* 森林带 */}
            <path d="M0,620 Q50,600 100,620 Q150,590 200,620 Q250,580 300,620 Q350,590 400,620 Q450,580 500,620 Q550,590 600,620 Q650,580 700,620 Q750,590 800,620 Q850,580 900,620 Q950,590 1000,620 Q1050,580 1100,620 Q1150,590 1200,620 L1200,1000 L0,1000 Z"
                fill="#365314" opacity="0.4" />

            {/* 近山 */}
            <path d="M0,700 Q200,550 400,680 Q600,520 800,660 Q1000,580 1200,700 L1200,1000 L0,1000 Z"
                fill="#78716c" opacity="0.6" filter="url(#mountain-shadow)" />

            {/* 河流 */}
            <path d="M100,750 Q300,780 500,750 Q700,720 900,760 Q1100,790 1200,770"
                stroke="url(#water-gradient)" strokeWidth="40" fill="none" opacity="0.6" strokeLinecap="round" />

            {/* 河流高光 */}
            <path d="M100,750 Q300,780 500,750 Q700,720 900,760 Q1100,790 1200,770"
                stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" strokeDasharray="20 30" />

            {/* 地面 */}
            <path d="M0,850 Q300,820 600,850 Q900,880 1200,850 L1200,1000 L0,1000 Z"
                fill="#292524" opacity="0.8" />

            {/* 道路 */}
            <path d="M600,1000 Q580,900 620,800 Q650,700 600,600"
                stroke="#78716c" strokeWidth="8" fill="none" opacity="0.3" strokeLinecap="round" />
        </g>
    );

    // 渲染冥界背景
    const renderNetherBackground = () => (
        <g>
            {/* 渐变背景 */}
            <defs>
                <linearGradient id="nether-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#09090b" />
                    <stop offset="50%" stopColor="#18181b" />
                    <stop offset="100%" stopColor="#27272a" />
                </linearGradient>
                <radialGradient id="nether-glow" cx="50%" cy="70%" r="40%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </radialGradient>
                <filter id="nether-blur">
                    <feGaussianBlur stdDeviation="5" />
                </filter>
            </defs>
            <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#nether-sky)" />
            <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#nether-glow)" />

            {/* 幽暗雾气 */}
            <ellipse cx="200" cy="300" rx="200" ry="100" fill="#3f3f46" opacity="0.15" filter="url(#nether-blur)" />
            <ellipse cx="800" cy="250" rx="250" ry="120" fill="#52525b" opacity="0.1" filter="url(#nether-blur)" />
            <ellipse cx="500" cy="400" rx="300" ry="150" fill="#3f3f46" opacity="0.12" filter="url(#nether-blur)" />

            {/* 险峻山峰 - 远景 */}
            <path d="M0,450 L100,300 L150,380 L250,250 L350,400 L450,280 L550,420 L650,300 L750,450 L850,320 L950,400 L1050,280 L1150,380 L1200,350 L1200,1000 L0,1000 Z"
                fill="#27272a" opacity="0.5" />

            {/* 险峻山峰 - 中景 */}
            <path d="M0,550 L80,400 L180,500 L280,350 L380,480 L480,380 L580,520 L680,400 L780,550 L880,420 L980,500 L1080,380 L1200,480 L1200,1000 L0,1000 Z"
                fill="#3f3f46" opacity="0.6" />

            {/* 冥河 */}
            <path d="M0,700 Q200,750 400,700 Q600,650 800,720 Q1000,780 1200,720"
                stroke="#52525b" strokeWidth="50" fill="none" opacity="0.5" strokeLinecap="round" />

            {/* 冥河幽光 */}
            <path d="M0,700 Q200,750 400,700 Q600,650 800,720 Q1000,780 1200,720"
                stroke="#7c3aed" strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round" />

            {/* 近景岩石 */}
            <path d="M0,800 L100,700 L200,780 L350,680 L500,800 L650,720 L800,820 L950,750 L1100,850 L1200,780 L1200,1000 L0,1000 Z"
                fill="#18181b" opacity="0.8" />

            {/* 幽魂火焰 */}
            {[...Array(8)].map((_, i) => (
                <g key={`flame-${i}`}>
                    <ellipse
                        cx={100 + i * 150}
                        cy={850 - (i % 3) * 50}
                        rx="8"
                        ry="15"
                        fill="#7c3aed"
                        opacity="0.4"
                    />
                    <ellipse
                        cx={100 + i * 150}
                        cy={845 - (i % 3) * 50}
                        rx="4"
                        ry="8"
                        fill="#a855f7"
                        opacity="0.6"
                    />
                </g>
            ))}
        </g>
    );

    // 根据当前界面渲染背景
    const renderBackground = () => {
        switch (currentRealm) {
            case '天界': return renderCelestialBackground();
            case '人界': return renderMortalBackground();
            case '冥界': return renderNetherBackground();
        }
    };

    // 渲染地点标记
    const renderLocationMarker = (loc: Location) => {
        const isCurrent = loc.name === currentLocationName;
        const isHovered = hoveredLocation === loc.id;

        const baseColor = isCurrent ? config.accentColor : isHovered ? config.accentColor : config.textColor;
        const glowColor = config.glowColor;
        const pulseScale = isCurrent ? 1.15 : isHovered ? 1.1 : 1;

        // 根据类型选择图标
        const renderIcon = () => {
            const iconSize = 12;
            switch (loc.type) {
                case 'Sect':
                    return (
                        <g>
                            <path d={`M0,-${iconSize} L-${iconSize * 0.8},${iconSize * 0.6} L${iconSize * 0.8},${iconSize * 0.6} Z`}
                                fill={baseColor} opacity="0.9" />
                            <rect x={-iconSize * 0.4} y={iconSize * 0.2} width={iconSize * 0.8} height={iconSize * 0.5}
                                fill={baseColor} opacity="0.7" />
                        </g>
                    );
                case 'City':
                    return (
                        <g>
                            <rect x={-iconSize} y={-iconSize * 0.5} width={iconSize * 2} height={iconSize * 1.2}
                                fill={baseColor} opacity="0.9" rx="2" />
                            <rect x={-iconSize * 0.6} y={-iconSize * 0.2} width={iconSize * 0.4} height={iconSize * 0.8}
                                fill={config.bgGradient[0]} opacity="0.6" />
                            <rect x={iconSize * 0.2} y={-iconSize * 0.2} width={iconSize * 0.4} height={iconSize * 0.8}
                                fill={config.bgGradient[0]} opacity="0.6" />
                        </g>
                    );
                case 'Palace':
                    return (
                        <g>
                            <path d={`M0,-${iconSize} L-${iconSize},${iconSize * 0.3} L${iconSize},${iconSize * 0.3} Z`}
                                fill={baseColor} opacity="0.9" />
                            <rect x={-iconSize * 0.8} y={iconSize * 0.3} width={iconSize * 1.6} height={iconSize * 0.5}
                                fill={baseColor} opacity="0.8" />
                            <circle cx="0" cy={-iconSize * 0.3} r={iconSize * 0.25} fill={config.accentColor} opacity="0.9" />
                        </g>
                    );
                case 'Cave':
                    return (
                        <g>
                            <ellipse cx="0" cy="0" rx={iconSize} ry={iconSize * 0.8} fill={baseColor} opacity="0.9" />
                            <ellipse cx="0" cy={-iconSize * 0.15} rx={iconSize * 0.6} ry={iconSize * 0.4}
                                fill={config.bgGradient[0]} opacity="0.7" />
                        </g>
                    );
                case 'Mountain':
                    return (
                        <g>
                            <path d={`M-${iconSize},${iconSize * 0.8} L0,-${iconSize} L${iconSize},${iconSize * 0.8} Z`}
                                fill="none" stroke={baseColor} strokeWidth="2.5" opacity="0.9" />
                            <path d={`M-${iconSize * 0.5},${iconSize * 0.8} L0,-${iconSize * 0.2} L${iconSize * 0.5},${iconSize * 0.8}`}
                                fill="none" stroke={baseColor} strokeWidth="2" opacity="0.6" />
                        </g>
                    );
                case 'Forest':
                    return (
                        <g>
                            <path d={`M0,-${iconSize} L-${iconSize * 0.7},${iconSize * 0.2} L-${iconSize * 0.3},${iconSize * 0.2} L-${iconSize},${iconSize} L${iconSize},${iconSize} L${iconSize * 0.3},${iconSize * 0.2} L${iconSize * 0.7},${iconSize * 0.2} Z`}
                                fill={baseColor} opacity="0.9" />
                        </g>
                    );
                case 'River':
                    return (
                        <g>
                            <path d={`M-${iconSize},-${iconSize * 0.4} Q-${iconSize * 0.5},0 0,0 T${iconSize},${iconSize * 0.4}`}
                                fill="none" stroke={baseColor} strokeWidth="3" opacity="0.9" strokeLinecap="round" />
                            <path d={`M-${iconSize},${iconSize * 0.2} Q-${iconSize * 0.5},${iconSize * 0.6} 0,${iconSize * 0.6} T${iconSize},${iconSize}`}
                                fill="none" stroke={baseColor} strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
                        </g>
                    );
                case 'Prison':
                    return (
                        <g>
                            <rect x={-iconSize} y={-iconSize * 0.7} width={iconSize * 2} height={iconSize * 1.6}
                                fill={baseColor} opacity="0.9" rx="2" />
                            <line x1={-iconSize * 0.5} y1={-iconSize * 0.7} x2={-iconSize * 0.5} y2={iconSize * 0.9}
                                stroke={config.bgGradient[0]} strokeWidth="2" opacity="0.7" />
                            <line x1="0" y1={-iconSize * 0.7} x2="0" y2={iconSize * 0.9}
                                stroke={config.bgGradient[0]} strokeWidth="2" opacity="0.7" />
                            <line x1={iconSize * 0.5} y1={-iconSize * 0.7} x2={iconSize * 0.5} y2={iconSize * 0.9}
                                stroke={config.bgGradient[0]} strokeWidth="2" opacity="0.7" />
                        </g>
                    );
                default:
                    return <circle r={iconSize} fill={baseColor} opacity="0.9" />;
            }
        };

        return (
            <g
                key={loc.id}
                transform={`translate(${loc.x}, ${loc.y})`}
                onMouseEnter={() => !isMobile && setHoveredLocation(loc.id)}
                onMouseLeave={() => !isMobile && setHoveredLocation(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    onLocationSelect(loc);
                }}
                style={{ cursor: 'pointer' }}
            >
                {/* 光晕效果 */}
                {(isCurrent || isHovered) && (
                    <>
                        <circle r="35" fill={glowColor} opacity="0.15" />
                        <circle r="25" fill={glowColor} opacity="0.25" />
                    </>
                )}

                {/* 主图标 */}
                <g style={{
                    transform: `scale(${pulseScale})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease'
                }}>
                    {renderIcon()}
                </g>

                {/* 文字标签 */}
                <text
                    y="28"
                    fill={config.textColor}
                    fontSize="13"
                    fontWeight={isCurrent ? "bold" : "normal"}
                    textAnchor="middle"
                    style={{
                        fontFamily: 'serif',
                        opacity: isHovered || isCurrent ? 1 : 0.8,
                        transition: 'all 0.3s ease',
                        pointerEvents: 'none',
                        textShadow: `0 2px 4px ${config.bgGradient[0]}`
                    }}
                >
                    {loc.name}
                </text>

                {/* 重要标记 */}
                {loc.isMajor && (
                    <text
                        x="15"
                        y="-12"
                        fill={config.accentColor}
                        fontSize="14"
                        opacity="0.9"
                    >
                        ★
                    </text>
                )}
            </g>
        );
    };

    return (
        <div className="w-full h-full relative">
            {/* 界面切换按钮 */}
            <div className="absolute top-4 right-4 z-30 flex gap-2">
                {realms.map(realm => (
                    <button
                        key={realm}
                        onClick={() => setCurrentRealm(realm)}
                        className={`px-4 py-2 rounded-lg font-serif text-sm transition-all border ${currentRealm === realm
                            ? 'bg-amber-600/90 text-white border-amber-400 shadow-lg shadow-amber-600/30'
                            : 'bg-black/60 text-amber-200/80 border-amber-600/30 hover:bg-black/80 hover:border-amber-500/50'
                            }`}
                    >
                        {realm}
                    </button>
                ))}
            </div>

            <div
                className="w-full h-full overflow-hidden relative touch-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                {/* 缩放控制 */}
                <div className="absolute top-4 left-4 z-20">
                    <ZoomControls
                        scale={scale}
                        onZoomIn={zoomIn}
                        onZoomOut={zoomOut}
                        onReset={resetView}
                        minScale={0.5}
                        maxScale={3}
                    />
                </div>

                {/* 当前界面标题 */}
                <div className="absolute bottom-4 left-4 z-20 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-amber-500/30">
                    <span className="text-amber-300 font-serif text-lg">{currentRealm}</span>
                    <span className="text-amber-200/60 text-sm ml-2">· {currentLocations.length} 个地点</span>
                </div>

                <svg
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid slice"
                    style={{
                        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                    }}
                >
                    {/* 背景 */}
                    {renderBackground()}

                    {/* 地点标记 */}
                    <g style={{ pointerEvents: 'auto' }}>
                        {currentLocations.map(loc => renderLocationMarker(loc))}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default WorldMapSVGEnhanced;