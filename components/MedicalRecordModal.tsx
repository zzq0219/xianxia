import React from 'react';
import { MedicalRecord } from '../types';

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MedicalRecord;
}

const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border bg-stone-900 w-full max-w-lg h-auto max-h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
          <h2 className="text-2xl font-bold text-amber-300 font-serif">
            病单详情: {record.name}
          </h2>
          <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        <div className="flex-grow p-6 overflow-y-auto space-y-4 text-stone-200">
          <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
            <h4 className="font-semibold text-amber-400 mb-2">基本信息</h4>
            <p className="text-stone-200"><strong className="text-amber-300">姓名:</strong> {record.name}</p>
            <p className="text-stone-200"><strong className="text-amber-300">性别:</strong> {record.gender}</p>
            <p className="text-stone-200"><strong className="text-amber-300">年龄:</strong> {record.age}</p>
            <p className="text-stone-200"><strong className="text-amber-300">背景:</strong> {record.background}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
            <h4 className="font-semibold text-pink-400 mb-2">性特征</h4>
            <p className="text-stone-200"><strong className="text-pink-300">器官户型:</strong> {record.genitalShape || '未记录'}</p>
            <div className="text-stone-200">
              <strong className="text-pink-300">特征:</strong>
              <ul className="list-disc list-inside ml-4">
                {record.sexualFeatures && Array.isArray(record.sexualFeatures) && record.sexualFeatures.length > 0 ? (
                  record.sexualFeatures.map((feature, index) => (
                    <li key={index} className="text-stone-200">
                      {typeof feature === 'string' ? feature : typeof feature === 'object' && feature !== null ? JSON.stringify(feature) : String(feature)}
                    </li>
                  ))
                ) : (
                  <li className="text-stone-400">暂无记录</li>
                )}
              </ul>
            </div>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-red-500/30">
            <h4 className="font-semibold text-red-400 mb-2">病症描述</h4>
            <p className="whitespace-pre-wrap text-stone-200">{record.illnessDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordModal;