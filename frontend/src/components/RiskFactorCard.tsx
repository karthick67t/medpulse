import React from 'react';
import { RiskFactor } from '../types';

interface RiskFactorCardProps {
  factor: RiskFactor;
}

export const RiskFactorCard: React.FC<RiskFactorCardProps> = ({ factor }) => {
  const getSeverityBadge = (sev: string) => {
    if (sev === 'high') {
      return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-800 border border-red-200">High Impact</span>;
    }
    if (sev === 'medium') {
      return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-800 border border-amber-200">Medium Impact</span>;
    }
    return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200">Low Impact</span>;
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-all">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">{factor.factor_name}</h4>
        <div className="flex items-center gap-2">
          {getSeverityBadge(factor.severity)}
          <span className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
            +{factor.impact_score} pts
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
        {factor.reason}
      </p>
    </div>
  );
};
