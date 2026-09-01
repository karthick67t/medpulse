from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# Auth
class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Nurse"

class UserResponse(BaseModel):
    id: int
    hospital_id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Risk Factor
class RiskFactor(BaseModel):
    factor: str
    impact_points: int
    severity: str
    value: Any
    description: str

# Prediction
class PredictRequest(BaseModel):
    patient_id: Optional[int] = None
    age: int
    gender: str
    distance_km: float
    treatment_duration_months: int
    appointment_frequency_weeks: int
    total_appointments: int
    missed_appointments: int
    days_since_last_visit: int

class PredictionResponse(BaseModel):
    patient_id: Optional[int] = None
    risk_score: int
    risk_level: str
    previous_risk_score: Optional[int] = 0
    risk_change: Optional[int] = 0
    risk_factors: List[RiskFactor]
    recommended_action: str
    prediction_engine: str = "Transparent Weighted Rule Engine v2.0"
    prediction_version: str = "v2.0.0"

# Patient Creation Schemas
class PatientCreateRequest(BaseModel):
    patient_id: str
    name: str
    age: int
    department: str
    total_appointments: int
    attended_appointments: int
    missed_appointments: int
    distance_km: float
    treatment_duration_months: int
    appointment_frequency_days: int
    appointment_date: str
    appointment_time: str
    phone_number: str
    email: Optional[str] = None
    whatsapp_number: Optional[str] = None
    preferred_language: Optional[str] = "English"
    preferred_contact_method: Optional[str] = "Phone"

class PatientCreateSuccessResponse(BaseModel):
    id: int
    patient_id: str
    name: str
    age: int
    department: str
    phone_number: str
    next_followup_date: str
    risk_score: int
    risk_level: str
    top_factor: str
    risk_factors: List[RiskFactor]
    recommended_action: str
class AppointmentSchema(BaseModel):
    id: int
    appointment_date: datetime
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class PatientDetailResponse(BaseModel):
    id: int
    patient_id_code: str
    name: str
    age: int
    gender: str
    phone: str
    department: str
    distance_km: float
    treatment_duration_months: int
    appointment_frequency_weeks: int
    current_risk_score: int
    current_risk_level: str
    previous_risk_score: int
    risk_change: int
    priority_override: Optional[str] = None
    override_reason: Optional[str] = None
    preferred_contact_method: Optional[str] = "Phone"
    whatsapp_number: Optional[str] = None
    last_contacted_at: Optional[datetime] = None
    contact_attempt_count: Optional[int] = 0
    appointment_confirmed: Optional[bool] = False
    risk_factors: List[RiskFactor]
    recommended_action: str
    appointments: List[AppointmentSchema]

    class Config:
        from_attributes = True

class PatientListItem(BaseModel):
    id: int
    patient_id_code: str
    name: str
    age: int
    department: str
    risk_score: int
    risk_level: str
    risk_change: int
    priority_override: Optional[str] = None
    missed_appointments: int
    total_appointments: int
    distance_km: float
    next_followup_date: str
    top_factor: str
    recommended_action: str
    preferred_contact_method: Optional[str] = "Phone"
    outreach_status: Optional[str] = "Pending"

# Human Priority Override
class PriorityOverrideRequest(BaseModel):
    priority_override: str  # HIGH, MEDIUM, LOW, or NONE
    override_reason: str

# Outreach Schemas
class CallOutcomeRequest(BaseModel):
    outcome: str  # Appointment Confirmed, Appointment Rescheduled, Callback Requested, Patient Unreachable, Patient Declined, Other
    notes: Optional[str] = None

class ReminderSendRequest(BaseModel):
    language: str = "english"  # english, tamil, hindi
    channel: str = "SMS"  # SMS, WhatsApp, Email
    custom_message: Optional[str] = None

class OutreachLogResponse(BaseModel):
    id: int
    hospital_id: int
    patient_id: int
    patient_code: Optional[str] = None
    patient_name: Optional[str] = None
    channel: str
    message_type: str
    status: str
    attempted_at: datetime
    delivered_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    response: Optional[str] = None
    created_by: str

    class Config:
        from_attributes = True

class SmartOutreachSummary(BaseModel):
    urgent_calls_count: int
    reminders_ready_count: int
    awaiting_response_count: int
    failed_outreach_count: int
    total_contacted_today: int

# Priority Queue
class RiskQueueItem(BaseModel):
    id: int
    patient_id: str
    name: str
    age: int
    department: str
    risk_score: int
    risk_level: str
    previous_risk_score: int
    risk_change: int
    priority_override: Optional[str] = None
    missed_appointments: int
    total_appointments: int
    distance_km: float
    next_followup_date: str
    top_factor: str
    recommended_action: str
    preferred_contact_method: Optional[str] = "Phone"
    outreach_status: Optional[str] = "Pending"

# Watchlist Item (Early Warning System)
class RiskWatchlistItem(BaseModel):
    patient_id: int
    patient_code: str
    name: str
    department: str
    current_risk: int
    previous_risk: int
    risk_change: int
    risk_change_percentage: float
    alert_type: str
    main_reason: str

# Dashboard
class DashboardKPIs(BaseModel):
    total_patients: int
    high_risk: int
    medium_risk: int
    low_risk: int
    upcoming_followups: int

