import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { PatientDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import { ContactPatientModal } from '../components/ContactPatientModal';
import { AddPatientModal } from '../components/AddPatientModal';
import { OutreachTimeline } from '../components/OutreachTimeline';
import {
  User,
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Phone,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  ShieldCheck,
  TrendingUp,
  Scale,
  Edit3,
  MessageSquare,
  MessageCircle,
  Mail,
  Send
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Contact Patient Modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactChannel, setContactChannel] = useState<'Phone' | 'SMS' | 'WhatsApp' | 'Email'>('Phone');

  // Edit Patient Modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // Human Override Modal state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridePriority, setOverridePriority] = useState('HIGH');
  const [overrideReason, setOverrideReason] = useState('Patient already contacted');
  const [customReason, setCustomReason] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const res = await api.getPatientDetail(id!);
      setPatient(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    const finalReason = overrideReason === 'Other' ? customReason : overrideReason;

    try {
      const updated = await api.overridePatientPriority(patient.patient_id_code, overridePriority, finalReason);
      setPatient(updated);
      setShowOverrideModal(false);
      alert(`Updated priority override to ${overridePriority}`);
    } catch (err) {
      alert('Failed to update priority override');
    }
  };

  if (loading || !patient) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Retrieving patient risk profile & appointment timeline...</p>
      </div>
    );
  }

  // Simulated Risk Journey line chart data
  const riskJourneyData = [
    { period: '6 Months Ago', risk: Math.max(10, patient.current_risk_score - 25), event: 'Attended' },
    { period: '4 Months Ago', risk: Math.max(15, patient.current_risk_score - 15), event: 'Attended' },
    { period: '2 Months Ago', risk: patient.previous_risk_score || Math.max(20, patient.current_risk_score - 10), event: 'Missed Appt' },
    { period: 'Current Evaluation', risk: patient.current_risk_score, event: 'Risk Re-evaluated' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button & Top Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients</span>
        </button>

        <div className="flex items-center gap-2">
          {patient.priority_override && (
            <span className="px-3 py-1 bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs rounded-full flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-amber-700" />
              Human Override Active: {patient.priority_override}
            </span>
          )}
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-700" />
            <span>Edit Patient</span>
          </button>
          <button
            onClick={() => setShowOverrideModal(true)}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Override Priority</span>
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-emerald-600/20 font-mono">
            {patient.patient_id_code.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{patient.name}</h1>
              <span className="text-xs font-mono font-bold text-slate-400">({patient.patient_id_code})</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
              <span>{patient.age} yrs • {patient.gender}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                {patient.department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                {patient.distance_km} km away
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                {patient.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calculated Risk Score</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{patient.current_risk_score}<span className="text-xs font-normal text-slate-400">/100</span></p>
          </div>
          <RiskBadge level={patient.current_risk_level} score={patient.current_risk_score} size="lg" />
        </div>
      </div>

      {/* MedPulse Smart Outreach Contact Section (Green and White Theme) */}
      <div className="bg-white text-slate-900 p-5 rounded-2xl border-2 border-emerald-500/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-widest block">MedPulse Smart Outreach</span>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5">Contact Patient Directly</h3>
          <p className="text-xs text-slate-600 mt-0.5">Launch device phone call, SMS, WhatsApp chat, or email client with real-time outcome logging.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setContactChannel('Phone');
              setShowContactModal(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </button>
          <button
            onClick={() => {
              setContactChannel('SMS');
              setShowContactModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>SMS</span>
          </button>
          <button
            onClick={() => {
              setContactChannel('WhatsApp');
              setShowContactModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => {
              setContactChannel('Email');
              setShowContactModal(true);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Grid: Risk Journey & Why Risk Changed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Journey Progression Line Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Risk Journey Progression</h3>
              <p className="text-xs text-slate-500">Historical risk score timeline & major events</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskJourneyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip formatter={(val: any) => [`${val} risk points`, 'Risk Score']} />
                <Line type="monotone" dataKey="risk" stroke="#16A34A" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Why Did Risk Change Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Why Did Risk Change?</h3>
              <p className="text-xs text-slate-500">Period-over-period risk factor changes</p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
              patient.risk_change > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {patient.risk_change > 0 ? `+${patient.risk_change} pts` : `${patient.risk_change} pts`}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Previous Score vs Current</span>
              <div className="flex items-center justify-between mt-1 text-xs font-bold font-mono">
                <span className="text-slate-600">Previous: {patient.previous_risk_score} pts</span>
                <span className="text-slate-400">→</span>
                <span className="text-red-700">Current: {patient.current_risk_score} pts</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Primary Contributing Factors:</h4>
              {patient.risk_factors.map((f, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-slate-200/80 rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{f.factor}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
                  </div>
                  <span className="font-mono font-bold text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded shrink-0">
                    +{f.impact_points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Timeline Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Appointment History Timeline</h3>
        <div className="space-y-3">
          {patient.appointments.map((appt) => (
            <div key={appt.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  appt.status === 'Attended' ? 'bg-emerald-600' :
                  appt.status === 'Missed' ? 'bg-red-600' : 'bg-amber-500'
                }`}>
                  {appt.status === 'Attended' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{appt.appointment_date.slice(0, 10)} Follow-up</h4>
                  <p className="text-[11px] text-slate-500">{appt.notes || 'Routine follow-up'}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                appt.status === 'Attended' ? 'bg-emerald-100 text-emerald-800' :
                appt.status === 'Missed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Outreach Timeline Section */}
      <OutreachTimeline patientId={patient.patient_id_code} />

      {/* Human Priority Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" /> Human-in-the-Loop Priority Override
            </h3>
            <form onSubmit={handleSubmitOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Override Priority Level</label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="HIGH">HIGH Priority</option>
                  <option value="MEDIUM">MEDIUM Priority</option>
                  <option value="LOW">LOW Priority</option>
                  <option value="NONE">Reset to System Calculated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Override Rationale (Mandatory)</label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="Patient already contacted">Patient already contacted by staff</option>
                  <option value="Patient data inaccurate">Patient data reported inaccurate</option>
                  <option value="Additional context">Additional clinical / social context</option>
                  <option value="Other">Other reason...</option>
                </select>
              </div>

              {overrideReason === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Reason</label>
                  <input
                    type="text"
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Explain clinical/operational rationale..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Contact Patient Modal */}
      <ContactPatientModal
        patient={patient ? ({ ...patient, patient_id_code: patient.patient_id_code, risk_score: patient.current_risk_score, risk_level: patient.current_risk_level } as any) : null}
        initialChannel={contactChannel}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSuccess={fetchPatient}
      />

      {/* Edit Patient Modal */}
      <AddPatientModal
        isOpen={showEditModal}
        mode="edit"
        initialPatient={patient}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchPatient}
      />

      <HealthcareDisclaimer />
    </div>
  );
};
