import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { SystemSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import { Settings, Save, RotateCcw, Building2, Sliders, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    hospital_name: 'City General Hospital',
    high_risk_threshold: 65,
    medium_risk_threshold: 40,
    low_threshold: 40,
    medium_threshold: 65,
    high_threshold: 80,
    daily_outreach_capacity: 50,
    daily_intervention_capacity: 50,
    auto_escalation: true,
    sms_notifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      setSettings(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings(settings);
      addToast('Hospital settings saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Reset synthetic dataset and demo state back to factory defaults?')) {
      try {
        await api.resetDemoData();
        addToast('Reset demo state successfully!', 'success');
        window.location.reload();
      } catch (err) {
        addToast('Failed to reset demo data.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital Settings</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Configure risk thresholds, outreach capacity limits, and operational parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Hospital Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" /> Hospital Identity
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Facility Name</label>
            <input
              type="text"
              value={settings.hospital_name}
              onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
            />
          </div>
        </div>

        {/* Risk Thresholds */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" /> Prediction Risk Thresholds
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medium Risk Threshold (score &gt;=)</label>
              <input
                type="number"
                value={settings.medium_risk_threshold}
                onChange={(e) => setSettings({ ...settings, medium_risk_threshold: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">High Risk Threshold (score &gt;=)</label>
              <input
                type="number"
                value={settings.high_risk_threshold}
                onChange={(e) => setSettings({ ...settings, high_risk_threshold: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Outreach Capacity */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" /> Operational Capacity
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Daily Staff Outreach Capacity Limit</label>
            <input
              type="number"
              value={settings.daily_outreach_capacity}
              onChange={(e) => setSettings({ ...settings, daily_outreach_capacity: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetDemo}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      <HealthcareDisclaimer />
    </div>
  );
};
