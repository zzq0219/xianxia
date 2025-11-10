
import React, { useState, useEffect } from 'react';
import { InteractableEntity } from '../types';

interface InteractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInteract: (action: string) => void;
    storyContext: string;
}

const InteractionModal: React.FC<InteractionModalProps> = ({ isOpen, onClose, onInteract, storyContext }) => {
    const [entities, setEntities] = useState<InteractableEntity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEntity, setSelectedEntity] = useState<InteractableEntity | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchInteractables = async () => {
                setIsLoading(true);
                setSelectedEntity(null);
                try {
                    console.warn("scanForInteractables is not implemented yet.");
                    const foundEntities: InteractableEntity[] = []; // Placeholder
                    setEntities(foundEntities);
                } catch (error) {
                    console.error("Failed to fetch interactables:", error);
                    setEntities([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInteractables();
        }
    }, [isOpen, storyContext]);

    const handleAction = (entity: InteractableEntity, action: string) => {
        const actionText = `${action} ${entity.name}`;
        onInteract(actionText);
    };

    const getEntityTypeIcon = (type: InteractableEntity['type']) => {
        switch (type) {
            case 'NPC': return '👤';
            case 'Creature': return '🐾';
            case 'Object': return '📦';
            default: return '❓';
        }
    };

    const renderInteractionOptions = () => {
        if (!selectedEntity) return null;
        
        const commonActions = [
            { label: '靠近', verb: '你决定走近' },
            { label: '观察', verb: '你仔细观察' },
        ];
        
        let specificActions = [];
        if (selectedEntity.type === 'NPC') {
            specificActions.push({ label: '交谈', verb: '你尝试与' });
            specificActions.push({ label: '挑战', verb: `你向 ${selectedEntity.name} 亮出黄牌，发起了挑战。` });
        } else if (selectedEntity.type === 'Creature') {
            specificActions.push({ label: '攻击', verb: `你亮出黄牌，决定攻击` });
        } else if (selectedEntity.type === 'Object') {
             specificActions.push({ label: '调查', verb: '你开始调查' });
        }

        // Custom handler for challenge action since its structure is different
        const handleSpecificAction = (action: { label: string; verb: string; }) => {
            if (action.label === '挑战' || action.label === '攻击') {
                onInteract(action.verb);
            } else {
                 handleAction(selectedEntity, action.verb)
            }
        }


        const allActions = [...commonActions, ...specificActions];

        return (
            <div className="bg-stone-800/70 p-4 rounded-lg animate-fade-in border border-stone-700/50">
                <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl mt-1">{getEntityTypeIcon(selectedEntity.type)}</span>
                    <div>
                        <h3 className="font-bold text-amber-400 text-lg">{selectedEntity.name}</h3>
                        <p className="text-sm text-gray-300">{selectedEntity.description}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {allActions.map(action => (
                        <button
                            key={action.label}
                            onClick={() => handleSpecificAction(action)}
                            className="bg-stone-700/80 px-4 py-2 rounded-md hover:bg-stone-600 transition-colors duration-200 font-serif"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center text-amber-300 animate-glow p-8">探查灵气波动中...</div>;
        }
        if (entities.length === 0) {
            return <div className="text-center text-gray-500 p-8">附近似乎没有任何值得注意的东西。</div>;
        }
        return (
            <div className="flex flex-row gap-4 h-full">
                <div className="w-2/5 border-r border-stone-700 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-400 p-3 sticky top-0 bg-stone-900/90 backdrop-blur-sm border-b border-stone-700/50">附近实体</h3>
                    {entities.map(entity => (
                        <button
                            key={entity.name}
                            onClick={() => setSelectedEntity(entity)}
                            className={`w-full text-left p-3 text-sm transition-colors duration-150 flex items-center gap-3 ${selectedEntity?.name === entity.name ? 'bg-amber-600/30' : 'hover:bg-stone-800/60'}`}
                        >
                            <span className="text-xl">{getEntityTypeIcon(entity.type)}</span>
                            <span className="font-semibold text-white">{entity.name}</span>
                        </button>
                    ))}
                </div>
                <div className="w-3/5 p-4 flex flex-col justify-center">
                    {selectedEntity ? (
                        renderInteractionOptions()
                    ) : (
                        <div className="text-center text-gray-500">
                           <p>从左侧列表选择一个目标进行互动</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border bg-stone-900 w-full max-w-2xl h-auto max-h-[70vh] min-h-[20rem] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg bg-stone-900/80 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
                    <h2 className="text-xl font-bold text-amber-300 font-serif">探查四周</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>
                <div className="flex-grow overflow-hidden">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default InteractionModal;