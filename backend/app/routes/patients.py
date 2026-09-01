import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Patient, Appointment, Prediction, Intervention, AuditLog
from ..schemas import (
    PatientListItem,
    PatientDetailResponse,
    PriorityOverrideRequest,
    RiskFactor,
    PatientCreateRequest,
    PatientCreateSuccessResponse
)
from ..risk_engine import calculate_patient_risk
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])

class UpdatePatientRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    distance_km: Optional[float] = None
    treatment_duration_months: Optional[int] = None

class CreateAppointmentRequest(BaseModel):
    appointment_date: str
    status: str = "Scheduled"
    notes: Optional[str] = None

def format_patient_item(p: Patient, latest_pred: Optional[Prediction] = None) -> PatientListItem:
    now = datetime.utcnow()
    risk_score = latest_pred.risk_score if latest_pred else 30
    risk_lvl = latest_pred.risk_level if latest_pred else "LOW"
    r_change = latest_pred.risk_change if latest_pred else 0

    next_date = (now + timedelta(days=14)).strftime("%Y-%m-%d")
    top_factor = (latest_pred.risk_factors[0].get("description") if latest_pred and latest_pred.risk_factors else "Missed visit history")

    return PatientListItem(
        id=p.id,
        patient_id_code=p.patient_id_code,
        name=p.name,
        age=p.age,
        department=p.department,
        risk_score=risk_score,
        risk_level=risk_lvl,
        risk_change=r_change,
        priority_override=p.priority_override,
        missed_appointments=2,
        total_appointments=6,
        distance_km=p.distance_km,
        next_followup_date=next_date,
        top_factor=top_factor,
        recommended_action=latest_pred.recommended_action if latest_pred else "Standard Follow-up",
        preferred_contact_method=p.preferred_contact_method or "Phone"
    )

@router.get("", response_model=List[PatientListItem])
def get_patients(
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    department: Optional[str] = None,
    sort_by: str = "risk_score",
    order: str = "desc",
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Patient)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Patient.patient_id_code.ilike(s)) |
            (Patient.name.ilike(s)) |
            (Patient.department.ilike(s))
        )

    if department:
        query = query.filter(Patient.department == department)

    patients = query.all()
    results: List[PatientListItem] = []

    for p in patients:
        latest_pred = db.query(Prediction).filter(Prediction.patient_id == p.id).order_by(Prediction.created_at.desc()).first()
        item = format_patient_item(p, latest_pred)

        if risk_level and item.risk_level != risk_level:
            continue

        results.append(item)

    reverse = (order == "desc")
    if sort_by == "risk_score":
        results.sort(key=lambda x: x.risk_score, reverse=reverse)
    elif sort_by == "age":
        results.sort(key=lambda x: x.age, reverse=reverse)

    return results[:limit]

