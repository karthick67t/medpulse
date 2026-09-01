import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CareContinuityResponse } from '../types';
import { KpiCard } from '../components/KpiCard';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import {
  RefreshCw,
  Brain,
  Info,
  ListOrdered,
  PhoneCall,
  Activity,
  TrendingUp,
  CheckCircle2,
  Database,
  Award
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const CareContinuityPage: React.FC = () => {
  const [data, setData] = useState<CareContinuityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContinuity();
  }, []);

  const fetchContinuity = async () => {
    try {
      setLoading(true);
      const res = await api.getCareContinuity();
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
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Tracing Care Continuity Loop metrics...</p>
      </div>
    );
  }

  const stageIcons: Record<string, any> = {
    Predict: Brain,
    Explain: Info,
    Prioritize: ListOrdered,
    Intervene: PhoneCall,
    Track: Activity,
    Learn: TrendingUp
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin-slow" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Care Continuity Loop</h1>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-1">
          A closed-loop system connecting prediction, explanation, prioritization, intervention, outcome tracking, and continuous learning.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="High-Risk Predicted"
          value={data.metrics.high_risk_predicted}
          subtitle="Identified by engine"
          icon={Brain}
          color="red"
        />
        <KpiCard
          title="Patients Contacted"
          value={data.metrics.patients_contacted}
          subtitle="Outreach initiated"
          icon={PhoneCall}
          color="blue"
        />
        <KpiCard
          title="Interventions Done"
          value={data.metrics.interventions_completed}
          subtitle="Tasks completed"
          icon={CheckCircle2}
          color="emerald"
        />
        <KpiCard
          title="Visits Confirmed"
          value={data.metrics.appointments_confirmed}
          subtitle="Outcomes recorded"
          icon={Award}
          color="emerald"
        />
        <KpiCard
          title="Follow-up Success"
          value={`${data.metrics.followup_success_rate}%`}
          subtitle="Intervention outcome rate"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Circular 6-Stage Closed-Loop Visual */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">The 6 Stages of Care Continuity</h3>
            <p className="text-xs text-slate-500">From initial risk scoring to accumulated outcome learning</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
            Closed-Loop System Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.stages.map((stage, idx) => {
            const Icon = stageIcons[stage.name] || Brain;
            return (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <Icon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{stage.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{stage.description}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                    <span>Progress</span>
                    <span className="font-mono text-emerald-700">{stage.completion_rate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, stage.completion_rate)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outcome Distribution & Sustainability Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome Distribution Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Intervention Outcome Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Recorded results following staff follow-up outreach</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.outcome_distribution} margin={{ bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="outcome" tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Sustainability Metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Operational Resource Efficiency</h3>
          <p className="text-xs text-slate-500 mb-4">Measurable hospital follow-up operational metrics</p>
          <div className="space-y-3">
            {data.sustainability_metrics.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                </div>
                <span className="font-mono font-extrabold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Dataset for Future ML Model Training */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Historical Training Dataset (Future ML Ready)</h3>
            </div>
            <p className="text-xs text-slate-500">Accumulated intervention outcomes ready for future Logistic Regression / ML training</p>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">Dataset Size: {data.training_dataset_samples.length} rows</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Patient Code</th>
                <th className="py-3 px-4">Predicted Risk Score</th>
                <th className="py-3 px-4">Prediction Date</th>
                <th className="py-3 px-4">Intervention Type</th>
                <th className="py-3 px-4">Recorded Outcome</th>
                <th className="py-3 px-4">Actual Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium font-mono text-slate-700">
              {data.training_dataset_samples.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.patient_code}</td>
                  <td className="py-3 px-4">
                    <span className={row.predicted_risk_level === 'HIGH' ? 'text-red-600 font-bold' : ''}>
                      {row.predicted_risk_score} ({row.predicted_risk_level})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{row.prediction_date}</td>
                  <td className="py-3 px-4 font-sans text-slate-900">{row.intervention_type}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-emerald-800">{row.intervention_outcome}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.actual_attendance === 'Attended' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {row.actual_attendance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <HealthcareDisclaimer />
    </div>
  );
};
