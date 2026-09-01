import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { PatientListItem } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import { ContactPatientModal } from '../components/ContactPatientModal';
import { useAuth } from '../context/AuthContext';
import {
  ListChecks,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Calendar,
  ArrowRight,
  Filter,
  Send,
  UserCheck,
  Search,
  X,
  Phone,
  MessageSquare,
  MessageCircle,
  Mail,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const RiskQueuePage: React.FC = () => {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Contact Modal State
  const [contactPatient, setContactPatient] = useState<PatientListItem | null>(null);
  const [contactChannel, setContactChannel] = useState<'Phone' | 'SMS' | 'WhatsApp' | 'Email'>('Phone');
  const [showContactModal, setShowContactModal] = useState(false);

  const { addToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.getPatients({ sort_by: 'risk_score', order: 'desc', limit: 150 });
      setPatients(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Debounced Filtered Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Risk Tab filter
      if (activeTab !== 'all' && p.risk_level !== activeTab) return false;
      // Department filter
      if (selectedDept && p.department !== selectedDept) return false;
      // Real-time Search Query by Name or Patient ID
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = p.name.toLowerCase().includes(q);
        const idMatch = (p.patient_id_code || p.patient_id || '').toLowerCase().includes(q);
        if (!nameMatch && !idMatch) return false;
      }
      return true;
    });
  }, [patients, activeTab, selectedDept, searchQuery]);

  const openContact = (p: PatientListItem, ch: 'Phone' | 'SMS' | 'WhatsApp' | 'Email') => {
    setContactPatient(p);
    setContactChannel(ch);
    setShowContactModal(true);
  };

  const highRiskCount = patients.filter((p) => p.risk_level === 'HIGH').length;
  const mediumRiskCount = patients.filter((p) => p.risk_level === 'MEDIUM').length;
  const lowRiskCount = patients.filter((p) => p.risk_level === 'LOW').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Risk Priority Queue</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Real-time patient risk triage and MedPulse Smart Outreach execution.
          </p>
        </div>

        {/* Tab Badges */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab('HIGH')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'HIGH' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>High Risk ({highRiskCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('MEDIUM')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'MEDIUM' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Medium ({mediumRiskCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('LOW')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'LOW' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Low ({lowRiskCount})</span>
          </button>
        </div>
      </div>

      {/* Real-time Debounced Search Box & Department Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Real-time Search Box */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients by name or Patient ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
        >
          <option value="">All Departments</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Neurology">Neurology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="ENT">ENT</option>
        </select>
      </div>

      {/* Priority Queue Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
          Loading priority queue...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">No patients found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching with another patient name or Patient ID, or clear active filters.
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Clear Search Query
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Patient Code</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Next Follow-up</th>
                  <th className="py-3.5 px-4">Top Risk Factor</th>
                  <th className="py-3.5 px-4 text-center">Smart Outreach Channels</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.patient_id_code || p.patient_id}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{p.department}</td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">{p.next_followup_date}</td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{p.top_factor || 'Missed visit history'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openContact(p, 'Phone')}
                          title="Call Now via device dialer"
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openContact(p, 'SMS')}
                          title="Send SMS via native app"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openContact(p, 'WhatsApp')}
                          title="Open WhatsApp chat"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openContact(p, 'Email')}
                          title="Send Email via mail client"
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.risk_level === 'HIGH' ? (
                        <button
                          onClick={() => openContact(p, 'Phone')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-all flex items-center gap-1 ml-auto"
                        >
                          <Phone className="w-3 h-3" />
                          <span>CALL NOW</span>
                        </button>
                      ) : p.risk_level === 'MEDIUM' ? (
                        <button
                          onClick={() => openContact(p, 'Phone')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-all flex items-center gap-1 ml-auto"
                        >
                          <Send className="w-3 h-3" />
                          <span>FOLLOW UP</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openContact(p, 'SMS')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-all flex items-center gap-1 ml-auto"
                        >
                          <Send className="w-3 h-3" />
                          <span>REMINDER</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Universal Smart Outreach Contact Modal */}
      <ContactPatientModal
        patient={contactPatient}
        initialChannel={contactChannel}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSuccess={fetchQueue}
      />

      <HealthcareDisclaimer />
    </div>
  );
};
