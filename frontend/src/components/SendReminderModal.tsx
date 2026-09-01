import React, { useState } from 'react';
import { PatientListItem, OutreachLog } from '../types';
import { api } from '../api/client';
import {
  Send,
  MessageSquare,
  Globe2,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Mail,
  Languages
} from 'lucide-react';

interface SendReminderModalProps {
  patient: PatientListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TEMPLATES: Record<string, string> = {
  english: "Hello {patient_name}, this is a reminder about your upcoming follow-up appointment on {appointment_date} at 10:00 AM. Please confirm or contact City General Hospital if you need to reschedule.",
  tamil: "வணக்கம் {patient_name}, உங்கள் அடுத்த தொடர் சிகிச்சை சந்திப்பு {appointment_date} அன்று காலை 10:00 மணிக்கு உள்ளது. தயவுசெய்து உறுதிப்படுத்தவும் அல்லது மாற்றம் தேவைப்பட்டால் மருத்துவமனையை தொடர்பு கொள்ளவும்.",
  hindi: "नमस्ते {patient_name}, यह आपके आगामी फॉलो-अप अपॉइंटमेंट {appointment_date} को सुबह 10:00 बजे के लिए एक रिमाइंडर है। कृपया पुष्टि करें या समय बदलने के लिए अस्पताल से संपर्क करें।"
};

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [language, setLanguage] = useState<'english' | 'tamil' | 'hindi'>('english');
  const [channel, setChannel] = useState<'SMS' | 'WhatsApp' | 'Email'>('SMS');
  const [sending, setSending] = useState(false);
  const [sentLog, setSentLog] = useState<OutreachLog | null>(null);

  if (!isOpen || !patient) return null;

  const apptDate = patient.next_followup_date || 'Next Tuesday';
  const previewText = TEMPLATES[language].replace('{patient_name}', patient.name).replace('{appointment_date}', apptDate);

  const handleSendReminder = async () => {
    setSending(true);
    try {
      const log = await api.sendAppointmentReminder(patient.patient_id_code || patient.patient_id, language, channel);
      setSentLog(log);
      setSending(false);
      onSuccess?.();
    } catch (err) {
      setSending(false);
      alert('Failed to send automated appointment reminder.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Automated Appointment Reminder</h3>
              <p className="text-xs text-emerald-200">Multilingual Outreach Dispatcher</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {sentLog ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-base text-emerald-900">Reminder Dispatched Successfully!</h4>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                Sent via <strong className="text-emerald-950">{sentLog.channel}</strong> in <strong className="text-emerald-950">{language.toUpperCase()}</strong> to {patient.name}.
              </p>
              <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-700 font-medium text-left font-mono">
                {sentLog.response}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              {/* Patient Badge */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recipient</span>
                  <h4 className="font-extrabold text-sm text-slate-900">{patient.name}</h4>
                  <p className="text-xs text-slate-500">{patient.department} • Follow-up: {apptDate}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
                  Low Risk ({patient.risk_score}/100)
                </span>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-emerald-600" />
                  <span>Select Message Language</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'english', label: 'English', sub: 'Default' },
                    { id: 'tamil', label: 'தமிழ்', sub: 'Tamil' },
                    { id: 'hindi', label: 'हिंदी', sub: 'Hindi' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguage(lang.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        language === lang.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-black text-xs">{lang.label}</span>
                      <span className="text-[10px] opacity-80">{lang.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Communication Channel</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['SMS', 'WhatsApp', 'Email'].map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        channel === ch
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Template Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Preview</label>
                <div className="p-3.5 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl border border-slate-800 leading-relaxed">
                  "{previewText}"
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={sending}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Sending Automated Reminder...' : `Dispatch ${channel} Reminder Now`}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
