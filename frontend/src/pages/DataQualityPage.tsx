import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { DataQualityMetrics, CSVImportResponse } from '../types';
import { KpiCard } from '../components/KpiCard';
import { RiskBadge } from '../components/RiskBadge';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import {
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ShieldAlert,
  ArrowRight,
  Database
} from 'lucide-react';

export const DataQualityPage: React.FC = () => {
  const [data, setData] = useState<DataQualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<CSVImportResponse | null>(null);

  useEffect(() => {
    fetchDataQuality();
  }, []);

  const fetchDataQuality = async () => {
    try {
      setLoading(true);
      const res = await api.getDataQuality();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.importCsv(file);
      setImportResult(res);
      fetchDataQuality();
    } catch (err) {
      alert('Failed to import CSV dataset file.');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Auditing dataset quality and completeness...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Data Quality & CSV Import</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Monitor hospital dataset completeness, missing fields, prediction reliability warnings, and import fresh CSV patient records.
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Dataset Records"
          value={data.total_records}
          subtitle="Hospital registry size"
          icon={Database}
          color="emerald"
        />
        <KpiCard
          title="Complete Records"
          value={data.complete_records}
          subtitle="Zero missing fields"
          icon={CheckCircle2}
          color="emerald"
        />
        <KpiCard
          title="Data Completeness"
          value={`${data.completeness_percentage}%`}
          subtitle="Required parameters present"
          icon={FileCheck2}
          color="purple"
        />
        <KpiCard
          title="Prediction Reliability"
          value={data.reliability_status}
          subtitle="High reliability score"
          icon={ShieldAlert}
          color={data.reliability_status === 'High' ? 'emerald' : 'amber'}
        />
      </div>

      {/* Main Grid: Upload & Missing Field Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Import Upload Workflow */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Import Patient CSV / XLSX Dataset</h3>
              <p className="text-xs text-slate-500">Upload CSV file to validate completeness and compute predictions</p>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          </div>

          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 rounded-2xl p-6 text-center cursor-pointer block transition-colors">
            <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">
              {uploading ? 'Processing & scoring dataset...' : 'Click to select or drag CSV / XLSX file'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Supports patient_id, age, distance_km, treatment_duration, missed_visits</p>
            <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>

          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span>File Processed: {importResult.filename}</span>
                <span className="font-mono text-emerald-700">{importResult.completeness_score}% Complete</span>
              </div>
              <p className="text-emerald-800 text-[11px]">
                Successfully evaluated {importResult.valid_records} valid patient rows out of {importResult.records_processed} total.
              </p>
            </div>
          )}
        </div>

        {/* Missing Field Analysis Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Missing Parameter Breakdown</h3>
          <p className="text-xs text-slate-500">Parameters required for prediction confidence scoring</p>

          <div className="space-y-3">
            {data.missing_fields_summary.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-mono">{item.field_name}</h4>
                  <p className="text-[11px] text-slate-500">{item.missing_count} records missing this parameter</p>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  item.percentage > 10 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {item.percentage}% missing
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HealthcareDisclaimer />
    </div>
  );
};
