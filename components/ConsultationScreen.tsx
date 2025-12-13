import React, { useState } from 'react';
import { Patient } from '../types';
import StoryDisplay from './StoryDisplay';

interface ConsultationScreenProps {
  patient: Patient;
  story: string;
  choices: string[];
  isLoading: boolean;
  error: string | null;
  onAction: (action: string) => void;
  onViewRecord: () => void;
  onEndConsultation: () => void;
}

const ConsultationScreen: React.FC<ConsultationScreenProps> = ({
  patient,
  story,
  choices,
  isLoading,
  error,
  onAction,
  onViewRecord,
  onEndConsultation,
}) => {
  const storyEndRef = React.useRef<HTMLDivElement>(null);
  const [customAction, setCustomAction] = useState<string>('');

  React.useEffect(() => {
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [story]);

  const handleCustomAction = () => {
    if (customAction.trim()) {
      onAction(customAction);
      setCustomAction('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && customAction.trim()) {
      handleCustomAction();
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-black/20 p-4 flex justify-between items-center border-b border-stone-700">
        <div>
          <h2 className="text-2xl font-bold text-amber-300 font-serif">
            问诊中: {patient.medicalRecord.name}
          </h2>
          <p className="text-sm text-red-400">{patient.medicalRecord.illnessDescription}</p>
        </div>
        <button onClick={onEndConsultation} className="bg-red-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-red-500/80 transition-colors">
          结束问诊
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Panel: Patient Info */}
        <div className="w-1/4 bg-black/10 p-4 border-r border-stone-700 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-stone-700 mb-4 flex items-center justify-center">
            <i className="fa-solid fa-user-injured text-6xl text-gray-500"></i>
          </div>
          <h3 className="text-xl text-white font-bold">{patient.medicalRecord.name}</h3>
          <p className="text-gray-400">{patient.medicalRecord.age}岁, {patient.medicalRecord.gender === 'Male' ? '男' : '女'}</p>
          <button
            onClick={onViewRecord}
            className="mt-6 bg-cyan-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-cyan-500/80 transition-colors w-full"
          >
            查看病单
          </button>
        </div>

        {/* Right Panel: Story & Actions */}
        <div className="w-3/4 flex flex-col">
          <main className="flex-grow overflow-y-auto p-4">
            <StoryDisplay story={story} storyEndRef={storyEndRef} />
          </main>
          <div className="flex-shrink-0">
            {/* We'll reuse BottomBar, but might need a specific version for consultation */}
            {/* This is a placeholder for the action input section */}
            <div className="p-4 bg-black/30 border-t border-stone-700">
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => onAction(choice)}
                    disabled={isLoading}
                    className="flex-grow basis-40 text-center bg-stone-800/80 px-3 py-2 rounded-md hover:bg-stone-700/80 disabled:opacity-50 transition-colors text-white"
                  >
                    {choice}
                  </button>
                ))}
              </div>
              {/* Custom input form for consultation */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入你的问诊行动..."
                  disabled={isLoading}
                  className="flex-grow px-4 py-2 bg-stone-800/80 border border-stone-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
                <button
                  onClick={handleCustomAction}
                  disabled={isLoading || !customAction.trim()}
                  className="px-6 py-2 bg-amber-600/80 text-white font-bold rounded-md hover:bg-amber-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '生成中...' : '问诊'}
                </button>
              </div>
              {error && (
                <div className="mt-2 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationScreen;