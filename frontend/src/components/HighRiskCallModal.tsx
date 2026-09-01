import React, { useState, useEffect } from 'react';
import { PatientListItem, OutreachLog } from '../types';
import { api } from '../api/client';
import {
  PhoneCall,
  PhoneOff,
  User,
  ShieldAlert,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  Radio,
  FileText
} from 'lucide-react';

interface HighRiskCallModalProps {
  patient: PatientListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const HighRiskCallModal: React.FC<HighRiskCallModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
  const [outreachLog, setOutreachLog] = useState<OutreachLog | null>(null);
  const [outcome, setOutcome] = useState<string>('Appointment Confirmed');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!isOpen || !patient) return null;

  const handleStartCall = async () => {
    setCallState('dialing');
    try {
      const log = await api.initiateHighRiskCall(patient.patient_id_code || patient.patient_id);
      setOutreachLog(log);
      setTimeout(() => {
        setCallState('connected');
      }, 2000);
    } catch (err) {
      setCallState('idle');
      alert('Failed to initiate call workflow.');
    }
  };

  const handleEndCall = () => {
    setCallState('ended');
  };

  const handleSaveOutcome = async () => {
    if (!outreachLog) return;
    setSubmitting(true);
    try {
      await api.recordCallOutcome(outreachLog.id, outcome, notes);
      setSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      setSubmitting(false);
      alert('Failed to save call outcome.');
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">High-Risk Patient Call Workflow</h3>
                <span className="px-2 py-0.5 bg-red-800 text-white font-bold text-[10px] uppercase rounded">
                  URGENT SLA
                </span>
              </div>
              <p className="text-xs text-red-100">Care Coordinator Telephony Simulation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Patient Call Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">ID: {patient.patient_id_code || patient.patient_id}</span>
                <h4 className="text-lg font-black text-slate-900">{patient.name}</h4>
                <p className="text-xs font-semibold text-slate-500">{patient.age} yrs • {patient.department}</p>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 font-black text-xs rounded-xl border border-red-200">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Risk Score: {patient.risk_score}/100 ({patient.risk_level})</span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-1">
                  Preferred Contact: <span className="text-slate-900">{patient.preferred_contact_method || 'Phone'}</span>
                </p>
              </div>
            </div>

            {/* Quick Context Summary */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Top Risk Reason</span>
                <span className="font-bold text-slate-800 line-clamp-1">{patient.top_factor || 'Missed visit history'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Missed Visits</span>
                <span className="font-bold text-red-700">{patient.missed_appointments} of {patient.total_appointments} visits</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Travel Distance</span>
                <span className="font-bold text-slate-800">{patient.distance_km} km to hospital</span>
              </div>
            </div>
          </div>

          {/* Telephony Dialing & Active Call Simulation */}
          <div className="bg-emerald-900 text-white rounded-2xl p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/20 rounded-full blur-2xl" />

            {callState === 'idle' && (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-700 flex items-center justify-center text-white shadow-lg">
                  <PhoneCall className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-base">Ready to Initiate Call</h4>
                <p className="text-xs text-emerald-200 max-w-md mx-auto">
                  Click below to simulate calling <strong className="text-white">{patient.name}</strong>. Telephony logs will be recorded in MySQL.
                </p>
                <button
                  onClick={handleStartCall}
                  className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs rounded-xl shadow-lg transition-all"
                >
                  Start Call Simulation Now
                </button>
              </div>
            )}

            {callState === 'dialing' && (
              <div className="space-y-3 animate-pulse">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg">
                  <Radio className="w-7 h-7 animate-spin" />
                </div>
                <h4 className="font-extrabold text-base text-amber-200">Dialing Patient...</h4>
                <p className="text-xs text-emerald-200">Connecting to telephony gateway gateway...</p>
              </div>
            )}

            {callState === 'connected' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono font-black text-xl text-emerald-300">{formatTimer(timerSeconds)}</span>
                </div>
                <h4 className="font-extrabold text-base">Call Active with {patient.name}</h4>
                <p className="text-xs text-emerald-100">
                  Discuss upcoming follow-up appointment on <strong className="text-white">{patient.next_followup_date || 'Next Tuesday'}</strong>.
                </p>
                <button
                  onClick={handleEndCall}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 mx-auto"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </button>
              </div>
            )}

            {callState === 'ended' && (
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-800 text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-base">Call Complete</h4>
                <p className="text-xs text-emerald-200">Please record the call outcome below to update MySQL records.</p>
              </div>
            )}
          </div>

          {/* Record Call Outcome Form */}
          {(callState === 'connected' || callState === 'ended') && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Record Call Outcome</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {[
                  'Appointment Confirmed',
                  'Appointment Rescheduled',
                  'Callback Requested',
                  'Patient Unreachable',
                  'Patient Declined',
                  'Other'
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setOutcome(opt)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      outcome === opt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Staff Call Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record patient response, transportation assistance required, or callback preferences..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveOutcome}
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Saving Outcome to Database...' : 'Save Outcome & Update Patient Status'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