@router.post("", response_model=PatientCreateSuccessResponse)
def create_patient(req: PatientCreateRequest, db: Session = Depends(get_db)):
    # 1. Check uniqueness of patient_id
    existing = db.query(Patient).filter(Patient.patient_id_code == req.patient_id.strip()).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Patient ID '{req.patient_id}' already exists in hospital registry."
        )

    freq_weeks = max(1, round((req.appointment_frequency_days or 14) / 7))

    # 2. Create Patient Record in MySQL
    patient = Patient(
        hospital_id=1,
        patient_id_code=req.patient_id.strip(),
        name=req.name.strip(),
        age=req.age,
        gender="Female",
        phone=req.phone_number.strip(),
        email=req.email.strip() if req.email else None,
        department=req.department,
        distance_km=float(req.distance_km),
        treatment_duration_months=int(req.treatment_duration_months),
        appointment_frequency_weeks=freq_weeks,
        preferred_language=req.preferred_language or "English",
        preferred_contact_method=req.preferred_contact_method or "Phone",
        whatsapp_number=req.whatsapp_number or req.phone_number
    )
    db.add(patient)
    db.flush()

    # 3. Create Scheduled Next Appointment in MySQL
    try:
        dt_str = f"{req.appointment_date} {req.appointment_time}"
        next_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
    except Exception:
        next_dt = datetime.utcnow() + timedelta(days=14)

    appt = Appointment(
        hospital_id=1,
        patient_id=patient.id,
        appointment_date=next_dt,
        status="Scheduled",
        notes=f"Scheduled follow-up for {req.department}"
    )
    db.add(appt)

    # 4. Calculate Risk via Transparent Risk Engine
    pred_res = calculate_patient_risk(
        age=req.age,
        distance_km=req.distance_km,
        treatment_duration_months=req.treatment_duration_months,
        appointment_frequency_weeks=freq_weeks,
        total_appointments=req.total_appointments,
        missed_appointments=req.missed_appointments,
        days_since_last_visit=14
    )

    pred = Prediction(
        hospital_id=1,
        patient_id=patient.id,
        risk_score=pred_res["risk_score"],
        risk_level=pred_res["risk_level"],
        previous_risk_score=0,
        risk_change=0,
        risk_factors=pred_res["risk_factors"],
        recommended_action=pred_res["recommended_action"]
    )
    db.add(pred)
    db.flush()

    # 5. Automatically create intervention task for HIGH or MEDIUM risk
    if pred_res["risk_level"] in ["HIGH", "MEDIUM"]:
        inv = Intervention(
            hospital_id=1,
            patient_id=patient.id,
            intervention_type="Phone Call" if pred_res["risk_level"] == "HIGH" else "SMS Reminder",
            assigned_to="Nurse Robert Chen",
            priority="URGENT" if pred_res["risk_level"] == "HIGH" else "HIGH",
            status="pending",
            notes=f"Auto-generated outreach task upon patient registration ({pred_res['risk_level']} risk)."
        )
        db.add(inv)

    # 6. Audit Logs
    audit1 = AuditLog(hospital_id=1, user_email="staff@caretrack.ai", action="PATIENT_CREATED", details=f"Registered patient {patient.name} ({patient.patient_id_code})")
    audit2 = AuditLog(hospital_id=1, user_email="system@caretrack.ai", action="PREDICTION_GENERATED", details=f"Calculated risk {pred_res['risk_score']}/100 ({pred_res['risk_level']}) for {patient.patient_id_code}")
    db.add(audit1)
    db.add(audit2)

    db.commit()
    db.refresh(patient)

    top_factor = pred_res["risk_factors"][0]["description"] if pred_res["risk_factors"] else "Missed visit history"
    action_label = "CALL NOW" if pred_res["risk_level"] == "HIGH" else ("FOLLOW UP" if pred_res["risk_level"] == "MEDIUM" else "REMINDER")

    return PatientCreateSuccessResponse(
        id=patient.id,
        patient_id=patient.patient_id_code,
        name=patient.name,
        age=patient.age,
        department=patient.department,
        phone_number=patient.phone or req.phone_number,
        next_followup_date=next_dt.strftime("%Y-%m-%d %I:%M %p"),
        risk_score=pred_res["risk_score"],
        risk_level=pred_res["risk_level"],
        top_factor=top_factor,
        risk_factors=[RiskFactor(**f) for f in pred_res["risk_factors"]],
        recommended_action=pred_res["recommended_action"],
        action_label=action_label
    )

@router.get("/{id_code}", response_model=PatientDetailResponse)
def get_patient_detail(id_code: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(
        (Patient.patient_id_code == id_code) | (Patient.id == (int(id_code) if id_code.isdigit() else -1))
    ).first()

    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")

    latest_pred = db.query(Prediction).filter(Prediction.patient_id == p.id).order_by(Prediction.created_at.desc()).first()
    appts = db.query(Appointment).filter(Appointment.patient_id == p.id).order_by(Appointment.appointment_date.desc()).all()

    missed = len([a for a in appts if a.status == "Missed"])
    total_appts = max(len(appts), 5)

    if latest_pred:
        risk_score = latest_pred.risk_score
        risk_lvl = latest_pred.risk_level
        prev_score = latest_pred.previous_risk_score or 0
        r_change = latest_pred.risk_change or 0
        factors = [RiskFactor(**f) for f in (latest_pred.risk_factors or [])]
        rec_action = latest_pred.recommended_action
    else:
        res = calculate_patient_risk(p.age, p.distance_km, p.treatment_duration_months, p.appointment_frequency_weeks, total_appts, missed, 14)
        risk_score = res["risk_score"]
        risk_lvl = res["risk_level"]
        prev_score = 0
        r_change = 0
        factors = [RiskFactor(**f) for f in res["risk_factors"]]
        rec_action = res["recommended_action"]

    return PatientDetailResponse(
        id=p.id,
        patient_id_code=p.patient_id_code,
        name=p.name,
        age=p.age,
        gender=p.gender,
        phone=p.phone or "+1 (555) 000-0000",
        department=p.department,
        distance_km=p.distance_km,
        treatment_duration_months=p.treatment_duration_months,
        appointment_frequency_weeks=p.appointment_frequency_weeks,
        current_risk_score=risk_score,
        current_risk_level=risk_lvl,
        previous_risk_score=prev_score,
        risk_change=r_change,
        priority_override=p.priority_override,
        override_reason=p.override_reason,
        preferred_contact_method=p.preferred_contact_method or "Phone",
        risk_factors=factors,
        recommended_action=rec_action,
        appointments=appts
    )

@router.put("/{id_code}", response_model=PatientCreateSuccessResponse)
def update_patient(id_code: str, req: PatientCreateRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        (Patient.patient_id_code == id_code) | (Patient.id == (int(id_code) if id_code.isdigit() else -1))
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found in registry")

    freq_weeks = max(1, round((req.appointment_frequency_days or 14) / 7))

    # Update patient fields (do not change patient_id_code)
    patient.name = req.name.strip()
    patient.age = req.age
    patient.phone = req.phone_number.strip()
    if req.email:
        patient.email = req.email.strip()
    patient.department = req.department
    patient.distance_km = float(req.distance_km)
    patient.treatment_duration_months = int(req.treatment_duration_months)
    patient.appointment_frequency_weeks = freq_weeks
    patient.preferred_language = req.preferred_language or patient.preferred_language
    patient.preferred_contact_method = req.preferred_contact_method or patient.preferred_contact_method
    if req.whatsapp_number:
        patient.whatsapp_number = req.whatsapp_number

    # Update/Create scheduled appointment
    try:
        dt_str = f"{req.appointment_date} {req.appointment_time}"
        next_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
    except Exception:
        next_dt = datetime.utcnow() + timedelta(days=14)

    latest_appt = db.query(Appointment).filter(Appointment.patient_id == patient.id, Appointment.status == "Scheduled").first()
    if latest_appt:
        latest_appt.appointment_date = next_dt
        latest_appt.notes = f"Scheduled follow-up for {req.department}"
    else:
        new_appt = Appointment(
            hospital_id=patient.hospital_id,
            patient_id=patient.id,
            appointment_date=next_dt,
            status="Scheduled",
            notes=f"Scheduled follow-up for {req.department}"
        )
        db.add(new_appt)

    # Recalculate Risk Engine Output
    pred_res = calculate_patient_risk(
        age=req.age,
        distance_km=req.distance_km,
        treatment_duration_months=req.treatment_duration_months,
        appointment_frequency_weeks=freq_weeks,
        total_appointments=req.total_appointments,
        missed_appointments=req.missed_appointments,
        days_since_last_visit=14
    )

    prev_pred = db.query(Prediction).filter(Prediction.patient_id == patient.id).order_by(Prediction.created_at.desc()).first()
    prev_score = prev_pred.risk_score if prev_pred else pred_res["risk_score"]
    risk_diff = pred_res["risk_score"] - prev_score

    pred = Prediction(
        hospital_id=patient.hospital_id,
        patient_id=patient.id,
        risk_score=pred_res["risk_score"],
        risk_level=pred_res["risk_level"],
        previous_risk_score=prev_score,
        risk_change=risk_diff,
        risk_factors=pred_res["risk_factors"],
        recommended_action=pred_res["recommended_action"]
    )
    db.add(pred)

    audit = AuditLog(
        hospital_id=patient.hospital_id,
        user_email="staff@medpulse.ai",
        action="PATIENT_UPDATED",
        details=f"Updated patient {patient.name} ({patient.patient_id_code}). Recalculated risk: {pred_res['risk_score']}/100."
    )
    db.add(audit)

    db.commit()
    db.refresh(patient)

    top_factor = pred_res["risk_factors"][0]["description"] if pred_res["risk_factors"] else "Missed visit history"
    action_label = "CALL NOW" if pred_res["risk_level"] == "HIGH" else ("FOLLOW UP" if pred_res["risk_level"] == "MEDIUM" else "REMINDER")

    return PatientCreateSuccessResponse(
        id=patient.id,
        patient_id=patient.patient_id_code,
        name=patient.name,
        age=patient.age,
        department=patient.department,
        phone_number=patient.phone or req.phone_number,
        next_followup_date=next_dt.strftime("%Y-%m-%d %I:%M %p"),
        risk_score=pred_res["risk_score"],
        risk_level=pred_res["risk_level"],
        top_factor=top_factor,
        risk_factors=[RiskFactor(**f) for f in pred_res["risk_factors"]],
        recommended_action=pred_res["recommended_action"],
        action_label=action_label
    )

@router.get("/{id_code}/appointments")
def get_patient_appointments(id_code: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(
        (Patient.patient_id_code == id_code) | (Patient.id == (int(id_code) if id_code.isdigit() else -1))
    ).first()

    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")

    appts = db.query(Appointment).filter(Appointment.patient_id == p.id).order_by(Appointment.appointment_date.desc()).all()
    return appts

@router.post("/{id_code}/appointments")
def create_patient_appointment(id_code: str, req: CreateAppointmentRequest, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(
        (Patient.patient_id_code == id_code) | (Patient.id == (int(id_code) if id_code.isdigit() else -1))
    ).first()

    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")

    dt = datetime.strptime(req.appointment_date[:10], "%Y-%m-%d")
    appt = Appointment(
        hospital_id=p.hospital_id,
        patient_id=p.id,
        appointment_date=dt,
        status=req.status,
        notes=req.notes or "Scheduled follow-up"
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt

@router.post("/{id_code}/override", response_model=PatientDetailResponse)
def override_patient_priority(id_code: str, req: PriorityOverrideRequest, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(
        (Patient.patient_id_code == id_code) | (Patient.id == (int(id_code) if id_code.isdigit() else -1))
    ).first()

    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")

    p.priority_override = req.priority_override if req.priority_override != "NONE" else None
    p.override_reason = req.override_reason
    db.commit()

    audit = AuditLog(
        hospital_id=p.hospital_id,
        user_email="admin@caretrack.ai",
        action="priority_overridden",
        details=f"Overrode priority for {p.patient_id_code} to {req.priority_override}. Reason: {req.override_reason}"
    )
    db.add(audit)
    db.commit()

    return get_patient_detail(p.patient_id_code, db)

# Support PUT /api/v1/appointments/{id}
appointments_router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])

class UpdateAppointmentRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

@appointments_router.put("/{id}")
def update_appointment(id: int, req: UpdateAppointmentRequest, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if req.status: appt.status = req.status
    if req.notes: appt.notes = req.notes
    db.commit()
    db.refresh(appt)
    return appt
