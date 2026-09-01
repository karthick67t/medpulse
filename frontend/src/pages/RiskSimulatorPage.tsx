import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Prediction } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import { SlidersHorizontal, RefreshCw, Lightbulb, CheckCircle2, Info } from 'lucide-react';

export const RiskSimulatorPage: React.FC = () => {
  const [age, setAge] = useState<number>(68);
  const [gender, setGender] = useState<string>('Female');
  const [distanceKm, setDistanceKm] = useState<number>(28.5);
  const [treatmentDurationMonths, setTreatmentDurationMonths] = useState<number>(18);
  const [appointmentFrequencyWeeks, setAppointmentFrequencyWeeks] = useState<number>(2);
  const [totalAppointments, setTotalAppointments] = useState<number>(10);
  const [missedAppointments, setMissedAppointments] = useState<number>(4);
  const [daysSinceLastVisit, setDaysSinceLastVisit] = useState<number>(35);

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    runSimulation();
  }, [age, gender, distanceKm, treatmentDurationMonths, appointmentFrequencyWeeks, totalAppointments, missedAppointments, daysSinceLastVisit]);

  const runSimulation = async () => {
    try {
      setLoading(true);
      const res = await api.predict({
        age,
        gender,
        distance_km: distanceKm,
        treatment_duration_months: treatmentDurationMonths,
        appointment_frequency_weeks: appointmentFrequencyWeeks,
        total_appointments: totalAppointments,
        missed_appointments: missedAppointments,
        days_since_last_visit: daysSinceLastVisit,
      });
      setPrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interactive Risk Simulator</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Adjust patient parameters in real-time to observe how individual factors change the calculated risk score and explanation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Simulated Patient Parameters</h3>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Patient Age</span>
              <span className="font-mono text-emerald-800">{age} years</span>
            </div>
            <input
              type="range"
              min={18}
              max={95}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Travel Distance</span>
              <span className="font-mono text-emerald-800">{distanceKm} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              step={0.5}
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Treatment Duration</span>
              <span className="font-mono text-emerald-800">{treatmentDurationMonths} months</span>
            </div>
            <input
              type="range"
              min={1}
              max={48}
              value={treatmentDurationMonths}
              onChange={(e) => setTreatmentDurationMonths(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Missed Appointments</span>
              <span className="font-mono text-red-600">{missedAppointments} / {totalAppointments} visits</span>
            </div>
            <input
              type="range"
              min={0}
              max={totalAppointments}
              value={missedAppointments}
              onChange={(e) => setMissedAppointments(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Days Since Last Visit</span>
              <span className="font-mono text-emerald-800">{daysSinceLastVisit} days</span>
            </div>
            <input
              type="range"
              min={1}
              max={90}
              value={daysSinceLastVisit}
              onChange={(e) => setDaysSinceLastVisit(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Live Simulation Output */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Live Simulation Output</h3>
            {loading && <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />}
          </div>

          {prediction && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Calculated Risk Score</p>
                  <p className="text-3xl font-black text-slate-900 font-mono mt-1">{prediction.risk_score}<span className="text-xs text-slate-400 font-normal">/100</span></p>
                </div>
                <RiskBadge level={prediction.risk_level} score={prediction.risk_score} size="lg" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Calculated Factor Breakdown:</h4>
                <div className="space-y-2">
                  {(prediction.risk_factors || []).map((f, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{f.factor}</p>
                        <p className="text-[11px] text-slate-500">{f.description}</p>
                      </div>
                      <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded shrink-0">
                        +{f.impact_points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-900 text-white rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Recommended Operational Action</p>
                <p className="text-xs font-semibold leading-relaxed">{prediction.recommended_action}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <HealthcareDisclaimer />
    </div>
  );
};
