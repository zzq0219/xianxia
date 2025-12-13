import React, { useState } from 'react';
import { Location } from '../locations';
import WorldMapSVG from './WorldMapSVG';

interface MapModalProps {
    currentLocationName: string;
    onClose: () => void;
    onTravel: (destination: string) => void;
}

const MapModal: React.FC<MapModalProps> = ({ currentLocationName, onClose, onTravel }) => {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    const handleLocationSelect = (location: Location) => {
        setSelectedLocation(location);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border bg-stone-900 w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">世界地图</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>
                <div className="flex-grow flex p-4 gap-4 overflow-hidden">
                    {/* New SVG Map Area */}
                    <div className="flex-grow h-full">
                        <WorldMapSVG
                            onLocationSelect={handleLocationSelect}
                            currentLocationName={currentLocationName}
                        />
                    </div>
                    {/* Info Panel */}
                    <div className="w-1/3 h-full bg-black/20 rounded-lg p-4 flex flex-col border border-stone-700/50">
                        {selectedLocation ? (
                            <>
                                <h3 className="text-xl font-bold text-white font-serif mb-2">{selectedLocation.name} [{selectedLocation.region}]</h3>
                                <p className="text-gray-300 text-sm flex-grow">{selectedLocation.description}</p>
                                <button
                                    onClick={() => onTravel(selectedLocation.name)}
                                    disabled={selectedLocation.name === currentLocationName}
                                    className="w-full bg-amber-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-500 transition-colors disabled:bg-stone-600 disabled:cursor-not-allowed"
                                >
                                    {selectedLocation.name === currentLocationName ? '当前所在' : '前往此地'}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>点击地图上的地点以查看详情。</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapModal;