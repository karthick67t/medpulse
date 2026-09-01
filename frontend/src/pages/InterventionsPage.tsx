import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Intervention } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardCheck,
  Plus,
  Clock,
  CheckCircle2,
  PhoneCall,
  Send,
  Car,
  Video,
  RefreshCw,
  Award
} from 'lucide-react';

export const InterventionsPage: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Outcome selection modal state
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedIntId, setSelectedIntId] = useState<number | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState('Appointment Confirmed');

  // New intervention form state
  const [patientCode, setPatientCode] = useState('P1024');
  const [intType, setIntType] = useState('Phone Call');
  const [assignedTo, setAssignedTo] = useState('Nurse Robert Chen');
  const [notes, setNotes] = useState('');

  const { addToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const res = await api.getInterventions();
      setInterventions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string, outcomeVal?: string) => {
    try {
      await api.updateIntervention(id, { status: newStatus, outcome: outcomeVal });
      addToast(`Updated status to ${newStatus}${outcomeVal ? ` (${outcomeVal})` : ''}`, 'success');
      fetchInterventions();
    } catch (err) {
      addToast('Failed to update intervention status', 'error');
    }
  };

  const handleCompleteWithOutcome = (id: number) => {
    setSelectedIntId(id);
    setSelectedOutcome('Appointment Confirmed');
    setShowOutcomeModal(true);
  };

  const submitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIntId) {
      await handleUpdateStatus(selectedIntId, 'completed', selectedOutcome);
      setShowOutcomeModal(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = await api.getPatientDetail(patientCode);
      await api.createIntervention({
        patient_id: p.id,
        intervention_type: intType,
        assigned_to: assignedTo,
        notes
      });
      addToast('New intervention outreach task assigned!', 'success');
      setShowModal(false);
      fetchInterventions();
    } catch (err) {
      addToast('Could not find patient with that ID. Use P1024, P1092, P1134, etc.', 'error');
    }
  };

  const filtered = interventions.filter((i) => i.status === activeTab);

  const getIconForType = (t: string) => {
    if (t.includes('Phone')) return <PhoneCall className="w-4 h-4 text-emerald-600" />;
    if (t.includes('SMS')) return <Send className="w-4 h-4 text-emerald-600" />;
    if (t.includes('Transport')) return <Car className="w-4 h-4 text-amber-600" />;
    if (t.includes('Remote') || t.includes('Tele')) return <Video className="w-4 h-4 text-purple-600" />;
    return <RefreshCw className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Intervention Management</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Assign, track, and record proactive follow-up outreach outcomes.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Outreach Task</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Tasks ({interventions.filter(i => i.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'in_progress'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          In Progress ({interventions.filter(i => i.status === 'in_progress').length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed ({interventions.filter(i => i.status === 'completed').length})
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Fetching outreach tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No {activeTab.replace('_', ' ')} interventions.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Risk</th>
                  <th className="py-3.5 px-4">Outreach Action</th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4">Recorded Outcome</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => navigate(`/patients/${item.patient_code}`)}
                        className="font-bold text-slate-900 hover:text-emerald-700 text-left block"
                      >
                        {item.patient_name}
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">{item.patient_code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={item.patient_risk_level} score={item.patient_risk_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-semibold">
                      <div className="flex items-center gap-1.5">
                        {getIconForType(item.intervention_type)}
                        <span>{item.intervention_type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 text-[11px] font-semibold">
                        {item.assigned_to}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.outcome ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.outcome}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Outcome</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {item.status !== 'completed' && (
                        <button
                          onClick={() => handleCompleteWithOutcome(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                        >
                          Complete & Record Outcome
                        </button>
                      )}
                      {item.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs transition-colors"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/patients/${item.patient_code}`)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        Patient
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Outcome Recording Dialog */}
      {showOutcomeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> Record Follow-up Outcome
            </h3>
            <form onSubmit={submitOutcome} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Outreach Outcome Result</label>
                <select
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="Appointment Confirmed">Appointment Confirmed</option>
                  <option value="Appointment Rescheduled">Appointment Rescheduled</option>
                  <option value="Patient Unreachable">Patient Unreachable</option>
                  <option value="Patient Declined">Patient Declined</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">This result is automatically fed into the Care Continuity Loop dataset.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Intervention Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-2">Log New Outreach Intervention</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient ID Code</label>
                <input
                  type="text"
                  required
                  value={patientCode}
                  onChange={(e) => setPatientCode(e.target.value)}
                  placeholder="e.g. P1024, P1092, P1134"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intervention Type</label>
                <select
                  value={intType}
                  onChange={(e) => setIntType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="Phone Call">Phone Call</option>
                  <option value="SMS Reminder">SMS Reminder</option>
                  <option value="Appointment Rescheduling">Appointment Rescheduling</option>
                  <option value="Transportation Support">Transportation Support</option>
                  <option value="Remote Consultation Eligibility Review">Remote Consultation Eligibility Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Staff</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="Nurse Robert Chen">Nurse Robert Chen</option>
                  <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins</option>
                  <option value="Elena Rostova (Reception)">Elena Rostova (Reception)</option>
                  <option value="Care Coordinator">Care Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Action Rationale</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context or notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