class RiskDistribution(BaseModel):
    name: str
    value: int

class TopRiskFactor(BaseModel):
    factor: str
    count: int
    patient_count: int

class RiskTrend(BaseModel):
    month: str
    avg_risk: float

class StaffCapacity(BaseModel):
    daily_capacity: int = 50
    assigned: int
    completed: int
    remaining: int
    capacity_utilization: float

class DepartmentMetric(BaseModel):
    department: str
    patient_count: int
    high_risk_percentage: float
    medium_risk_percentage: float
    missed_followups: int
    completion_rate: float

class DashboardResponse(BaseModel):
    kpis: DashboardKPIs
    risk_distribution: List[RiskDistribution]
    top_risk_factors: List[TopRiskFactor]
    risk_trend: List[RiskTrend]
    priority_queue: List[RiskQueueItem]
    watchlist: List[RiskWatchlistItem]
    staff_capacity: StaffCapacity
    departments: List[DepartmentMetric]
    smart_outreach: Optional[SmartOutreachSummary] = None

# Intervention
class InterventionCreate(BaseModel):
    patient_id: int
    intervention_type: str
    assigned_to: str
    priority: Optional[str] = "Medium"
    due_date: Optional[str] = None
    notes: Optional[str] = None

class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None

class InterventionResponse(BaseModel):
    id: int
    patient_id: int
    patient_code: str
    patient_name: str
    patient_risk_level: str
    patient_risk_score: int
    intervention_type: str
    assigned_to: str
    priority: str
    due_date: Optional[str] = None
    status: str
    outcome: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Calendar Event
class CalendarEventItem(BaseModel):
    id: int
    type: str
    title: str
    patient_id_code: str
    patient_name: str
    date: str
    risk_level: str
    risk_score: int
    department: str
    details: str

# Data Quality
class MissingFieldSummary(BaseModel):
    field_name: str
    missing_count: int
    percentage: float

class DataQualityMetrics(BaseModel):
    total_records: int
    complete_records: int
    completeness_percentage: float
    missing_distance_count: int
    missing_history_count: int
    missing_treatment_count: int
    missing_fields_summary: List[MissingFieldSummary]
    reliability_status: str

class CSVImportResponse(BaseModel):
    filename: str
    records_processed: int
    valid_records: int
    invalid_records: int
    completeness_score: float
    sample_predictions: List[PredictionResponse]

# Model Monitoring
class CohortFairness(BaseModel):
    cohort_type: str
    cohort_name: str
    patient_count: int
    high_risk_rate: float
    avg_risk_score: float

class ModelPerformanceResponse(BaseModel):
    active_model_name: str
    active_model_version: str
    engine_type: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc: float
    total_predictions: int
    training_records: int
    future_model_comparison: Dict[str, Any]
    fairness_cohorts: List[CohortFairness]

# Care Continuity
class CareStage(BaseModel):
    name: str
    icon: str
    description: str
    completion_rate: float

class CareContinuityMetrics(BaseModel):
    high_risk_predicted: int
    patients_contacted: int
    interventions_completed: int
    appointments_confirmed: int
    followup_success_rate: float

class SustainabilityMetric(BaseModel):
    name: str
    value: str
    description: str

class OutcomeDistribution(BaseModel):
    outcome: str
    count: int

class TrainingDatasetRow(BaseModel):
    patient_code: str
    predicted_risk_score: int
    predicted_risk_level: str
    prediction_date: str
    intervention_type: str
    intervention_outcome: str
    actual_attendance: str
    days_to_followup: int

class CareContinuityResponse(BaseModel):
    stages: List[CareStage]
    metrics: CareContinuityMetrics
    sustainability_metrics: List[SustainabilityMetric]
    outcome_distribution: List[OutcomeDistribution]
    training_dataset_samples: List[TrainingDatasetRow]

# System Settings
class SystemSettings(BaseModel):
    hospital_name: str = "City General Hospital"
    high_risk_threshold: int = 65
    medium_risk_threshold: int = 40
    low_threshold: Optional[int] = 40
    medium_threshold: Optional[int] = 65
    high_threshold: Optional[int] = 80
    daily_outreach_capacity: int = 50
    daily_intervention_capacity: Optional[int] = 50
    auto_escalation: bool = True
    sms_notifications: bool = True

# Analytics
class AnalyticsKPIs(BaseModel):
    total_patients: int
    high_risk_pct: float
    medium_risk_pct: float
    low_risk_pct: float
    missed_followups: int
    interventions_completed: int

class DepartmentRiskItem(BaseModel):
    department: str
    high: int
    medium: int
    low: int

class DistanceRiskPoint(BaseModel):
    distance_km: float
    risk_score: int

class FrequencyRiskPoint(BaseModel):
    appointment_frequency_days: int
    risk_score: int

class AnalyticsResponse(BaseModel):
    kpis: AnalyticsKPIs
    risk_distribution: List[Dict[str, Any]]
    department_risk: List[DepartmentRiskItem]
    distance_risk: List[Dict[str, Any]]
    missed_vs_risk: List[Dict[str, Any]]
    distance_vs_risk: List[DistanceRiskPoint]
    frequency_vs_risk: List[FrequencyRiskPoint]
