import axios from 'axios';
import {
  User,
  DashboardData,
  PatientListItem,
  PatientDetail,
  Prediction,
  Intervention,
  CareContinuityResponse,
  CalendarEventItem,
  DataQualityMetrics,
  CSVImportResponse,
  ModelPerformanceResponse,
  SystemSettings,
  OutreachLog,
  SmartOutreachSummary
} from '../types';

const API_BASE ='https://medpulse-api-uk68.onrender.com/api/v1';;

const httpClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    const res = await httpClient.post<User>('/auth/login', { email, password });
    return res.data;
  },

  signup: async (name: string, email: string, password: string, role: string = 'Nurse'): Promise<User> => {
    const res = await httpClient.post<User>('/auth/signup', { name, email, password, role });
    return res.data;
  },

  // Dashboard
  getDashboard: async (): Promise<DashboardData> => {
    const res = await httpClient.get<DashboardData>('/dashboard');
    return res.data;
  },

  // Priority Queue
  getRiskQueue: async (limit: number = 100) => {
    const res = await httpClient.get<PatientListItem[]>(`/risk-queue?limit=${limit}`);
    return res.data;
  },

  // Patients
  createPatient: async (payload: {
    patient_id: string;
    name: string;
    age: number;
    department: string;
    total_appointments: number;
    attended_appointments: number;
    missed_appointments: number;
    distance_km: number;
    treatment_duration_months: number;
    appointment_frequency_days: number;
    appointment_date: string;
    appointment_time: string;
    phone_number: string;
    email?: string;
    whatsapp_number?: string;
    preferred_language?: string;
    preferred_contact_method?: string;
  }) => {
    const res = await httpClient.post('/patients', payload);
    return res.data;
  },

  updatePatient: async (idCode: string, payload: any) => {
    const res = await httpClient.put(`/patients/${idCode}`, payload);
    return res.data;
  },

  getPatients: async (params?: { search?: string; department?: string; risk_level?: string; sort_by?: string; order?: string; limit?: number }) => {
    const res = await httpClient.get<PatientListItem[]>('/patients', { params });
    const data = res.data.map(p => ({
      ...p,
      patient_id: p.patient_id_code,
      attendance_rate: roundRate(p.total_appointments, p.missed_appointments),
      treatment_duration_months: 12,
      top_3_reasons: [p.top_factor || 'Missed visit history', 'Travel distance']
    }));
    return data;
  },

  getPatientDetail: async (idCode: string): Promise<PatientDetail> => {
    const res = await httpClient.get<PatientDetail>(`/patients/${idCode}`);
    const data = res.data;
    data.risk_factors = (data.risk_factors || []).map(f => ({
      ...f,
      factor_name: f.factor,
      impact_score: f.impact_points,
      reason: f.description
    }));
    return data;
  },

  overridePatientPriority: async (idCode: string, priorityOverride: string, overrideReason: string): Promise<PatientDetail> => {
    const res = await httpClient.post<PatientDetail>(`/patients/${idCode}/override`, {
      priority_override: priorityOverride,
      override_reason: overrideReason
    });
    return res.data;
  },

  // Smart Outreach API
  getOutreachSummary: async (): Promise<SmartOutreachSummary> => {
    const res = await httpClient.get<SmartOutreachSummary>('/outreach/summary');
    return res.data;
  },

  initiatePhoneOutreach: async (patientId: string): Promise<OutreachLog> => {
    const res = await httpClient.post<OutreachLog>(`/outreach/${patientId}/phone`);
    return res.data;
  },

  initiateSmsOutreach: async (patientId: string, customMessage?: string): Promise<OutreachLog> => {
    const res = await httpClient.post<OutreachLog>(`/outreach/${patientId}/sms`, { custom_message: customMessage });
    return res.data;
  },

  initiateWhatsappOutreach: async (patientId: string, customMessage?: string): Promise<OutreachLog> => {
    const res = await httpClient.post<OutreachLog>(`/outreach/${patientId}/whatsapp`, { custom_message: customMessage });
    return res.data;
  },

  initiateEmailOutreach: async (patientId: string, customMessage?: string): Promise<OutreachLog> => {
    const res = await httpClient.post<OutreachLog>(`/outreach/${patientId}/email`, { custom_message: customMessage });
    return res.data;
  },

  initiateHighRiskCall: async (patientId: string): Promise<OutreachLog> => {
    const res = await httpClient.post<OutreachLog>(`/outreach/high-risk/${patientId}/call`);
    return res.data;
  },

  sendHighRiskEmailAlert: async (patientId: string, customMessage?: string): Promise<OutreachLog> => {
    const res = await httpClient.post<OutreachLog>(`/outreach/high-risk/${patientId}/alert-email`, { custom_message: customMessage });
    return res.data;
  },

  sendAppointmentReminder: async (patientId: string, language: string = 'english', channel: string = 'SMS'): Promise<OutreachLog> => {
    const res = await httpClient.post<OutreachLog>(`/outreach/reminder/${patientId}`, {
      language,
      channel
    });
    return res.data;
  },

  getOutreachLogs: async (limit: number = 50): Promise<OutreachLog[]> => {
    const res = await httpClient.get<OutreachLog[]>(`/outreach?limit=${limit}`);
    return res.data;
  },

  getPatientOutreach: async (patientId: string): Promise<OutreachLog[]> => {
    const res = await httpClient.get<OutreachLog[]>(`/outreach/${patientId}`);
    return res.data;
  },

  recordCallOutcome: async (outreachId: number, outcome: string, notes?: string): Promise<OutreachLog> => {
    const res = await httpClient.post<OutreachLog>(`/outreach/${outreachId}/outcome`, {
      outcome,
      notes
    });
    return res.data;
  },

  // Risk Simulator / Predict
  predict: async (data: {
    age: number;
    gender: string;
    distance_km: number;
    treatment_duration_months: number;
    appointment_frequency_weeks?: number;
    appointment_frequency_days?: number;
    total_appointments: number;
    missed_appointments: number;
    days_since_last_visit: number;
    attended_appointments?: number;
  }): Promise<Prediction> => {
    const freq = data.appointment_frequency_weeks || Math.max(1, Math.round((data.appointment_frequency_days || 14) / 7));
    const payload = {
      age: data.age,
      gender: data.gender,
      distance_km: data.distance_km,
      treatment_duration_months: data.treatment_duration_months,
      appointment_frequency_weeks: freq,
      total_appointments: data.total_appointments,
      missed_appointments: data.missed_appointments,
      days_since_last_visit: data.days_since_last_visit
    };
    const res = await httpClient.post<Prediction>('/predict', payload);
    const result = res.data;
    result.risk_factors = (result.risk_factors || []).map(f => ({
      ...f,
      factor_name: f.factor,
      impact_score: f.impact_points,
      reason: f.description
    }));
    result.factors_detail = result.risk_factors;
    result.recommended_actions = [result.recommended_action];
    return result;
  },

  calculateRisk: async (data: any): Promise<Prediction> => {
    return api.predict(data);
  },

  // Analytics
  getAnalytics: async () => {
    const res = await httpClient.get('/analytics');
    return res.data;
  },

  // Interventions
  getInterventions: async (): Promise<Intervention[]> => {
    const res = await httpClient.get<Intervention[]>('/interventions');
    return res.data;
  },

  createIntervention: async (data: { patient_id: number; intervention_type: string; assigned_to?: string; priority?: string; due_date?: string; notes?: string }) => {
    const payload = {
      assigned_to: 'Nurse Robert Chen',
      ...data
    };
    const res = await httpClient.post<Intervention>('/interventions', payload);
    return res.data;
  },

  updateIntervention: async (id: number, data: { status?: string; outcome?: string; notes?: string }) => {
    const res = await httpClient.put<Intervention>(`/interventions/${id}`, data);
    return res.data;
  },

  // Care Continuity
  getCareContinuity: async (): Promise<CareContinuityResponse> => {
    const res = await httpClient.get<CareContinuityResponse>('/continuity');
    return res.data;
  },

  // Calendar
  getCalendar: async (): Promise<CalendarEventItem[]> => {
    const res = await httpClient.get<CalendarEventItem[]>('/calendar');
    return res.data;
  },

  // Data Quality
  getDataQuality: async (): Promise<DataQualityMetrics> => {
    const res = await httpClient.get<DataQualityMetrics>('/data-quality');
    return res.data;
  },

  importCsv: async (file: File): Promise<CSVImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post<CSVImportResponse>(`${API_BASE}/data-quality/import-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Model Monitoring
  getModelMonitoring: async (): Promise<ModelPerformanceResponse> => {
    const res = await httpClient.get<ModelPerformanceResponse>('/model-monitoring');
    return res.data;
  },

  // Settings
  getSettings: async (): Promise<SystemSettings> => {
    const res = await httpClient.get<SystemSettings>('/settings');
    const data = res.data;
    data.low_threshold = 40;
    data.medium_threshold = data.medium_risk_threshold || 65;
    data.high_threshold = data.high_risk_threshold || 80;
    data.daily_intervention_capacity = data.daily_outreach_capacity || 50;
    return data;
  },

  updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const res = await httpClient.put<SystemSettings>('/settings', settings);
    const data = res.data;
    data.low_threshold = 40;
    data.medium_threshold = data.medium_risk_threshold || 65;
    data.high_threshold = data.high_risk_threshold || 80;
    data.daily_intervention_capacity = data.daily_outreach_capacity || 50;
    return data;
  },

  // Reset Demo State
  resetDemoData: async () => {
    const res = await httpClient.post('/settings/reset-demo');
    return res.data;
  }
};

function roundRate(total: number, missed: number): number {
  if (!total || total === 0) return 100;
  const attended = max0(total - missed);
  return Math.round((attended / total) * 100);
}

function max0(n: number): number {
  return n < 0 ? 0 : n;
}
