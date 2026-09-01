import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CalendarEventItem } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Filter,
  Plus
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.getCalendar();
      setEvents(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true;
    if (filterType === 'high_risk') return e.risk_level === 'HIGH';
    if (filterType === 'missed') return e.type === 'missed_followup';
    if (filterType === 'intervention') return e.type === 'intervention_due';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Follow-up Calendar</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Schedule, monitor, and coordinate upcoming follow-ups and staff intervention tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200 text-xs font-bold text-slate-700">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg transition-all ${viewMode === 'day' ? 'bg-white text-emerald-800 shadow-xs' : ''}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition-all ${viewMode === 'week' ? 'bg-white text-emerald-800 shadow-xs' : ''}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-emerald-800 shadow-xs' : ''}`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Events:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterType === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setFilterType('high_risk')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterType === 'high_risk' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'}`}
          >
            High Risk Follow-ups
          </button>
          <button
            onClick={() => setFilterType('missed')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterType === 'missed' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'}`}
          >
            Missed Follow-ups
          </button>
          <button
            onClick={() => setFilterType('intervention')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterType === 'intervention' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}
          >
            Interventions Due
          </button>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Showing {filteredEvents.length} items
        </span>
      </div>

      {/* Calendar Event Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading calendar schedule...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                evt.risk_level === 'HIGH' ? 'bg-red-50/40 border-red-200' :
                evt.type === 'missed_followup' ? 'bg-amber-50/40 border-amber-200' :
                'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-slate-400">{evt.date}</span>
                <RiskBadge level={(evt.risk_level as any) || 'LOW'} score={evt.risk_score} size="sm" />
              </div>

              <h4 className="font-extrabold text-slate-900 text-sm mb-1">{evt.title}</h4>
              <p className="text-xs text-slate-600 font-medium mb-3">{evt.details}</p>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>{evt.patient_id_code} • {evt.department}</span>
                <span className="text-emerald-700 font-semibold uppercase">{evt.type.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <HealthcareDisclaimer />
    </div>
  );
};
