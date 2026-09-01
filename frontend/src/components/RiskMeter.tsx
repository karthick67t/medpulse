import React from 'react';
import { RiskLevel } from '../types';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
  showTraceabilityLabel?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, level, showTraceabilityLabel = true }) => {
  const getMeterColor = () => {
    if (score >= 60) return '#DC2626'; // High
    if (score >= 30) return '#F59E0B'; // Medium
    return '#16A34A'; // Low
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="relative w-48 h-24 flex items-end justify-center overflow-hidden">
        {/* Semi-circle background arc */}
        <div className="absolute w-44 h-44 rounded-full border-[14px] border-slate-100 top-0" />
        
        {/* Color fill mask */}
        <div 
          className="absolute w-44 h-44 rounded-full border-[14px] top-0 transition-all duration-700 ease-out"
          style={{
            borderColor: getMeterColor(),
            clipPath: 'polygon(0 50%, 100% 50%, 100% 0, 0 0)',
            transform: `rotate(${Math.min(180, (score / 100) * 180 - 180)}deg)`,
            transformOrigin: 'center center'
          }}
        />

        <div className="text-center z-10 pb-1">
          <span className="text-4xl font-black tracking-tight text-slate-900 font-mono">
            {score}
          </span>
          <span className="text-xs font-semibold text-slate-400 block -mt-1 uppercase tracking-wider">
            / 100 Risk Score
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between w-full text-[11px] font-semibold text-slate-400 px-3">
        <span className="text-emerald-600">Low (0-29)</span>
        <span className="text-amber-600">Med (30-59)</span>
        <span className="text-red-600">High (60-100)</span>
      </div>

      {showTraceabilityLabel && (
        <div className="mt-3 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-500 text-center flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Mathematically traceable rule output
        </div>
      )}
    </div>
  );
};
