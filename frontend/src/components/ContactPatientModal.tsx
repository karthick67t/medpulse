import React, { useState, useEffect } from 'react';
import { PatientListItem, OutreachLog } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Phone,
  MessageSquare,
  MessageCircle,
  Mail,
  Send,
  X,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface ContactPatientModalProps {
  patient: PatientListItem | null;
  initialChannel?: 'Phone' | 'SMS' | 'WhatsApp' | 'Email';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenEdit?: () => void;
}

export const ContactPatientModal: React.FC<ContactPatientModalProps> = ({
  patient,
  initialChannel = 'Phone',
  isOpen,
  onClose,
  onSuccess,
  onOpenEdit
}) => {
  const [channel, setChannel] = useState<'Phone' | 'SMS' | 'WhatsApp' | 'Email'>(initialChannel);
  const [message, setMessage] = useState('');
  const [outreachLog, setOutreachLog] = useState<OutreachLog | null>(null);
  const [showOutcomeStep, setShowOutcomeStep] = useState(false);
  const [outcome, setOutcome] = useState('Appointment Confirmed');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useAuth();

  useEffect(() => {
    if (initialChannel) {
      setChannel(initialChannel);
    }
  }, [initialChannel]);

  useEffect(() => {
    if (patient) {
      const apptDate = patient.next_followup_date || 'Next Scheduled Visit';
      const pId = patient.patient_id_code || patient.patient_id || 'N/A';

      if (channel === 'Email') {
        setMessage(
          `Hello ${patient.name},\n\n` +
          `This is a reminder from MedPulse regarding your upcoming follow-up appointment.\n\n` +
          `Patient ID: ${pId}\n` +
          `Department: ${patient.department}\n` +
          `Appointment Date: ${apptDate}\n` +
          `Appointment Time: 10:00 AM\n\n` +
          `Please attend your scheduled follow-up appointment. If you need to reschedule, please contact the hospital.\n\n` +
          `Regards,\nMedPulse Care Team`
        );
      } else {
        setMessage(
          `Hello ${patient.name}, this is a reminder from MedPulse regarding your upcoming follow-up appointment on ${apptDate}. Please reply to confirm or contact the hospital if you need to reschedule.`
        );
      }
    }
  }, [patient, channel]);

  if (!isOpen || !patient) return null;

  const getCleanPhone = () => {
    const raw = patient.preferred_contact_method || '+15550000000';
    return raw.replace(/[^0-9+]/g, '');
  };

  const getPatientEmail = () => {
    return (patient as any).email || `${(patient.patient_id_code || patient.patient_id || 'p100').toLowerCase()}@medpulse.ai`;
  };

  const handleInitiateContact = async () => {
    setSubmitting(true);
    let log: OutreachLog | null = null;
    const phoneNum = getCleanPhone();
    const emailAddr = getPatientEmail();

    try {
      if (channel === 'Phone') {
        log = await api.initiatePhoneOutreach(patient.patient_id_code || patient.patient_id);
        addToast(`Opening device phone dialer for ${patient.name}...`, 'info');
        window.location.href = `tel:${phoneNum}`;
      } else if (channel === 'SMS') {
        log = await api.initiateSmsOutreach(patient.patient_id_code || patient.patient_id, message);
        addToast(`Opening native SMS application...`, 'info');
        window.location.href = `sms:${phoneNum}?body=${encodeURIComponent(message)}`;
      } else if (channel === 'WhatsApp') {
        log = await api.initiateWhatsappOutreach(patient.patient_id_code || patient.patient_id, message);
        addToast(`Opening WhatsApp chat...`, 'info');
        const waNum = phoneNum.replace('+', '');
        window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(message)}`, '_blank');
      } else if (channel === 'Email') {
        if (patient.risk_level === 'HIGH') {
          log = await api.sendHighRiskEmailAlert(patient.patient_id_code || patient.patient_id, message);
        } else {
          log = await api.initiateEmailOutreach(patient.patient_id_code || patient.patient_id, message);
        }
        addToast(`Email client opened. Record the outreach outcome after contacting the patient.`, 'info');
        const emailSubject = `MedPulse Follow-up Appointment Reminder`;
        window.location.href = `mailto:${emailAddr}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(message)}`;
      }

      setOutreachLog(log);
      setSubmitting(false);
      setShowOutcomeStep(true);
    } catch (err) {
      setSubmitting(false);
      addToast(`Failed to record outreach attempt.`, 'error');
    }
  };

  const handleSaveOutcome = async () => {
    if (!outreachLog) return;
    setSubmitting(true);
    try {
      await api.recordCallOutcome(outreachLog.id, outcome, notes);
      setSubmitting(false);
      addToast(`Outreach outcome '${outcome}' recorded in MySQL!`, 'success');
      onSuccess?.();
      handleClose();
    } catch (err) {
      setSubmitting(false);
      addToast('Failed to record outreach outcome.', 'error');
    }
  };

  const handleClose = () => {
    setShowOutcomeStep(false);
    setOutreachLog(null);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
              {channel === 'Phone' && <Phone className="w-5 h-5" />}
              {channel === 'SMS' && <MessageSquare className="w-5 h-5" />}
              {channel === 'WhatsApp' && <MessageCircle className="w-5 h-5" />}
              {channel === 'Email' && <Mail className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base">Contact Patient — MedPulse Smart Outreach</h3>
              <p className="text-xs text-emerald-200">Real Device & Browser Communication Deep Links</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Patient Header Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400">ID: {patient.patient_id_code || patient.patient_id}</span>
              <h4 className="font-black text-base text-slate-900">{patient.name}</h4>
              <p className="text-xs font-semibold text-slate-500">{patient.department} • Follow-up: {patient.next_followup_date}</p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl font-black text-xs inline-flex items-center gap-1 ${
                  patient.risk_level === 'HIGH'
                    ? 'bg-red-100 text-red-800'
                    : patient.risk_level === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{patient.risk_score}/100 ({patient.risk_level})</span>
              </span>
            </div>
          </div>

          {!showOutcomeStep ? (
            /* STEP 1: CHANNEL SELECTION & EDITABLE MESSAGE PREVIEW */
            <div className="space-y-4">
              {/* Channel Selector (2x2 grid on mobile, 4 columns on desktop) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Communication Channel</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Phone', label: 'Call', icon: Phone, color: 'text-red-600' },
                    { id: 'SMS', label: 'SMS', icon: MessageSquare, color: 'text-blue-600' },
                    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-600' },
                    { id: 'Email', label: 'Email', icon: Mail, color: 'text-purple-600' }
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = channel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setChannel(ch.id as any)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-900 text-white border-emerald-900 shadow-md scale-102'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-300' : ch.color}`} />
                        <span className="font-extrabold text-xs">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editable Message Preview for SMS / WhatsApp / Email */}
              {channel !== 'Phone' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Message Body (Editable)</span>
                    <span className="text-[10px] text-slate-400 font-mono">{message.length} chars</span>
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 leading-relaxed font-mono"
                  />
                </div>
              )}

              {channel === 'Phone' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <h5 className="font-bold flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Direct Phone Call Workflow</span>
                  </h5>
                  <p className="text-emerald-800">
                    Clicking below triggers <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono text-[11px]">tel:</code> opening your device's native phone dialer.
                  </p>
                </div>
              )}

              {/* Initiate Button */}
              <button
                type="button"
                onClick={handleInitiateContact}
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Initiating Communication...' : `Launch ${channel} Action Now`}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* STEP 2: OUTCOME RECORDING DIALOG AFTER CONTACT */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-sm text-emerald-950">{channel} Action Launched</h4>
                <p className="text-xs text-emerald-800">Record outreach outcome to update MySQL care database.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Communication Outcome</label>
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
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Staff Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record patient feedback or notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveOutcome}
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Saving Outcome...' : 'Save Outcome to MySQL Database'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
