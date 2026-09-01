import React from 'react';
import { Appointment } from '../types';
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';

interface AppointmentTimelineProps {
  appointments: Appointment[];
}

export const AppointmentTimeline: React.FC<AppointmentTimelineProps> = ({ appointments }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attended':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'missed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'attended':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Attended</span>;
      case 'missed':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-red-50 text-red-700 border border-red-200">Missed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-600 border border-slate-200">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">Upcoming</span>;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {appointments.map((appt, idx) => (
          <li key={appt.id || idx}>
            <div className="relative pb-8">
              {idx !== appointments.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative p-1 bg-white rounded-full border border-slate-200">
                  {getStatusIcon(appt.status)}
                </div>
                <div className="min-w-0 flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-800">{appt.appointment_date}</span>
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>
                  {appt.notes && (
                    <p className="text-xs text-slate-500 mt-1.5">{appt.notes}</p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
