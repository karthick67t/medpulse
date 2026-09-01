import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  let styleClass = '';
  if (level === 'HIGH') {
    styleClass = 'bg-red-50 text-red-700 border-red-200 shadow-sm';
  } else if (level === 'MEDIUM') {
    styleClass = 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
  } else {
    styleClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md border',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg border tracking-wide uppercase',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold rounded-xl border tracking-wide uppercase'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${styleClass}`}>
      <span className={`w-2 h-2 rounded-full ${
        level === 'HIGH' ? 'bg-red-600 animate-pulse' :
        level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />
      {level} RISK {score !== undefined && <span className="font-mono">({score})</span>}
    </span>
  );
};
