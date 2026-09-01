import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ModelPerformanceResponse } from '../types';
import { KpiCard } from '../components/KpiCard';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import {
  Cpu,
  Brain,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Award,
  ShieldCheck,
  Scale
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

export const ModelMonitoringPage: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelMonitoring();
  }, []);

  const fetchModelMonitoring = async () => {
    try {
      setLoading(true);
      const res = await api.getModelMonitoring();
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
        <p className="text-xs font-semibold">Evaluating model monitoring & cohort fairness metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Model Intelligence & Monitoring</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Active prediction engine registry, evaluation metrics (ROC AUC, Precision, Recall), baseline comparison, and cohort fairness monitoring.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
          Active: {data.active_model_version}
        </span>
      </div>

      {/* KPI Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Accuracy Score"
          value={`${(data.accuracy * 100).toFixed(1)}%`}
          subtitle="Correct risk classifications"
          icon={Award}
          color="emerald"
        />
        <KpiCard
          title="ROC AUC"
          value={data.auc.toFixed(3)}
          subtitle="Area under ROC curve"
          icon={TrendingUp}
          color="emerald"
        />
        <KpiCard
          title="Precision"
          value={`${(data.precision * 100).toFixed(1)}%`}
          subtitle="True positive precision"
          icon={CheckCircle2}
          color="purple"
        />
        <KpiCard
          title="Recall (Sensitivity)"
          value={`${(data.recall * 100).toFixed(1)}%`}
          subtitle="High risk capture rate"
          icon={Activity}
          color="blue"
        />
        <KpiCard
          title="Evaluated Predictions"
          value={data.total_predictions}
          subtitle="Historical inferences"
          icon={Brain}
          color="emerald"
        />
      </div>

      {/* Active Engine vs Candidate Model Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Active Production Engine</h3>
              <p className="text-xs text-slate-500">{data.active_model_name}</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
              Active Engine
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-600">Engine Type</span>
              <span className="font-bold text-slate-900">{data.engine_type}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-600">Explainability Rationale</span>
              <span className="font-bold text-emerald-800">100% Deterministic Rule Breakdown</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-600">Training Records Foundation</span>
              <span className="font-bold text-slate-900">{data.training_records} patient cohort rows</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Candidate Model Baseline</h3>
              <p className="text-xs text-slate-500">Future Logistic Regression Model</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-lg">
              Candidate Model
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-600">Candidate Accuracy</span>
              <span className="font-mono font-bold text-slate-900">90.2%</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-600">Candidate ROC AUC</span>
              <span className="font-mono font-bold text-slate-900">0.934</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-600">Status</span>
              <span className="font-bold text-amber-700">Accumulating Care Continuity Dataset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Fairness & Subgroup Monitoring */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">Cohort Fairness & Disparity Monitoring</h3>
            </div>
            <p className="text-xs text-slate-500">Monitor risk scoring behavior across age groups, travel distance bands, and departments</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg">
            For Investigation Only
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.fairness_cohorts} margin={{ bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="cohort_name" tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
              <Tooltip />
              <Bar dataKey="high_risk_rate" name="High Risk Rate %" fill="#16A34A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <HealthcareDisclaimer />
    </div>
  );
};
