from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AuditLog, Patient, Prediction
from ..schemas import SystemSettings
from ..seed_data import generate_synthetic_data

router = APIRouter(prefix="/api/v1/settings", tags=["Settings"])

@router.get("", response_model=SystemSettings)
def get_settings(db: Session = Depends(get_db)):
    return SystemSettings(
        hospital_name="City General Hospital",
        high_risk_threshold=65,
        medium_risk_threshold=40,
        daily_outreach_capacity=50,
        auto_escalation=True,
        sms_notifications=True
    )

@router.put("", response_model=SystemSettings)
def update_settings(req: SystemSettings, db: Session = Depends(get_db)):
    audit = AuditLog(hospital_id=1, user_email="admin@caretrack.ai", action="settings_updated", details="Updated hospital thresholds and capacity")
    db.add(audit)
    db.commit()
    return req

@router.post("/reset-demo")
def reset_demo_state(db: Session = Depends(get_db)):
    generate_synthetic_data(db, num_patients=1000)
    return {"message": "Demo data reset successfully", "patients_count": 1000}
