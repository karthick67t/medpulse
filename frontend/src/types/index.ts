export type UserRole = 'Admin' | 'Doctor' | 'Nurse' | 'Reception';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface User {
  id: number;
  hospital_id: number;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface RiskFactor {
  factor: string;
  impact_points: number;
  severity: 'High' | 'Medium' | 'Low';
  value: any;
  description: string;
  factor_name?: string;
  impact_score?: number;
  reason?: string;
}

export interface Prediction {
  patient_id?: number;
  risk_score: number;
  risk_level: RiskLevel;
  previous_risk_score?: number;
  risk_change?: number;
  risk_factors: RiskFactor[];
  factors_detail?: RiskFactor[];
  recommended_action: string;
  recommended_actions?: string[];
  prediction_engine?: string;
  prediction_version?: string;
}

export type PredictResponse = Prediction;

export interface Appointment {
  id: number;
  appointment_date: string;
  status: 'Attended' | 'Missed' | 'Rescheduled' | 'Scheduled';
  notes?: string;
}

export interface PatientDetail {
  id: number;
  patient_id_code: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  department: string;
  distance_km: number;
  treatment_duration_months: number;
  appointment_frequency_weeks: number;
  current_risk_score: number;
  current_risk_level: RiskLevel;
  previous_risk_score: number;
  risk_change: number;
  priority_override?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | null;
  override_reason?: string | null;
  preferred_contact_method?: string;
  whatsapp_number?: string;
  last_contacted_at?: string;
  contact_attempt_count?: number;
  appointment_confirmed?: boolean;
  risk_factors: RiskFactor[];
  recommended_action: string;
  appointments: Appointment[];
}

export interface PatientListItem {
  id: number;
  patient_id: string;
  patient_id_code: string;
  name: string;
  age: number;
  department: string;
  risk_score: number;
  risk_level: RiskLevel;
  risk_change: number;
  priority_override?: string | null;
  missed_appointments: number;
  total_appointments: number;
  attendance_rate?: number;
  treatment_duration_months?: number;
  distance_km: number;
  next_followup_date: string;
  top_factor: string;
  top_3_reasons?: string[];
  recommended_action: string;
  preferred_contact_method?: string;
  outreach_status?: string;
}

export interface RiskWatchlistItem {
  patient_id: number;
  patient_code: string;
  name: string;
  department: string;
  current_risk: number;
  previous_risk: number;
  risk_change: number;
  risk_change_percentage: number;
  alert_type: string;
  main_reason: string;
}

export interface OutreachLog {
  id: number;
  hospital_id: number;
  patient_id: number;
  patient_code?: string;
  patient_name?: string;
  channel: string;
  message_type: string;
  status: string;
  attempted_at: string;
  delivered_at?: string;
  responded_at?: string;
  response?: string;
  created_by: string;
}

export interface SmartOutreachSummary {
  urgent_calls_count: number;
  reminders_ready_count: number;
  awaiting_response_count: number;
  failed_outreach_count: number;
  total_contacted_today: number;
}

export interface DashboardKPIs {
  total_patients: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  upcoming_followups: number;
}

export interface RiskDistribution {
  name: string;
  value: number;
}

export interface TopRiskFactor {
  factor: string;
  count: number;
  patient_count: number;
}

export interface RiskTrend {
  month: string;
  avg_risk: number;
}

export interface StaffCapacity {
  daily_capacity: number;
  assigned: number;
  completed: number;
  remaining: number;
  capacity_utilization: number;
}

export interface DepartmentMetric {
  department: string;
  patient_count: number;
  high_risk_percentage: number;
  medium_risk_percentage: number;
  missed_followups: number;
  completion_rate: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  risk_distribution: RiskDistribution[];
  top_risk_factors: TopRiskFactor[];
  risk_trend: RiskTrend[];
  priority_queue: PatientListItem[];
  watchlist: RiskWatchlistItem[];
  staff_capacity: StaffCapacity;
  departments: DepartmentMetric[];
  smart_outreach?: SmartOutreachSummary;
}

export interface Intervention {
  id: number;
  patient_id: number;
  patient_code: string;
  patient_name: string;
  patient_risk_level: RiskLevel;
  patient_risk_score: number;
  intervention_type: string;
  assigned_to: string;
  priority: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  outcome?: string;
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export interface CareStage {
  name: string;
  icon: string;
  description: string;
  completion_rate: number;
}

export interface CareContinuityMetrics {
  high_risk_predicted: number;
  patients_contacted: number;
  interventions_completed: number;
  appointments_confirmed: number;
  followup_success_rate: number;
}

export interface SustainabilityMetric {
  name: string;
  value: string;
  description: string;
}

export interface OutcomeDistribution {
  outcome: string;
  count: number;
}

export interface TrainingDatasetRow {
  patient_code: string;
  predicted_risk_score: number;
  predicted_risk_level: string;
  prediction_date: string;
  intervention_type: string;
  intervention_outcome: string;
  actual_attendance: string;
  days_to_followup: number;
}

export interface CareContinuityResponse {
  stages: CareStage[];
  metrics: CareContinuityMetrics;
  sustainability_metrics: SustainabilityMetric[];
  outcome_distribution: OutcomeDistribution[];
  training_dataset_samples: TrainingDatasetRow[];
}

export interface CalendarEventItem {
  id: number;
  type: string;
  title: string;
  patient_id_code: string;
  patient_name: string;
  date: string;
  risk_level: string;
  risk_score: number;
  department: string;
  details: string;
}

export interface MissingFieldSummary {
  field_name: string;
  missing_count: number;
  percentage: number;
}

export interface DataQualityMetrics {
  total_records: number;
  complete_records: number;
  completeness_percentage: number;
  missing_distance_count: number;
  missing_history_count: number;
  missing_treatment_count: number;
  missing_fields_summary: MissingFieldSummary[];
  reliability_status: string;
}

export interface CSVImportResponse {
  filename: string;
  records_processed: number;
  valid_records: number;
  invalid_records: number;
  completeness_score: number;
  sample_predictions: Prediction[];
}

export interface CohortFairness {
  cohort_type: string;
  cohort_name: string;
  patient_count: number;
  high_risk_rate: number;
  avg_risk_score: number;
}

export interface ModelPerformanceResponse {
  active_model_name: string;
  active_model_version: string;
  engine_type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc: number;
  total_predictions: number;
  training_records: number;
  future_model_comparison: Record<string, any>;
  fairness_cohorts: CohortFairness[];
}

export interface SystemSettings {
  hospital_name: string;
  high_risk_threshold: number;
  medium_risk_threshold: number;
  low_threshold?: number;
  medium_threshold?: number;
  high_threshold?: number;
  daily_outreach_capacity: number;
  daily_intervention_capacity?: number;
  auto_escalation: boolean;
  sms_notifications: boolean;
}
