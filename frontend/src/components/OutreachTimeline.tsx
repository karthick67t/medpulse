import React, { useEffect, useState } from 'react';
import { OutreachLog } from '../types';
import { api } from '../api/client';
import {
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  UserCheck,
  Smartphone
} from 'lucide-react';

interface OutreachTimelineProps {
  patientId: string;
}

export const OutreachTimeline: React.FC<OutreachTimelineProps> = ({ patientId }) => {
  const [logs, setLogs] = useState<OutreachLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [patientId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getPatientOutreach(patientId);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 font-semibold animate-pulse">
        Loading outreach timeline...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
        <Clock className="w-6 h-6 text-slate-400 mx-auto" />
        <h4 className="text-xs font-bold text-slate-700">No Outreach History Yet</h4>
        <p className="text-[11px] text-slate-500">Initiate a call or send a reminder to start tracking interactions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-extrabold text-slate-900">Outreach Timeline</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {logs.length} Logged Contact Attempts
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {logs.map((log) => {
          const isPhone = log.channel === 'Phone';
          const isConfirmed = log.status === 'Confirmed' || log.response === 'Appointment Confirmed';

          return (
            <div key={log.id} className="relative group">
              {/* Timeline Icon Badge */}
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white text-xs ${
                  isConfirmed
                    ? 'border-emerald-600 text-emerald-600'
                    : isPhone
                    ? 'border-red-500 text-red-500'
                    : 'border-blue-500 text-blue-500'
                }`}
              >
                {isPhone ? <PhoneCall className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{log.message_type}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {new Date(log.attempted_at).toLocaleDateString()} at {new Date(log.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-600">Channel: {log.channel}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-500">By: {log.created_by}</span>
                  <span>•</span>
                  <span
                    className={`font-black text-[10px] px-2 py-0.5 rounded ${
                      log.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'Delivered'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {log.status.toUpperCase()}
                  </span>
                </div>

                {log.response && (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 font-mono">
                    <strong className="text-slate-500">Outcome/Response: </strong> {log.response}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
