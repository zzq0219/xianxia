import React from 'react';
import { RandomEvent, EventChoice } from '../types';

interface RandomEventModalProps {
    event: RandomEvent;
    onChoice: (choice: EventChoice) => void;
    resultText: string | null;
}

const RandomEventModal: React.FC<RandomEventModalProps> = ({ event, onChoice, resultText }) => {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="ornate-border bg-stone-800/90 backdrop-blur-lg w-full max-w-lg shadow-2xl flex flex-col">
                <div className="p-4 text-center bg-black/20">
                    <h2 className="text-xl font-bold text-amber-300 font-serif">{event.title}</h2>
                </div>
                <div className="p-6 font-serif min-h-[15rem] flex flex-col justify-center">
                    {resultText ? (
                        <div className="text-center animate-fade-in">
                            <p className="text-amber-300 text-lg leading-relaxed">{resultText}</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-300 whitespace-pre-wrap mb-6 text-center leading-relaxed">{event.story}</p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                {event.choices.map((choice, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onChoice(choice)}
                                        className="w-full sm:w-auto bg-stone-700/80 px-5 py-3 rounded-md hover:bg-stone-600/80 hover:border-amber-400/50 border border-transparent transition-all duration-200 font-serif shadow-md"
                                    >
                                        {choice.text}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RandomEventModal;