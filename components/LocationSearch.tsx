import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Location, locations } from '../locations';

interface LocationSearchProps {
    currentLocationName: string;
    onLocationSelect: (location: Location) => void;
    onClose?: () => void;
    className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
    currentLocationName,
    onLocationSelect,
    onClose,
    className = ''
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 过滤地点
    const filteredLocations = useMemo(() => {
        if (!searchTerm.trim()) {
            return locations;
        }

        const term = searchTerm.toLowerCase();
        return locations.filter(loc =>
            loc.name.toLowerCase().includes(term) ||
            loc.region.toLowerCase().includes(term) ||
            loc.type.toLowerCase().includes(term) ||
            loc.description.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    // 按区域分组
    const groupedLocations = useMemo(() => {
        const groups: Record<string, Location[]> = {};
        filteredLocations.forEach(loc => {
            if (!groups[loc.region]) {
                groups[loc.region] = [];
            }
            groups[loc.region].push(loc);
        });
        return groups;
    }, [filteredLocations]);

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 键盘导航
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                setIsOpen(true);
                setSelectedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredLocations.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredLocations.length) {
                    handleSelect(filteredLocations[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSelect = (location: Location) => {
        onLocationSelect(location);
        setIsOpen(false);
        setSearchTerm('');
        setSelectedIndex(-1);
        inputRef.current?.blur();
    };

    const getLocationIcon = (type: Location['type']) => {
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

    const getRegionColor = (region: Location['region']) => {
        const colors: Record<Location['region'], string> = {
            '东荒': 'text-green-400',
            '西境': 'text-yellow-400',
            '南疆': 'text-red-400',
            '北原': 'text-blue-400',
            '中州': 'text-purple-400'
        };
        return colors[region] || 'text-gray-400';
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* 搜索框 */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="搜索地点..."
                    className="w-full pl-10 pr-10 py-2.5 bg-gradient-to-r from-black/80 via-stone-900/70 to-black/80 backdrop-blur-md border-2 border-amber-500/40 rounded-lg text-amber-100 placeholder-amber-300/60 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30 focus:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
                />

                {/* 搜索图标 */}
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/80 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"></i>

                {/* 清除按钮 */}
                {searchTerm && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/70 hover:text-amber-300 transition-colors"
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                )}
            </div>

            {/* 搜索结果下拉 */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-b from-black/95 via-stone-900/90 to-black/95 backdrop-blur-xl border-2 border-amber-500/40 rounded-lg shadow-2xl max-h-[400px] overflow-y-auto"
                    style={{
                        boxShadow: '0 10px 40px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(251, 191, 36, 0.2)',
                        zIndex: 9999
                    }}
                >
                    {filteredLocations.length === 0 ? (
                        <div className="p-4 text-center text-amber-300/50">
                            <i className="fa-solid fa-search text-2xl mb-2"></i>
                            <p>未找到匹配的地点</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {/* 按区域分组显示 */}
                            {Object.entries(groupedLocations).map(([region, locs]) => (
                                <div key={region} className="mb-2 last:mb-0">
                                    {/* 区域标题 */}
                                    <div className="px-3 py-1.5 bg-gradient-to-r from-stone-900/60 via-stone-800/50 to-stone-900/60 border-b border-amber-500/10">
                                        <span className={`text-xs font-bold font-serif ${getRegionColor(region as Location['region'])} drop-shadow-[0_0_8px_currentColor]`}>
                                            ✦ {region} ✦
                                        </span>
                                    </div>

                                    {/* 地点列表 */}
                                    {locs.map((loc, idx) => {
                                        const globalIndex = filteredLocations.indexOf(loc);
                                        const isCurrent = loc.name === currentLocationName;
                                        const isSelected = globalIndex === selectedIndex;

                                        return (
                                            <button
                                                key={loc.id}
                                                onClick={() => handleSelect(loc)}
                                                className={`w-full px-3 py-2.5 flex items-start gap-3 hover:bg-gradient-to-r hover:from-amber-900/30 hover:via-amber-800/20 hover:to-amber-900/30 transition-all ${isSelected ? 'bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-amber-900/40 shadow-[inset_0_0_10px_rgba(251,191,36,0.2)]' : ''
                                                    } ${isCurrent ? 'bg-gradient-to-r from-amber-900/20 to-transparent border-l-2 border-amber-500 shadow-[inset_0_0_10px_rgba(251,191,36,0.1)]' : ''
                                                    }`}
                                            >
                                                {/* 图标 */}
                                                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded ${isCurrent ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800/50 text-amber-300/70'
                                                    }`}>
                                                    <i className={`fa-solid ${getLocationIcon(loc.type)} text-sm`}></i>
                                                </div>

                                                {/* 信息 */}
                                                <div className="flex-grow text-left">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className={`font-serif font-semibold ${isCurrent ? 'text-amber-300' : 'text-amber-100'
                                                            }`}>
                                                            {loc.name}
                                                        </span>
                                                        {loc.isMajor && (
                                                            <span className="text-amber-400 text-xs">★</span>
                                                        )}
                                                        {isCurrent && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                                                                当前
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 line-clamp-1">
                                                        {loc.description}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 键盘提示 */}
                    <div className="px-3 py-2 border-t-2 border-amber-500/30 bg-gradient-to-r from-black/70 via-stone-900/60 to-black/70">
                        <div className="flex items-center justify-between text-xs text-amber-300/60">
                            <span>
                                <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-amber-400/70">↑↓</kbd> 导航
                            </span>
                            <span>
                                <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-amber-400/70">Enter</kbd> 选择
                            </span>
                            <span>
                                <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-amber-400/70">Esc</kbd> 关闭
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSearch;