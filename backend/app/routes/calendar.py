from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Patient, Appointment, Prediction, Intervention
from ..schemas import CalendarEventItem

router = APIRouter(prefix="/api/v1/calendar", tags=["Calendar"])

@router.get("", response_model=List[CalendarEventItem])
def get_calendar_events(db: Session = Depends(get_db)):
    events: List[CalendarEventItem] = []
    
    # 1. Fetch upcoming and recent appointments
    appointments = db.query(Appointment).join(Patient).all()
    for appt in appointments:
        p = appt.patient
        latest_pred = db.query(Prediction).filter(Prediction.patient_id == p.id).order_by(Prediction.created_at.desc()).first()
        risk_lvl = latest_pred.risk_level if latest_pred else "LOW"
        risk_scr = latest_pred.risk_score if latest_pred else 20

        evt_type = "upcoming_followup"
        if appt.status == "Missed":
            evt_type = "missed_followup"
        elif appt.status == "Rescheduled":
            evt_type = "rescheduled_followup"
        elif risk_lvl == "HIGH":
            evt_type = "high_risk_followup"

        events.append(CalendarEventItem(
            id=appt.id,
            type=evt_type,
            title=f"{p.name} - {appt.status} Follow-up",
            patient_id_code=p.patient_id_code,
            patient_name=p.name,
            date=appt.appointment_date.strftime("%Y-%m-%d"),
            risk_level=risk_lvl,
            risk_score=risk_scr,
            department=p.department,
            details=f"Status: {appt.status} | Dept: {p.department} | Risk: {risk_scr}/100"
        ))

    # 2. Fetch pending interventions
    interventions = db.query(Intervention).join(Patient).filter(Intervention.status != "completed").all()
    for item in interventions:
        p = item.patient
        latest_pred = db.query(Prediction).filter(Prediction.patient_id == p.id).order_by(Prediction.created_at.desc()).first()
        risk_lvl = latest_pred.risk_level if latest_pred else "MEDIUM"
        risk_scr = latest_pred.risk_score if latest_pred else 50
        due = item.due_date.strftime("%Y-%m-%d") if item.due_date else datetime.utcnow().strftime("%Y-%m-%d")

        events.append(CalendarEventItem(
            id=10000 + item.id,
            type="intervention_due",
            title=f"Outreach Due: {item.intervention_type}",
            patient_id_code=p.patient_id_code,
            patient_name=p.name,
            date=due,
            risk_level=risk_lvl,
            risk_score=risk_scr,
            department=p.department,
            details=f"Assigned to {item.assigned_to} | Type: {item.intervention_type}"
        ))

    return events
