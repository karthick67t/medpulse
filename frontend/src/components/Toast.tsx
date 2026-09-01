import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 text-white';
        let Icon = Info;
        if (toast.type === 'success') {
          bg = 'bg-emerald-900 text-emerald-100 border border-emerald-700';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bg = 'bg-red-900 text-red-100 border border-red-700';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs font-medium animate-slide-up ${bg}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
