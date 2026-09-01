import React from 'react';
import { AlertCircle } from 'lucide-react';

export const HealthcareDisclaimer: React.FC = () => {
  return (
    <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 text-slate-600 text-xs flex items-start gap-2.5 my-4">
      <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-slate-700">Healthcare Decision-Support Disclaimer: </span>
        CareTrack AI is a decision-support prototype designed to help prioritize follow-up outreach. It does not diagnose disease, determine treatment, or replace clinical judgment.
      </div>
    </div>
  );
};
