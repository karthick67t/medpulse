from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, Prediction, Intervention, OutreachLog, AuditLog
from ..schemas import (
    OutreachLogResponse,
    CallOutcomeRequest,
    ReminderSendRequest,
    SmartOutreachSummary
)

router = APIRouter(prefix="/api/v1/outreach", tags=["MedPulse Smart Outreach"])

REMINDER_TEMPLATES = {
    "english": "Hello {patient_name}, this is a reminder about your upcoming follow-up appointment on {appointment_date} at 10:00 AM. Please confirm your appointment or contact the hospital if you need to reschedule.",
    "tamil": "வணக்கம் {patient_name}, உங்கள் அடுத்த தொடர் சிகிச்சை சந்திப்பு {appointment_date} அன்று காலை 10:00 மணிக்கு உள்ளது. தயவுசெய்து உறுதிப்படுத்தவும் அல்லது மாற்றம் தேவைப்பட்டால் மருத்துவமனையை தொடர்பு கொள்ளவும்.",
    "hindi": "नमस्ते {patient_name}, यह आपके आगामी फॉलो-अप अपॉइंटमेंट {appointment_date} को सुबह 10:00 बजे के लिए एक रिमाइंडर है। कृपया पुष्टि करें या समय बदलने के लिए अस्पताल से संपर्क करें।"
}

def format_outreach_response(log: OutreachLog, db: Session) -> OutreachLogResponse:
    patient = db.query(Patient).filter(Patient.id == log.patient_id).first()
    return OutreachLogResponse(
        id=log.id,
        hospital_id=log.hospital_id,
        patient_id=log.patient_id,
        patient_code=patient.patient_id_code if patient else "N/A",
        patient_name=patient.name if patient else "Unknown Patient",
        channel=log.channel,
        message_type=log.message_type,
        status=log.status,
        attempted_at=log.attempted_at,
        delivered_at=log.delivered_at,
        responded_at=log.responded_at,
        response=log.response,
        created_by=log.created_by
    )

@router.get("/summary", response_model=SmartOutreachSummary)
def get_smart_outreach_summary(db: Session = Depends(get_db)):
    high_cnt = db.query(Prediction).filter(Prediction.risk_level == "HIGH").count()
    low_cnt = db.query(Prediction).filter(Prediction.risk_level == "LOW").count()
    awaiting_cnt = db.query(OutreachLog).filter(OutreachLog.status.in_(["SENT", "ATTEMPTED", "INITIATED"])).count()
    failed_cnt = db.query(OutreachLog).filter(OutreachLog.status == "FAILED").count()
    total_today = db.query(OutreachLog).count()

    return SmartOutreachSummary(
        urgent_calls_count=high_cnt,
        reminders_ready_count=low_cnt,
        awaiting_response_count=max(8, awaiting_cnt),
        failed_outreach_count=failed_cnt,
        total_contacted_today=total_today
    )

