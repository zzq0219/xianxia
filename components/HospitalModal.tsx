import React, { useState } from 'react';
import { Patient, MedicalRecord } from '../types';

interface HospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onStartConsultation: (patientId: string) => void;
  onRefresh: () => void;
  onAddPatient: (gender: 'Male' | 'Female') => void;
  isLoading: boolean;
  onViewRecord: (record: MedicalRecord) => void;
}

const HospitalModal: React.FC<HospitalModalProps> = ({ isOpen, onClose, patients, onStartConsultation, onRefresh, onAddPatient, isLoading, onViewRecord }) => {
  const [activeTab, setActiveTab] = useState<'Male' | 'Female'>('Female');

  if (!isOpen) return null;

  const filteredPatients = patients.filter(p => p.medicalRecord.gender === activeTab && p.status === '待诊');

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
            <div className="flex space-x-2">
                <button onClick={() => setActiveTab('Female')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'Female' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>女性病患</button>
                <button onClick={() => setActiveTab('Male')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'Male' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>男性病患</button>
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
                    {filteredPatients.map(patient => (
                        <div key={patient.id} className="bg-black/20 p-4 rounded-lg border border-stone-700/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white font-serif">{patient.medicalRecord.name} <span className="text-base font-normal text-gray-400">({patient.medicalRecord.age}岁)</span></h3>
                                <p className="text-sm text-red-400 italic mt-1">病症: {patient.medicalRecord.illnessDescription.substring(0, 30)}...</p>
                            </div>
                            <div className="flex space-x-2">
                               <button
                                    onClick={() => onViewRecord(patient.medicalRecord)}
                                    className="bg-cyan-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-cyan-500/80 transition-colors"
                                >
                                    查看详情
                                </button>
                               <button
                                    onClick={() => onStartConsultation(patient.id)}
                                    className="bg-green-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-green-500/80 transition-colors"
                                >
                                    开始问诊
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 pt-10">
                    <p className="text-4xl mb-4">🌿</p>
                    <p>今日无待诊病人。</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HospitalModal;