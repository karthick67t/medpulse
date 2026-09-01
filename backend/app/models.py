from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, default="City General Hospital")
    code = Column(String(50), unique=True, index=True, default="CGH-01")
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="hospital")
    patients = relationship("Patient", back_populates="hospital")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, default=1)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Nurse") # Admin, Doctor, Nurse, Reception
    created_at = Column(DateTime, default=datetime.utcnow)

    hospital = relationship("Hospital", back_populates="users")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, default=1)
    patient_id_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False, default="Female")
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    department = Column(String(100), nullable=False, default="Cardiology")
    distance_km = Column(Float, nullable=False, default=10.0)
    treatment_duration_months = Column(Integer, nullable=False, default=12)
    appointment_frequency_weeks = Column(Integer, nullable=False, default=2)
    priority_override = Column(String(50), nullable=True) # HIGH, MEDIUM, LOW, or None
    override_reason = Column(Text, nullable=True)
    
    # Outreach & Preferences Fields
    preferred_language = Column(String(50), nullable=False, default="English") # English, Tamil, Hindi, Telugu, Malayalam, Kannada
    preferred_contact_method = Column(String(50), nullable=False, default="Phone") # Phone, SMS, WhatsApp, Email
    whatsapp_number = Column(String(50), nullable=True)
    last_contacted_at = Column(DateTime, nullable=True)
    contact_attempt_count = Column(Integer, default=0)
    appointment_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    hospital = relationship("Hospital", back_populates="patients")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="patient", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="patient", cascade="all, delete-orphan")
    outreach_logs = relationship("OutreachLog", back_populates="patient", cascade="all, delete-orphan")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, default=1)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_date = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False, default="Scheduled") # Attended, Missed, Rescheduled, Scheduled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, default=1)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    risk_score = Column(Integer, nullable=False) # 0 to 100
    risk_level = Column(String(20), nullable=False) # HIGH, MEDIUM, LOW
    previous_risk_score = Column(Integer, default=0)
    risk_change = Column(Integer, default=0)
    risk_change_percentage = Column(Float, default=0.0)
    prediction_engine = Column(String(255), default="Transparent Weighted Rule Engine v2.0")
    prediction_version = Column(String(50), default="v2.0.0")
    risk_factors = Column(JSON, nullable=True)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="predictions")

class RiskFactorLog(Base):
    __tablename__ = "risk_factors"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=True)
    factor_name = Column(String(255), nullable=False)
    impact_score = Column(Integer, nullable=False, default=0)
    severity = Column(String(50), nullable=False, default="Medium")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, default=1)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    intervention_type = Column(String(100), nullable=False) # Phone Call, SMS, Rescheduling, Transportation
    assigned_to = Column(String(255), nullable=False, default="Nurse Robert Chen")
    priority = Column(String(50), nullable=False, default="Medium")
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=False, default="pending") # pending, in_progress, completed, cancelled
    outcome = Column(String(100), nullable=True) # Appointment Confirmed, Rescheduled, Unreachable, Declined
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="interventions")

class OutreachLog(Base):
    __tablename__ = "outreach_logs"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, default=1)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=True)
    intervention_id = Column(Integer, ForeignKey("interventions.id"), nullable=True)
    channel = Column(String(50), nullable=False, default="Phone") # Phone, SMS, WhatsApp, Email
    message_type = Column(String(100), nullable=False, default="High-Risk Phone Call") # High-Risk Phone Call, Appointment Reminder
    status = Column(String(50), nullable=False, default="Sent") # Pending, Sending, Sent, Delivered, Failed, Confirmed
    attempted_at = Column(DateTime, default=datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    response = Column(String(255), nullable=True) # Call Outcome or Patient Reply
    created_by = Column(String(255), nullable=False, default="Nurse Robert Chen")

    patient = relationship("Patient", back_populates="outreach_logs")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, default=1)
    name = Column(String(255), nullable=False, default="Transparent Weighted Rule Engine")
    version = Column(String(50), nullable=False, default="v2.0.0")
    engine_type = Column(String(100), nullable=False, default="Rule-based Weighted Scoring")
    is_active = Column(Boolean, default=True)
    accuracy = Column(Float, default=0.885)
    precision = Column(Float, default=0.862)
    recall = Column(Float, default=0.910)
    f1_score = Column(Float, default=0.885)
    auc = Column(Float, default=0.912)
    training_records_count = Column(Integer, default=1000)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, default=1)
    user_email = Column(String(255), nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class DataQualityLog(Base):
    __tablename__ = "data_quality_logs"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, default=1)
    filename = Column(String(255), nullable=False)
    records_processed = Column(Integer, nullable=False)
    valid_records = Column(Integer, nullable=False)
    invalid_records = Column(Integer, nullable=False)
    completeness_score = Column(Float, nullable=False)
    imported_at = Column(DateTime, default=datetime.utcnow)
