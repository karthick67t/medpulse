import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Edit,
  User,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Globe2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  FileText,
  X
} from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  initialPatient?: any;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  initialPatient
}) => {
  const { addToast } = useAuth();
  const navigate = useNavigate();

  // Form Section State
  const [formData, setFormData] = useState({
    // Section 1: Patient Information
    patient_id: `P${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    age: 55,
    department: 'Cardiology',

    // Section 2: Follow-up Information
    total_appointments: 6,
    attended_appointments: 4,
    missed_appointments: 2,
    distance_km: 18.5,
    treatment_duration_months: 12,
    appointment_frequency_days: 14,

    // Section 3: Next Follow-up
    appointment_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointment_time: '10:00',

    // Section 4: Communication Preferences
    phone_number: '+1 (555) 234-5678',
    email: '',
    whatsapp_number: '',
    preferred_language: 'English',
    preferred_contact_method: 'Phone'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  useEffect(() => {
    if (initialPatient && mode === 'edit') {
      const pCode = initialPatient.patient_id_code || initialPatient.patient_id || '';
      const pPhone = initialPatient.phone || initialPatient.phone_number || '+1 (555) 000-0000';
      const pMissed = initialPatient.missed_appointments ?? 2;
      const pTotal = initialPatient.total_appointments ?? 6;
      const pAttended = Math.max(0, pTotal - pMissed);
      const pFreqDays = (initialPatient.appointment_frequency_weeks || 2) * 7;

      setFormData({
        patient_id: pCode,
        name: initialPatient.name || '',
        age: initialPatient.age || 55,
        department: initialPatient.department || 'Cardiology',
        total_appointments: pTotal,
        attended_appointments: pAttended,
        missed_appointments: pMissed,
        distance_km: initialPatient.distance_km || 10.0,
        treatment_duration_months: initialPatient.treatment_duration_months || 12,
        appointment_frequency_days: pFreqDays,
        appointment_date: initialPatient.next_followup_date?.slice(0, 10) || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        appointment_time: '10:00',
        phone_number: pPhone,
        email: initialPatient.email || `${pCode.toLowerCase()}@medpulse.ai`,
        whatsapp_number: initialPatient.whatsapp_number || pPhone,
        preferred_language: initialPatient.preferred_language || 'English',
        preferred_contact_method: initialPatient.preferred_contact_method || 'Phone'
      });
    } else if (mode === 'create') {
      setFormData({
        patient_id: `P${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        age: 55,
        department: 'Cardiology',
        total_appointments: 6,
        attended_appointments: 4,
        missed_appointments: 2,
        distance_km: 18.5,
        treatment_duration_months: 12,
        appointment_frequency_days: 14,
        appointment_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        appointment_time: '10:00',
        phone_number: '+1 (555) 234-5678',
        email: '',
        whatsapp_number: '',
        preferred_language: 'English',
        preferred_contact_method: 'Phone'
      });
    }
    setSuccessResult(null);
    setErrorMsg('');
  }, [initialPatient, mode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const validateForm = (): boolean => {
    if (!formData.patient_id.trim()) {
      setErrorMsg('Patient ID is required.');
      return false;
    }
    if (!formData.name.trim()) {
      setErrorMsg('Full Name cannot be empty.');
      return false;
    }
    if (formData.age < 0 || formData.age > 120) {
      setErrorMsg('Age must be between 0 and 120.');
      return false;
    }
    if (formData.attended_appointments < 0 || formData.missed_appointments < 0 || formData.total_appointments < 0) {
      setErrorMsg('Appointment counts cannot be negative.');
      return false;
    }
    if (formData.attended_appointments + formData.missed_appointments > formData.total_appointments) {
      setErrorMsg('Attended plus missed appointments cannot exceed total appointments.');
      return false;
    }
    if (formData.distance_km < 0) {
      setErrorMsg('Distance from hospital cannot be negative.');
      return false;
    }
    if (formData.treatment_duration_months < 0) {
      setErrorMsg('Treatment duration cannot be negative.');
      return false;
    }
    if (formData.appointment_frequency_days <= 0) {
      setErrorMsg('Appointment frequency must be greater than zero days.');
      return false;
    }
    if (!formData.phone_number.trim()) {
      setErrorMsg('Phone number is required for follow-up outreach.');
      return false;
    }
    if (!formData.appointment_date) {
      setErrorMsg('Follow-up date is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      let result;
      if (mode === 'edit') {
        result = await api.updatePatient(formData.patient_id, formData);
        addToast('Patient information updated. Risk prediction refreshed.', 'success');
      } else {
        result = await api.createPatient(formData);
        addToast('Patient added successfully. Risk prediction generated.', 'success');
      }

      setSuccessResult(result);
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to save patient record in MySQL database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
              {mode === 'edit' ? <Edit className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {mode === 'edit' ? `Edit Patient Information (${formData.patient_id})` : 'Add New Patient'}
              </h3>
              <p className="text-xs text-emerald-200">MySQL Registry Synchronization & Transparent Risk Scoring</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {successResult ? (
            /* SUCCESS RESULT SCREEN WITH AUTOMATED RISK CALCULATION */
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-xl text-emerald-950">
                  {mode === 'edit' ? 'Patient Updated Successfully!' : 'Patient Registered Successfully!'}
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Patient <strong className="text-emerald-950">{successResult.name}</strong> ({successResult.patient_id}) has been saved in MySQL and evaluated by the Transparent Risk Engine.
                </p>
              </div>

              {/* Instant Calculated Risk Output Card (Green and White Theme) */}
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 space-y-4 shadow-md text-slate-900">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                      Automated Risk Engine Output
                    </span>
                    <h4 className="text-lg font-black text-slate-900">{successResult.name}</h4>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 ${
                      successResult.risk_level === 'HIGH'
                        ? 'bg-red-600 text-white'
                        : successResult.risk_level === 'MEDIUM'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>
                      {successResult.risk_score}/100 ({successResult.risk_level})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Top Risk Driver</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">{successResult.top_factor}</span>
                  </div>
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Recommended Outreach</span>
                    <span className="font-extrabold text-emerald-900 block mt-0.5">{successResult.recommended_action}</span>
                  </div>
                </div>

                {/* Risk Factors Explanation List */}
                <div className="space-y-2 pt-2 border-t border-emerald-100">
                  <span className="text-xs font-bold text-slate-700 block">Transparent Factor Explanation:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {successResult.risk_factors.map((factor: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-semibold">{factor.description}</span>
                        <span className="font-mono font-bold text-red-600 shrink-0 ml-2">+{factor.impact_points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Back to Patients List
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    navigate(`/patients/${successResult.patient_id}`);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View Patient Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* MULTI-SECTION PATIENT FORM (RESPONSIVE) */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: Patient Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>1. Patient Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Patient ID *</label>
                    <input
                      type="text"
                      required
                      disabled={mode === 'edit'}
                      value={formData.patient_id}
                      onChange={(e) => handleChange('patient_id', e.target.value)}
                      className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 ${
                        mode === 'edit' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={120}
                      value={formData.age}
                      onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="ENT">ENT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Follow-up Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>2. Follow-up History & Parameters</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Appointments *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.total_appointments}
                      onChange={(e) => handleChange('total_appointments', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Attended Appointments *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.attended_appointments}
                      onChange={(e) => handleChange('attended_appointments', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Missed Appointments *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.missed_appointments}
                      onChange={(e) => handleChange('missed_appointments', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 text-red-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Distance (km) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min={0}
                      value={formData.distance_km}
                      onChange={(e) => handleChange('distance_km', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Treatment Duration (months) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.treatment_duration_months}
                      onChange={(e) => handleChange('treatment_duration_months', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Appt Frequency (days) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.appointment_frequency_days}
                      onChange={(e) => handleChange('appointment_frequency_days', parseInt(e.target.value) || 14)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Next Follow-up */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>3. Next Follow-up Schedule</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Follow-up Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.appointment_date}
                      onChange={(e) => handleChange('appointment_date', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Follow-up Time *</label>
                    <input
                      type="time"
                      required
                      value={formData.appointment_time}
                      onChange={(e) => handleChange('appointment_time', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Communication Preferences */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>4. Communication Preferences</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone_number}
                      onChange={(e) => handleChange('phone_number', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="patient@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.whatsapp_number}
                      onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Preferred Language *</label>
                    <select
                      value={formData.preferred_language}
                      onChange={(e) => handleChange('preferred_language', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Kannada">Kannada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Method *</label>
                    <select
                      value={formData.preferred_contact_method}
                      onChange={(e) => handleChange('preferred_contact_method', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="Phone">Phone</option>
                      <option value="SMS">SMS</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {submitting
                      ? 'Saving to MySQL...'
                      : mode === 'edit'
                      ? 'Save Changes & Refresh Risk'
                      : 'Add Patient & Calculate Risk'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