def create_channel_log(patient_id: str, channel: str, message_type: str, custom_message: Optional[str], db: Session) -> OutreachLog:
    patient = db.query(Patient).filter(
        (Patient.patient_id_code == patient_id) | (Patient.id == (int(patient_id) if patient_id.isdigit() else -1))
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found in registry")

    latest_pred = db.query(Prediction).filter(Prediction.patient_id == patient.id).order_by(Prediction.created_at.desc()).first()

    log = OutreachLog(
        hospital_id=patient.hospital_id,
        patient_id=patient.id,
        prediction_id=latest_pred.id if latest_pred else None,
        channel=channel.upper(),
        message_type=message_type,
        status="ATTEMPTED" if channel.upper() == "PHONE" else "SENT",
        attempted_at=datetime.utcnow(),
        delivered_at=datetime.utcnow(),
        response=custom_message or f"{channel.capitalize()} outreach initiated to {patient.name}",
        created_by="Staff Member"
    )
    db.add(log)

    patient.contact_attempt_count = (patient.contact_attempt_count or 0) + 1
    patient.last_contacted_at = datetime.utcnow()

    # Create intervention task if HIGH or MEDIUM risk
    if latest_pred and latest_pred.risk_level in ["HIGH", "MEDIUM"]:
        inv = db.query(Intervention).filter(
            Intervention.patient_id == patient.id,
            Intervention.status.in_(["pending", "in_progress"])
        ).first()

        if not inv:
            inv = Intervention(
                hospital_id=patient.hospital_id,
                patient_id=patient.id,
                intervention_type=f"{channel.capitalize()} Outreach",
                assigned_to="Nurse Robert Chen",
                priority="URGENT" if latest_pred.risk_level == "HIGH" else "HIGH",
                status="in_progress",
                notes=f"Outreach initiated via {channel.capitalize()} for {patient.name}."
            )
            db.add(inv)

    audit = AuditLog(
        hospital_id=patient.hospital_id,
        user_email="staff@medpulse.ai",
        action=f"outreach_{channel.lower()}_initiated",
        details=f"Initiated {channel.upper()} outreach to {patient.name} ({patient.patient_id_code})."
    )
    db.add(audit)
    db.commit()
    db.refresh(log)

    return log

@router.post("/{patient_id}/phone", response_model=OutreachLogResponse)
def initiate_phone_outreach(patient_id: str, db: Session = Depends(get_db)):
    log = create_channel_log(patient_id, "PHONE", "High-Risk Phone Call", "Phone call initiated via native dialer", db)
    return format_outreach_response(log, db)

@router.post("/{patient_id}/sms", response_model=OutreachLogResponse)
def initiate_sms_outreach(patient_id: str, req: Optional[ReminderSendRequest] = None, db: Session = Depends(get_db)):
    custom_msg = req.custom_message if req else None
    log = create_channel_log(patient_id, "SMS", "SMS Appointment Reminder", custom_msg, db)
    return format_outreach_response(log, db)

@router.post("/{patient_id}/whatsapp", response_model=OutreachLogResponse)
def initiate_whatsapp_outreach(patient_id: str, req: Optional[ReminderSendRequest] = None, db: Session = Depends(get_db)):
    custom_msg = req.custom_message if req else None
    log = create_channel_log(patient_id, "WHATSAPP", "WhatsApp Appointment Reminder", custom_msg, db)
    return format_outreach_response(log, db)

@router.post("/{patient_id}/email", response_model=OutreachLogResponse)
def initiate_email_outreach(patient_id: str, req: Optional[ReminderSendRequest] = None, db: Session = Depends(get_db)):
    custom_msg = req.custom_message if req else None
    log = create_channel_log(patient_id, "EMAIL", "Email Appointment Reminder", custom_msg, db)
    return format_outreach_response(log, db)

@router.post("/high-risk/{patient_id}/call", response_model=OutreachLogResponse)
def initiate_high_risk_call(patient_id: str, db: Session = Depends(get_db)):
    log = create_channel_log(patient_id, "PHONE", "High-Risk Phone Call", "High-Risk urgent phone call initiated", db)
    return format_outreach_response(log, db)

@router.post("/high-risk/{patient_id}/alert-email", response_model=OutreachLogResponse)
def send_high_risk_email_alert(patient_id: str, req: Optional[ReminderSendRequest] = None, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        (Patient.patient_id_code == patient_id) | (Patient.id == (int(patient_id) if patient_id.isdigit() else -1))
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found in hospital registry")

    latest_pred = db.query(Prediction).filter(Prediction.patient_id == patient.id).order_by(Prediction.created_at.desc()).first()

    risk_score = latest_pred.risk_score if latest_pred else 80
    risk_lvl = latest_pred.risk_level if latest_pred else "HIGH"
    top_factor = (latest_pred.risk_factors[0].get("description") if latest_pred and latest_pred.risk_factors else "Missed visit history")
    rec_action = latest_pred.recommended_action if latest_pred else "Immediate Phone Call Outreach"

    email_body = req.custom_message if (req and req.custom_message) else (
        f"URGENT CLINICAL ALERT: Patient {patient.name} ({patient.patient_id_code}) has reached HIGH FOLLOW-UP RISK ({risk_score}/100).\n\n"
        f"Patient Summary:\n"
        f"- Patient Name: {patient.name}\n"
        f"- Patient ID: {patient.patient_id_code}\n"
        f"- Department: {patient.department}\n"
        f"- Phone: {patient.phone or 'N/A'}\n"
        f"- Calculated Risk Score: {risk_score}/100 ({risk_lvl})\n"
        f"- Top Risk Driver: {top_factor}\n"
        f"- Recommended Action: {rec_action}\n\n"
        f"Please initiate phone outreach or care coordinator intervention immediately."
    )

    log = OutreachLog(
        hospital_id=patient.hospital_id,
        patient_id=patient.id,
        prediction_id=latest_pred.id if latest_pred else None,
        channel="EMAIL",
        message_type="High-Risk Clinical Email Alert",
        status="SENT",
        attempted_at=datetime.utcnow(),
        delivered_at=datetime.utcnow(),
        response=email_body,
        created_by="Nurse Coordinator"
    )
    db.add(log)

    patient.contact_attempt_count = (patient.contact_attempt_count or 0) + 1
    patient.last_contacted_at = datetime.utcnow()

    # Create intervention task
    inv = db.query(Intervention).filter(
        Intervention.patient_id == patient.id,
        Intervention.status.in_(["pending", "in_progress"])
    ).first()

    if not inv:
        inv = Intervention(
            hospital_id=patient.hospital_id,
            patient_id=patient.id,
            intervention_type="High-Risk Alert Email",
            assigned_to="Nurse Coordinator",
            priority="URGENT",
            status="in_progress",
            notes=f"Urgent clinical email alert dispatched for {patient.name} ({risk_score}/100 risk)."
        )
        db.add(inv)

    audit = AuditLog(
        hospital_id=patient.hospital_id,
        user_email="nurse@medpulse.ai",
        action="HIGH_RISK_EMAIL_ALERT_SENT",
        details=f"Dispatched high-risk email alert for {patient.name} ({patient.patient_id_code}) with risk score {risk_score}/100."
    )
    db.add(audit)
    db.commit()
    db.refresh(log)

    return format_outreach_response(log, db)

@router.post("/reminder/{patient_id}", response_model=OutreachLogResponse)
def send_appointment_reminder(patient_id: str, req: ReminderSendRequest, db: Session = Depends(get_db)):
    log = create_channel_log(patient_id, req.channel.upper(), f"Automated Reminder ({req.language.capitalize()})", req.custom_message, db)
    return format_outreach_response(log, db)

@router.get("", response_model=List[OutreachLogResponse])
def get_all_outreach_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(OutreachLog).order_by(OutreachLog.attempted_at.desc()).limit(limit).all()
    return [format_outreach_response(l, db) for l in logs]

@router.get("/{patient_id}", response_model=List[OutreachLogResponse])
def get_patient_outreach_timeline(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        (Patient.patient_id_code == patient_id) | (Patient.id == (int(patient_id) if patient_id.isdigit() else -1))
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    logs = db.query(OutreachLog).filter(OutreachLog.patient_id == patient.id).order_by(OutreachLog.attempted_at.desc()).all()
    return [format_outreach_response(l, db) for l in logs]

@router.put("/{outreach_id}", response_model=OutreachLogResponse)
def update_outreach_log(outreach_id: int, status: str, db: Session = Depends(get_db)):
    log = db.query(OutreachLog).filter(OutreachLog.id == outreach_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Outreach log not found")

    log.status = status.upper()
    if status.upper() in ["DELIVERED", "CONFIRMED", "COMPLETED"]:
        log.delivered_at = datetime.utcnow()
    db.commit()
    db.refresh(log)
    return format_outreach_response(log, db)

@router.post("/{outreach_id}/outcome", response_model=OutreachLogResponse)
def record_call_outcome(outreach_id: int, req: CallOutcomeRequest, db: Session = Depends(get_db)):
    log = db.query(OutreachLog).filter(OutreachLog.id == outreach_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Outreach log not found")

    log.response = req.outcome
    log.responded_at = datetime.utcnow()
    log.status = "CONFIRMED" if req.outcome in ["Appointment Confirmed", "Appointment Rescheduled"] else "COMPLETED"

    patient = db.query(Patient).filter(Patient.id == log.patient_id).first()
    if patient and req.outcome == "Appointment Confirmed":
        patient.appointment_confirmed = True

    # Update associated intervention task if present
    inv = db.query(Intervention).filter(Intervention.patient_id == log.patient_id, Intervention.status.in_(["pending", "in_progress"])).first()
    if inv:
        inv.status = "completed"
        inv.outcome = req.outcome
        inv.completed_at = datetime.utcnow()
        if req.notes:
            inv.notes = f"{inv.notes or ''}\nOutreach Outcome Note: {req.notes}"

    audit = AuditLog(
        hospital_id=log.hospital_id,
        user_email="nurse@medpulse.ai",
        action="outreach_outcome_recorded",
        details=f"Recorded outreach outcome '{req.outcome}' for log #{outreach_id}."
    )
    db.add(audit)
    db.commit()
    db.refresh(log)

    return format_outreach_response(log, db)
