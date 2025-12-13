import React, { useState } from 'react';
import { MedicalRecord, Patient } from '../types';

interface HospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onStartConsultation: (patientId: string) => void;
  onRefresh: () => void;
  onAddPatient: (gender: 'Male' | 'Female') => void;
  isLoading: boolean;
  onViewRecord: (record: MedicalRecord) => void;
  consultationPatient: Patient | null;
  consultationStory: string;
  consultationChoices: string[];
  onConsultationAction: (action: string) => void;
  onEndConsultation: () => void;
  onReturnToList: () => void;
}

const HospitalModal: React.FC<HospitalModalProps> = ({
  isOpen,
  onClose,
  patients,
  onStartConsultation,
  onRefresh,
  onAddPatient,
  isLoading,
  onViewRecord,
  consultationPatient,
  consultationStory,
  consultationChoices,
  onConsultationAction,
  onEndConsultation,
  onReturnToList
}) => {
  const [activeTab, setActiveTab] = useState<'Male' | 'Female'>('Female');
  const [statusFilter, setStatusFilter] = useState<'待诊' | '治疗中' | '已治愈' | '全部'>('待诊');
  const [customAction, setCustomAction] = useState<string>('');

  if (!isOpen) return null;

  // 如果正在问诊，显示诊疗室界面
  if (consultationPatient) {
    return (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="ornate-border bg-stone-900 w-full max-w-6xl h-[85vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20 border-b border-stone-700">
            <div>
              <h2 className="text-2xl font-bold text-amber-300 font-serif">
                诊疗室 - 问诊中: {consultationPatient.medicalRecord.name}
              </h2>
              <p className="text-sm text-red-400">{consultationPatient.medicalRecord.illnessDescription}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onReturnToList}
                className="bg-blue-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-blue-500/80 transition-colors"
              >
                返回医馆
              </button>
              <button
                onClick={onEndConsultation}
                className="bg-red-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-red-500/80 transition-colors"
              >
                结束问诊
              </button>
              <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow flex overflow-hidden">
            {/* Left Panel: Patient Info */}
            <div className="w-1/4 bg-black/10 p-4 border-r border-stone-700 flex flex-col items-center overflow-y-auto">
              <div className="w-32 h-32 rounded-full bg-stone-700 mb-4 flex items-center justify-center">
                <i className="fa-solid fa-user-injured text-6xl text-gray-500"></i>
              </div>
              <h3 className="text-xl text-white font-bold">{consultationPatient.medicalRecord.name}</h3>
              <p className="text-gray-400">{consultationPatient.medicalRecord.age}岁, {consultationPatient.medicalRecord.gender === 'Male' ? '男' : '女'}</p>
              <button
                onClick={() => onViewRecord(consultationPatient.medicalRecord)}
                className="mt-6 bg-cyan-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-cyan-500/80 transition-colors w-full"
              >
                查看病单
              </button>
            </div>

            {/* Right Panel: Story & Actions */}
            <div className="w-3/4 flex flex-col">
              {/* Story Display */}
              <div className="flex-grow overflow-y-auto p-4 bg-black/5">
                <div className="prose prose-invert max-w-none">
                  {consultationStory.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-200 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Panel */}
              <div className="flex-shrink-0 p-4 bg-black/30 border-t border-stone-700">
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {(consultationChoices && Array.isArray(consultationChoices) ? consultationChoices : []).map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => onConsultationAction(choice)}
                      disabled={isLoading}
                      className="flex-grow basis-40 text-center bg-stone-800/80 px-3 py-2 rounded-md hover:bg-stone-700/80 disabled:opacity-50 transition-colors text-white"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
                {/* Custom input form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isLoading && customAction.trim()) {
                        onConsultationAction(customAction);
                        setCustomAction('');
                      }
                    }}
                    placeholder="输入你的问诊行动..."
                    disabled={isLoading}
                    className="flex-grow px-4 py-2 bg-stone-800/80 border border-stone-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                  />
                  <button
                    onClick={() => {
                      if (customAction.trim()) {
                        onConsultationAction(customAction);
                        setCustomAction('');
                      }
                    }}
                    disabled={isLoading || !customAction.trim()}
                    className="px-6 py-2 bg-amber-600/80 text-white font-bold rounded-md hover:bg-amber-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '生成中...' : '问诊'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredPatients = patients.filter(p => {
    const genderMatch = p.medicalRecord.gender === activeTab;
    const statusMatch = statusFilter === '全部' || p.status === statusFilter;
    return genderMatch && statusMatch;
  });

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border bg-stone-900 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
          <h2 className="text-2xl font-bold text-amber-300 font-serif">性病医馆</h2>
          <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-stone-700 bg-black/10">
          <div className="flex flex-col gap-2">
            <div className="flex space-x-2">
              <button onClick={() => setActiveTab('Female')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'Female' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>女性病患</button>
              <button onClick={() => setActiveTab('Male')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'Male' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>男性病患</button>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setStatusFilter('待诊')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${statusFilter === '待诊' ? 'bg-green-500/20 text-green-300' : 'bg-stone-700/30 text-gray-400 hover:bg-stone-600/30'}`}>待诊</button>
              <button onClick={() => setStatusFilter('治疗中')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${statusFilter === '治疗中' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-stone-700/30 text-gray-400 hover:bg-stone-600/30'}`}>治疗中</button>
              <button onClick={() => setStatusFilter('已治愈')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${statusFilter === '已治愈' ? 'bg-blue-500/20 text-blue-300' : 'bg-stone-700/30 text-gray-400 hover:bg-stone-600/30'}`}>已治愈</button>
              <button onClick={() => setStatusFilter('全部')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${statusFilter === '全部' ? 'bg-purple-500/20 text-purple-300' : 'bg-stone-700/30 text-gray-400 hover:bg-stone-600/30'}`}>全部</button>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => onAddPatient('Female')} disabled={isLoading} className="px-3 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-md hover:bg-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? '生成中...' : '添加女病患'}
            </button>
            <button onClick={() => onAddPatient('Male')} disabled={isLoading} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-md hover:bg-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? '生成中...' : '添加男病患'}
            </button>
            <button onClick={onRefresh} disabled={isLoading} className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-md hover:bg-yellow-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
              <i className={`fa-solid fa-sync ${isLoading ? 'animate-spin' : ''}`}></i> 刷新列表
            </button>
          </div>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          {filteredPatients.length > 0 ? (
            <div className="space-y-4">
              {filteredPatients.map(patient => {
                const statusColor = patient.status === '待诊' ? 'text-green-400' : patient.status === '治疗中' ? 'text-yellow-400' : 'text-blue-400';
                const statusBadge = patient.status === '待诊' ? 'bg-green-500/20' : patient.status === '治疗中' ? 'bg-yellow-500/20' : 'bg-blue-500/20';

                return (
                  <div key={patient.id} className="bg-black/20 p-4 rounded-lg border border-stone-700/50 flex justify-between items-center">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white font-serif">{patient.medicalRecord.name} <span className="text-base font-normal text-gray-400">({patient.medicalRecord.age}岁)</span></h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusBadge} ${statusColor} font-semibold`}>{patient.status}</span>
                      </div>
                      <p className="text-sm text-red-400 italic mt-1">病症: {patient.medicalRecord.illnessDescription.substring(0, 50)}...</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewRecord(patient.medicalRecord)}
                        className="bg-cyan-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-cyan-500/80 transition-colors"
                      >
                        查看病单
                      </button>
                      {patient.status === '待诊' && (
                        <button
                          onClick={() => onStartConsultation(patient.id)}
                          className="bg-green-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-green-500/80 transition-colors"
                        >
                          开始问诊
                        </button>
                      )}
                      {patient.status === '治疗中' && (
                        <button
                          onClick={() => onStartConsultation(patient.id)}
                          className="bg-yellow-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-yellow-500/80 transition-colors"
                        >
                          继续问诊
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 pt-10">
              <p className="text-4xl mb-4">🌿</p>
              <p>当前筛选条件下无病人。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalModal;