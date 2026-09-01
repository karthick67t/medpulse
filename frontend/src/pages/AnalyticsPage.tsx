import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { KpiCard } from '../components/KpiCard';
import {
  Users,
  AlertTriangle,
  ClipboardCheck,
  CalendarX,
  BarChart3,
  PieChart as PieIcon
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
  ScatterChart,
  Scatter,
  CartesianGrid
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Aggregating hospital follow-up analytics...</p>
      </div>
    );
  }

  const COLORS = ['#DC2626', '#F59E0B', '#16A34A'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital Follow-up Analytics</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">Cross-sectional study and statistical breakdown of patient follow-up trends.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard title="Total Patients" value={data.kpis.total_patients} icon={Users} color="blue" />
        <KpiCard title="High Risk %" value={`${data.kpis.high_risk_pct}%`} icon={AlertTriangle} color="red" />
        <KpiCard title="Med Risk %" value={`${data.kpis.medium_risk_pct}%`} icon={AlertTriangle} color="amber" />
        <KpiCard title="Low Risk %" value={`${data.kpis.low_risk_pct}%`} icon={Users} color="emerald" />
        <KpiCard title="Missed Visits" value={data.kpis.missed_followups} icon={CalendarX} color="purple" />
        <KpiCard title="Outreach Done" value={data.kpis.interventions_completed} icon={ClipboardCheck} color="emerald" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Overall Risk Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Patient cohort risk breakdown</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.risk_distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.risk_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Risk Breakdown by Medical Department</h3>
          <p className="text-xs text-slate-500 mb-4">High vs Medium vs Low risk volume across clinical units</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.department_risk}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="high" fill="#DC2626" stackId="a" name="High Risk" />
                <Bar dataKey="medium" fill="#F59E0B" stackId="a" name="Medium Risk" />
                <Bar dataKey="low" fill="#16A34A" stackId="a" name="Low Risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scatter Plots Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distance vs Risk Scatter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Distance (km) vs Risk Score</h3>
          <p className="text-xs text-slate-500 mb-4">Geographic distance correlation with calculated follow-up risk</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="distance_km" name="Distance" unit="km" tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="risk_score" name="Risk Score" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Patients" data={data.distance_vs_risk} fill="#2563EB" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Frequency vs Risk Scatter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Appointment Frequency (Days) vs Risk Score</h3>
          <p className="text-xs text-slate-500 mb-4">Interval frequency between visits vs risk score</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="appointment_frequency_days" name="Frequency" unit=" days" tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="risk_score" name="Risk Score" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Patients" data={data.frequency_vs_risk} fill="#7C3AED" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
