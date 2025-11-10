import React from 'react';
import { Location, locations } from '../locations';

interface WorldMapProps {
    onLocationSelect: (location: Location) => void;
    currentLocationName: string;
}

// A simple pseudo-random number generator for deterministic "randomness"
const mulberry32 = (a: number) => {
    return () => {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Component to draw a single mountain range
const MountainRange: React.FC<{ seed: number, y: number, height: number, peaks: number, color: string }> = ({ seed, y, height, peaks, color }) => {
    const rand = mulberry32(seed);
    let path = `M 0 ${y}`;
    const segmentWidth = 1000 / (peaks * 2);

    for (let i = 0; i < peaks * 2; i++) {
        const x = (i + 1) * segmentWidth;
        const peakY = y - (rand() * height);
        path += ` S ${x - segmentWidth / 2} ${peakY}, ${x} ${y}`;
    }
    path += ` L 1000 1000 L 0 1000 Z`;

    return <path d={path} fill={color} style={{ filter: 'url(#watercolor)' }} />;
};

const WorldMap: React.FC<WorldMapProps> = ({ onLocationSelect, currentLocationName }) => {
    const viewBoxWidth = 1000;
    const viewBoxHeight = 1000;

    const getRegionColor = (region: Location['region']) => {
        switch (region) {
            case '东荒': return 'rgba(34, 197, 94, 0.1)';
            case '西境': return 'rgba(252, 211, 77, 0.1)';
            case '南疆': return 'rgba(239, 68, 68, 0.1)';
            case '北原': return 'rgba(59, 130, 246, 0.1)';
            case '中州': return 'rgba(168, 85, 247, 0.1)';
            default: return 'transparent';
        }
    };

    return (
        <div className="w-full h-full bg-stone-900 overflow-hidden rounded-lg border-2 border-amber-400/50">
            <svg
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                className="w-full h-full cursor-pointer"
            >
                <defs>
                    {/* Water Color / Ink Wash Filter */}
                    <filter id="watercolor">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="5" seed="10" />
                        <feDisplacementMap in="SourceGraphic" scale="20" />
                    </filter>

                    {/* Region Gradients */}
                    <radialGradient id="grad_east" cx="25%" cy="25%" r="75%">
                        <stop offset="0%" stopColor={getRegionColor('东荒')} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={getRegionColor('东荒')} stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="grad_west" cx="75%" cy="25%" r="75%">
                        <stop offset="0%" stopColor={getRegionColor('西境')} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={getRegionColor('西境')} stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="grad_south" cx="75%" cy="75%" r="75%">
                        <stop offset="0%" stopColor={getRegionColor('南疆')} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={getRegionColor('南疆')} stopOpacity="0" />
                    </radialGradient>
                     <radialGradient id="grad_north" cx="25%" cy="75%" r="75%">
                        <stop offset="0%" stopColor={getRegionColor('北原')} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={getRegionColor('北原')} stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="grad_center" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={getRegionColor('中州')} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={getRegionColor('中州')} stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Background */}
                <rect width={viewBoxWidth} height={viewBoxHeight} fill="#1c1917" />

                {/* Procedural Mountains */}
                <MountainRange seed={1} y={300} height={150} peaks={5} color="rgba(120, 113, 108, 0.2)" />
                <MountainRange seed={2} y={350} height={120} peaks={7} color="rgba(120, 113, 108, 0.3)" />
                <MountainRange seed={3} y={450} height={200} peaks={6} color="rgba(87, 83, 78, 0.4)" />
                <MountainRange seed={4} y={600} height={180} peaks={8} color="rgba(68, 64, 60, 0.5)" />

                {/* Region Colors */}
                <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#grad_center)" />
                <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#grad_east)" />
                <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#grad_west)" />
                <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#grad_south)" />
                <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#grad_north)" />

                {/* Locations */}
                {locations.map(loc => (
                    <LocationMarker
                        key={loc.id}
                        location={loc}
                        isCurrent={loc.name === currentLocationName}
                        onSelect={onLocationSelect}
                    />
                ))}
            </svg>
        </div>
    );
};

const LocationMarker: React.FC<{ location: Location, isCurrent: boolean, onSelect: (location: Location) => void }> = ({ location, isCurrent, onSelect }) => {
    const iconColor = isCurrent ? "gold" : "white";
    const strokeColor = isCurrent ? "white" : "black";

    const renderIcon = () => {
        switch (location.type) {
            case 'Sect':
                return <path d="M-8 8 L0 -8 L8 8 Z M-5 8 L-5 0 L5 0 L5 8 Z" fill={iconColor} stroke={strokeColor} strokeWidth="1.5" />;
            case 'City':
                return <rect x="-7" y="-4" width="14" height="12" fill={iconColor} stroke={strokeColor} strokeWidth="1.5" />;
            case 'Cave':
                return <path d="M-8 0 C -8 -8, 8 -8, 8 0 C 8 8, -8 8, -8 0 Z M -4 -2 A 4 4 0 0 1 4 -2" fill="none" stroke={strokeColor} strokeWidth="2" />;
            case 'Mountain':
                return <path d="M-10 8 L0 -8 L10 8 Z" fill="none" stroke={iconColor} strokeWidth="2" />;
            case 'Forest':
                return <path d="M0 -8 L-6 0 L-2 0 L-8 8 L8 8 L2 0 L6 0 Z" fill={iconColor} />;
            default:
                return <circle r="6" fill={iconColor} stroke={strokeColor} strokeWidth="2" />;
        }
    };

    return (
        <g
            transform={`translate(${location.x}, ${location.y})`}
            onClick={() => onSelect(location)}
            className="cursor-pointer group"
        >
            <g className="transition-transform duration-300 group-hover:scale-150">
                {renderIcon()}
            </g>
            <text
                x="0"
                y="22"
                fill="white"
                fontSize="12"
                textAnchor="middle"
                className="pointer-events-none font-serif transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            >
                {location.name}
            </text>
        </g>
    );
};

export default WorldMap;