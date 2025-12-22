import React, { useState, useRef, useEffect } from 'react';
import { X, MapPin, Mountain, Home, Swords, Gem, Cloud } from 'lucide-react';
import { MapNode } from '../types';

// --- Mock Map Data ---
const MAP_NODES: MapNode[] = [
  { id: '1', name: '荒古禁地', x: 50, y: 50, type: 'dungeon', difficulty: '绝地', desc: '生命禁区，九龙拉棺降临之地。', isUnlocked: true, isCurrent: true, connections: ['2', '3'] },
  { id: '2', name: '灵墟洞天', x: 30, y: 65, type: 'sect', difficulty: '普通', desc: '燕国六大洞天之一，适合新手修行。', isUnlocked: true, connections: ['1', '4'] },
  { id: '3', name: '玉都城', x: 70, y: 60, type: 'city', difficulty: '安全', desc: '凡人与修士混居的繁华都城。', isUnlocked: true, connections: ['1', '5'] },
  { id: '4', name: '原始废墟', x: 20, y: 80, type: 'secret', difficulty: '危险', desc: '妖兽横行，但也生长着珍稀灵药。', isUnlocked: false, connections: ['2'] },
  { id: '5', name: '太玄门', x: 85, y: 40, type: 'sect', difficulty: '困难', desc: '拥有拙峰传承的古老门派。', isUnlocked: true, connections: ['3', '6'] },
  { id: '6', name: '火域', x: 80, y: 20, type: 'resource', difficulty: '极危', desc: '九层火域，炼器圣地。', isUnlocked: false, connections: ['5'] },
  { id: '7', name: '紫山', x: 40, y: 20, type: 'dungeon', difficulty: '死地', desc: '无始大帝道场，太古生物沉睡。', isUnlocked: false, connections: ['1'] },
];

