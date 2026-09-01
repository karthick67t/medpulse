import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { DashboardData, SmartOutreachSummary, PatientListItem } from '../types';
import { KpiCard } from '../components/KpiCard';
import { RiskBadge } from '../components/RiskBadge';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import { HighRiskCallModal } from '../components/HighRiskCallModal';
import { SendReminderModal } from '../components/SendReminderModal';
import {
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Building2,
  PhoneCall,
  Send,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [outreachSummary, setOutreachSummary] = useState<SmartOutreachSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Outreach Modals State
  const [selectedCallPatient, setSelectedCallPatient] = useState<PatientListItem | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);

  const [selectedReminderPatient, setSelectedReminderPatient] = useState<PatientListItem | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [res, outreach] = await Promise.all([
        api.getDashboard(),
        api.getOutreachSummary()
      ]);
      setData(res);
      setOutreachSummary(outreach);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 font-semibold animate-pulse">
        Loading hospital care dashboard...
      </div>
    );
  }

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Care Operations Workspace
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Follow-up Risk & Outreach Overview
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Identify patients at risk, understand contributors, and execute smart follow-up workflows.
          </p>
        </div>

        <button
          onClick={() => navigate('/risk-queue')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>View Priority Queue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* TODAY'S SMART OUTREACH SECTION (Green & White Theme) */}
      <div className="bg-white border-2 border-emerald-500 text-slate-900 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Today's Smart Outreach</h2>
              <p className="text-xs text-slate-500">Automated risk-based follow-up dispatch & telephony status</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-mono font-extrabold text-xs rounded-full border border-emerald-300">
            {outreachSummary?.total_contacted_today || 42} Contacts Dispatched Today
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Urgent Calls Card */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-red-700">
              <span className="text-xs font-extrabold uppercase">Urgent Calls</span>
              <PhoneCall className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black font-mono text-slate-900">{outreachSummary?.urgent_calls_count || data.kpis.high_risk}</p>
            <p className="text-[11px] text-slate-600">High-risk patients requiring staff call</p>
          </div>

          {/* Reminders Ready Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-extrabold uppercase">Reminders Ready</span>
              <Send className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black font-mono text-slate-900">{outreachSummary?.reminders_ready_count || data.kpis.low_risk}</p>
            <p className="text-[11px] text-slate-600">Low-risk patients with upcoming visits</p>
          </div>

          {/* Awaiting Response Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-extrabold uppercase">Awaiting Response</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black font-mono text-slate-900">{outreachSummary?.awaiting_response_count || 18}</p>
            <p className="text-[11px] text-slate-600">Pending appointment confirmation</p>
          </div>

          {/* Failed Outreach Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-extrabold uppercase">Failed Outreach</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black font-mono text-slate-900">{outreachSummary?.failed_outreach_count || 2}</p>
            <p className="text-[11px] text-slate-600">Escalated to care coordinator</p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Patients"
          value={data.kpis.total_patients}
          subtitle="Monitored in registry"
          icon={Users}
          color="emerald"
        />
        <KpiCard
          title="High Risk"
          value={data.kpis.high_risk}
          subtitle="Needs urgent outreach"
          icon={AlertCircle}
          color="red"
        />
        <KpiCard
          title="Medium Risk"
          value={data.kpis.medium_risk}
          subtitle="Moderate follow-up risk"
          icon={AlertTriangle}
          color="amber"
        />
        <KpiCard
          title="Low Risk"
          value={data.kpis.low_risk}
          subtitle="Stable attendance"
          icon={CheckCircle2}
          color="emerald"
        />
        <KpiCard
          title="Upcoming Visits"
          value={data.kpis.upcoming_followups}
          subtitle="Scheduled next 14 days"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Staff Outreach Capacity Widget */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Staff Daily Outreach Capacity</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {data.staff_capacity.assigned} assigned out of {data.staff_capacity.daily_capacity} daily limit ({data.staff_capacity.remaining} slots remaining)
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-48 h-3 bg-slate-100 rounded-full overflow-hidden border">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, data.staff_capacity.capacity_utilization)}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-900 font-mono">
            {data.staff_capacity.capacity_utilization}% Utilized
          </span>
        </div>
      </div>

      {/* Risk Queue Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Priority Risk Queue</h3>
            <p className="text-xs text-slate-500">Top patient follow-up priorities ranked by transparent risk score</p>
          </div>
          <button
            onClick={() => navigate('/risk-queue')}
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View Full Queue ({data.kpis.total_patients})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Missed Visits</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Top Factor</th>
                <th className="py-3 px-4">Next Follow-up</th>
                <th className="py-3 px-4 text-right">Smart Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.priority_queue.slice(0, 7).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-900 block">{item.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.patient_id} • {item.department}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={item.risk_level} score={item.risk_score} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={item.missed_appointments >= 3 ? 'text-red-600 font-bold' : 'text-slate-700'}>
                      {item.missed_appointments}
                    </span> / {item.total_appointments} appts
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-mono">{item.distance_km} km</td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">{item.top_factor}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-mono">{item.next_followup_date}</td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {item.risk_level === 'HIGH' && (
                      <button
                        onClick={() => {
                          setSelectedCallPatient(item);
                          setShowCallModal(true);
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-xs transition-colors shadow-2xs inline-flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call Now</span>
                      </button>
                    )}

                    {item.risk_level === 'MEDIUM' && (
                      <button
                        onClick={() => navigate('/risk-queue')}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-lg text-xs transition-colors shadow-2xs inline-flex items-center gap-1"
                      >
                        <Users className="w-3 h-3" />
                        <span>Follow Up</span>
                      </button>
                    )}

                    {item.risk_level === 'LOW' && (
                      <button
                        onClick={() => {
                          setSelectedReminderPatient(item);
                          setShowReminderModal(true);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs transition-colors shadow-2xs inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Reminder</span>
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/patients/${item.patient_id}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <HighRiskCallModal
        patient={selectedCallPatient}
        isOpen={showCallModal}
        onClose={() => {
          setShowCallModal(false);
          setSelectedCallPatient(null);
        }}
        onSuccess={fetchDashboard}
      />

      <SendReminderModal
        patient={selectedReminderPatient}
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setSelectedReminderPatient(null);
        }}
        onSuccess={fetchDashboard}
      />

      <HealthcareDisclaimer />
    </div>
  );
};
