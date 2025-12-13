import React, { useEffect, useState } from 'react';
import { Location } from '../locations';
import LocationSearch from './LocationSearch';
import WorldMapSVGEnhanced from './WorldMapSVG.Enhanced';

interface MapModalEnhancedProps {
    currentLocationName: string;
    onClose: () => void;
    onTravel: (destination: string) => void;
}

const MapModalEnhanced: React.FC<MapModalEnhancedProps> = ({ currentLocationName, onClose, onTravel }) => {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);

    // 检测是否为移动端
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLocationSelect = (location: Location) => {
        setSelectedLocation(location);
        if (isMobile) {
            setIsInfoPanelOpen(true);
        }
    };

    const handleTravel = () => {
        if (selectedLocation) {
            onTravel(selectedLocation.name);
            setIsInfoPanelOpen(false);
        }
    };

    const getLocationTypeIcon = (type: Location['type']) => {
        const icons: Record<Location['type'], string> = {
            'Sect': 'fa-mountain-sun',
            'City': 'fa-city',
            'Cave': 'fa-dungeon',
            'Mountain': 'fa-mountain',
            'Forest': 'fa-tree',
            'Plain': 'fa-seedling',
            'River': 'fa-water',
            'Sea': 'fa-ship',
            'Prison': 'fa-bars',
            'Palace': 'fa-crown'
        };
        return icons[type] || 'fa-map-marker';
    };

    const renderInfoPanel = () => {
        if (!selectedLocation) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                    <i className="fa-solid fa-map-location-dot text-4xl mb-3 text-amber-500/30"></i>
                    <p className="text-center">点击地图上的地点以查看详情</p>
                    <p className="text-xs text-gray-600 mt-2">或使用搜索功能快速定位</p>
                </div>
            );
        }

        const isCurrent = selectedLocation.name === currentLocationName;

        return (
            <>
                {/* 地点标题 */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-amber-500/20 rounded-lg border border-amber-500/30">
                        <i className={`fa-solid ${getLocationTypeIcon(selectedLocation.type)} text-amber-400 text-xl`}></i>
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white font-serif flex items-center gap-2">
                            {selectedLocation.name}
                            {selectedLocation.isMajor && (
                                <span className="text-amber-400 text-base">★</span>
                            )}
                        </h3>
                        <p className="text-amber-300/70 text-sm">
                            {selectedLocation.region} · {selectedLocation.type}
                        </p>
                    </div>
                </div>

                {/* 地点描述 */}
                <div className="flex-grow overflow-y-auto mb-4">
                    <div className="bg-black/20 rounded-lg p-3 border border-stone-700/30">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {selectedLocation.description}
                        </p>
                    </div>

                    {/* 额外信息 */}
                    <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <i className="fa-solid fa-location-dot text-amber-500/50"></i>
                            <span>坐标: ({selectedLocation.x}, {selectedLocation.y})</span>
                        </div>
                        {isCurrent && (
                            <div className="flex items-center gap-2 text-xs text-green-400">
                                <i className="fa-solid fa-circle-check"></i>
                                <span>你当前正在此地</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 操作按钮 */}
                <button
                    onClick={handleTravel}
                    disabled={isCurrent}
                    className="w-full bg-amber-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-500 transition-all disabled:bg-stone-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                    {isCurrent ? (
                        <>
                            <i className="fa-solid fa-map-pin"></i>
                            <span>当前所在</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-route"></i>
                            <span>前往此地</span>
                        </>
                    )}
                </button>
            </>
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            {/* 桌面端布局 */}
            {!isMobile ? (
                <div
                    className="ornate-border bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 w-full max-w-7xl h-[90vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col border-2 border-amber-600/50 relative"
                    onClick={e => e.stopPropagation()}
                    style={{
                        boxShadow: '0 0 60px rgba(251, 191, 36, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* 装饰性边角 */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-amber-500/70 rounded-tl-xl pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-amber-500/70 rounded-tr-xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-amber-500/70 rounded-bl-xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-amber-500/70 rounded-br-xl pointer-events-none"></div>

                    {/* 顶部栏 */}
                    <div className="flex justify-between items-center p-4 flex-shrink-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50 border-b-2 border-amber-500/30 backdrop-blur-md">
                        <div className="flex items-center gap-4 flex-grow">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent font-serif drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                                ✦ 世界地图 ✦
                            </h2>
                            <div className="flex-grow max-w-md">
                                <LocationSearch
                                    currentLocationName={currentLocationName}
                                    onLocationSelect={handleLocationSelect}
                                />
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-amber-300 hover:text-white transition-colors w-10 h-10 flex items-center justify-center rounded-lg hover:bg-amber-900/20"
                        >
                            <i className="fa-solid fa-times text-2xl"></i>
                        </button>
                    </div>

                    {/* 主内容区 */}
                    <div className="flex-grow flex overflow-hidden relative">
                        {/* 地图区域 - 全屏背景 */}
                        <div className="absolute inset-0">
                            <WorldMapSVGEnhanced
                                onLocationSelect={handleLocationSelect}
                                currentLocationName={currentLocationName}
                                isMobile={false}
                            />
                        </div>

                        {/* 信息面板 - 浮动在右侧 */}
                        <div className="absolute top-4 right-4 bottom-4 w-80 bg-gradient-to-b from-black/80 via-stone-900/85 to-black/80 rounded-lg p-4 flex flex-col border border-amber-500/30 backdrop-blur-xl shadow-2xl overflow-hidden"
                            style={{ zIndex: 40 }}
                        >
                            {/* 面板装饰背景 */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-purple-900/5 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                {renderInfoPanel()}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* 移动端布局 */
                <div
                    className="bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 w-full h-full flex flex-col overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* 顶部栏 */}
                    <div className="flex-shrink-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 backdrop-blur-md border-b-2 border-amber-500/30">
                        <div className="flex justify-between items-center p-3">
                            <h2 className="text-lg font-bold text-amber-300 font-serif">世界地图</h2>
                            <button
                                onClick={onClose}
                                className="text-amber-300 hover:text-white transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-amber-900/20"
                            >
                                <i className="fa-solid fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* 搜索栏 */}
                        <div className="px-3 pb-3">
                            <LocationSearch
                                currentLocationName={currentLocationName}
                                onLocationSelect={handleLocationSelect}
                            />
                        </div>
                    </div>

                    {/* 地图区域 */}
                    <div className="flex-grow relative overflow-hidden">
                        <WorldMapSVGEnhanced
                            onLocationSelect={handleLocationSelect}
                            currentLocationName={currentLocationName}
                            isMobile={true}
                        />
                    </div>

                    {/* 底部抽屉式信息面板 */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-b from-stone-900/98 to-black/98 backdrop-blur-xl border-t-2 border-amber-500/40 shadow-2xl transition-transform duration-300 ease-out ${isInfoPanelOpen ? 'translate-y-0' : 'translate-y-full'
                            }`}
                        style={{
                            maxHeight: '60vh',
                            boxShadow: '0 -10px 40px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(251, 191, 36, 0.3)'
                        }}
                    >
                        {/* 拖动指示器 */}
                        <div
                            className="flex justify-center py-2 cursor-pointer"
                            onClick={() => setIsInfoPanelOpen(false)}
                        >
                            <div className="w-12 h-1 bg-amber-500/50 rounded-full"></div>
                        </div>

                        {/* 面板内容 */}
                        <div className="px-4 pb-4 max-h-[calc(60vh-3rem)] overflow-y-auto">
                            {renderInfoPanel()}
                        </div>
                    </div>

                    {/* 底部提示 (当没有选择地点时) */}
                    {!isInfoPanelOpen && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-500/30">
                            <p className="text-amber-200 text-sm flex items-center gap-2">
                                <i className="fa-solid fa-hand-pointer"></i>
                                <span>点击地点查看详情</span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MapModalEnhanced;