interface WorldMapProps {
  isVisible: boolean;
  onClose: () => void;
  onTravel: (node: MapNode) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ isVisible, onClose, onTravel }) => {
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Center on current node on open
  useEffect(() => {
    if (isVisible && scrollContainerRef.current) {
        const currentNode = MAP_NODES.find(n => n.isCurrent);
        if (currentNode) {
            // Simple centering logic
            const scrollX = (currentNode.x / 100) * 1000 - window.innerWidth / 2;
            const scrollY = (currentNode.y / 100) * 800 - window.innerHeight / 2;
            scrollContainerRef.current.scrollTo({ left: scrollX, top: scrollY, behavior: 'smooth' });
        }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getNodeIcon = (type: string) => {
    switch (type) {
        case 'sect': return <Home size={20} />;
        case 'dungeon': return <Swords size={20} />;
        case 'city': return <MapPin size={20} />;
        case 'resource': return <Gem size={20} />;
        default: return <Mountain size={20} />;
    }
  };

  const getNodeColor = (type: string, unlocked: boolean) => {
      if (!unlocked) return 'bg-stone-600 border-stone-800 text-stone-400';
      switch(type) {
          case 'dungeon': return 'bg-red-900 border-red-500 text-red-200';
          case 'sect': return 'bg-emerald-900 border-emerald-500 text-emerald-200';
          case 'city': return 'bg-blue-900 border-blue-500 text-blue-200';
          case 'resource': return 'bg-amber-900 border-amber-500 text-amber-200';
          default: return 'bg-stone-800 border-stone-500 text-stone-200';
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1815] flex flex-col animate-fade-in">
        {/* --- Header --- */}
        <div className="h-16 flex items-center justify-between px-4 bg-[#2c241b] border-b border-[#8a6d20] shadow-lg z-20 relative">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gold-base rounded-full"></div>
                <span className="text-xl font-cursive text-gold-light tracking-widest">东荒北域图</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* --- Map Canvas --- */}
        <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-auto relative bg-[#e6dcc3] cursor-grab active:cursor-grabbing no-scrollbar"
        >
            {/* Map Container (Fixed Large Size) */}
            <div className="relative w-[1000px] h-[800px] sm:w-[1500px] sm:h-[1200px]">
                
                {/* 1. Background Texture & Ink Wash */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] opacity-80 mix-blend-multiply"></div>
                {/* Ink Mountains (Decor) */}
                <div className="absolute top-20 left-20 opacity-20 pointer-events-none filter sepia contrast-150">
                     <img src="https://picsum.photos/id/1036/400/300?grayscale" className="w-96 mask-image-gradient" />
                </div>
                <div className="absolute bottom-40 right-20 opacity-20 pointer-events-none filter sepia contrast-150">
                     <img src="https://picsum.photos/id/1015/500/300?grayscale" className="w-96 mask-image-gradient" />
                </div>

                {/* 2. Leylines (SVG Connections) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {MAP_NODES.map(node => 
                        node.connections.map(targetId => {
                            const target = MAP_NODES.find(n => n.id === targetId);
                            if (!target) return null;
                            // Draw only one way to avoid duplicates
                            if (parseInt(node.id) > parseInt(targetId)) return null;

                            return (
                                <line 
                                    key={`${node.id}-${target.id}`}
                                    x1={`${node.x}%`} y1={`${node.y}%`}
                                    x2={`${target.x}%`} y2={`${target.y}%`}
                                    stroke="#8a6d20"
                                    strokeWidth="2"
                                    strokeDasharray="8 4"
                                    className="opacity-40"
                                />
                            );
                        })
                    )}
                </svg>

                {/* 3. Fog / Clouds (Decor) */}
                <div className="absolute top-1/3 left-1/4 text-stone-400/20 animate-float" style={{ animationDuration: '20s' }}><Cloud size={120} /></div>
                <div className="absolute bottom-1/4 right-1/3 text-stone-400/20 animate-float" style={{ animationDuration: '25s' }}><Cloud size={150} /></div>


                {/* 4. Nodes */}
                {MAP_NODES.map(node => (
                    <div 
                        key={node.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 group cursor-pointer"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onClick={() => setSelectedNode(node)}
                    >
                        {/* Node Icon */}
                        <div className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300
                            ${getNodeColor(node.type, node.isUnlocked)}
                            ${node.isCurrent ? 'ring-4 ring-gold-base/30 scale-110' : ''}
                            ${selectedNode?.id === node.id ? 'ring-2 ring-white scale-125 z-20' : 'group-hover:scale-110'}
                        `}>
                            {getNodeIcon(node.type)}
                            
                            {/* Locked Overlay */}
                            {!node.isUnlocked && (
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                    <span className="text-[10px] text-stone-400">封</span>
                                </div>
                            )}
                        </div>

                        {/* Node Label (Vertical Text) */}
                        <div className={`
                            mt-2 py-1 px-1.5 bg-[#e3d5b8] border border-[#8a6d20] rounded shadow-md
                            text-[#2c241b] font-serif font-bold text-xs writing-vertical-rl tracking-widest leading-none
                            transition-all duration-300
                            ${node.isCurrent ? 'text-vermilion-800 border-vermilion-500' : ''}
                            ${!node.isUnlocked ? 'opacity-50 grayscale' : ''}
                        `}>
                            {node.name}
                        </div>

                        {/* Current Location Indicator */}
                        {node.isCurrent && (
                            <div className="absolute -top-8 animate-bounce text-vermilion-600 font-bold drop-shadow-md">
                                <MapPin size={24} fill="currentColor" />
                            </div>
                        )}
                    </div>
                ))}

            </div>
        </div>

        {/* --- Bottom Sheet / Detail Panel --- */}
        <div className={`
            absolute bottom-0 left-0 right-0 bg-[#1c1917] border-t border-gold-dark z-30 transition-transform duration-300
            ${selectedNode ? 'translate-y-0' : 'translate-y-full'}
        `}>
            {selectedNode && (
                <div className="p-6 max-w-2xl mx-auto relative">
                    <button 
                        onClick={() => setSelectedNode(null)}
                        className="absolute top-4 right-4 text-stone-500 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 ${getNodeColor(selectedNode.type, selectedNode.isUnlocked)}`}>
                            {getNodeIcon(selectedNode.type)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-cursive text-gold-light mb-1">{selectedNode.name}</h3>
                            <div className="flex items-center gap-3 text-xs mb-2">
                                <span className="bg-stone-800 px-2 py-0.5 rounded text-stone-400 border border-stone-700">{selectedNode.difficulty}</span>
                                <span className="text-stone-500">消耗: 20 灵石 / 1 天</span>
                            </div>
                            <p className="text-sm text-stone-400 font-serif leading-relaxed">{selectedNode.desc}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button 
                            className="flex-1 py-3 bg-stone-800 text-stone-400 rounded border border-stone-700 hover:bg-stone-700 transition-colors"
                            onClick={() => setSelectedNode(null)}
                        >
                            关闭
                        </button>
                        <button 
                            disabled={!selectedNode.isUnlocked || selectedNode.isCurrent}
                            onClick={() => {
                                onTravel(selectedNode);
                                setSelectedNode(null);
                            }}
                            className={`
                                flex-1 py-3 rounded font-bold tracking-widest transition-all
                                ${!selectedNode.isUnlocked 
                                    ? 'bg-stone-900 text-stone-600 cursor-not-allowed border border-stone-800' 
                                    : selectedNode.isCurrent 
                                        ? 'bg-emerald-900/50 text-emerald-500 border border-emerald-800 cursor-default'
                                        : 'bg-gradient-to-r from-gold-dark to-yellow-600 text-white shadow-lg hover:shadow-gold-base/20 border border-gold-base'}
                            `}
                        >
                            {selectedNode.isCurrent ? '当前位置' : !selectedNode.isUnlocked ? '未解锁' : '御剑前往'}
                        </button>
                    </div>
                </div>
            )}
        </div>

    </div>
  );
};