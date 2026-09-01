from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Intervention, Patient, Prediction, AuditLog
from ..schemas import InterventionCreate, InterventionUpdate, InterventionResponse

router = APIRouter(prefix="/api/v1/interventions", tags=["Interventions"])

def format_intervention_res(inv: Intervention, db: Session) -> InterventionResponse:
    patient = db.query(Patient).filter(Patient.id == inv.patient_id).first()
    prediction = db.query(Prediction).filter(Prediction.patient_id == inv.patient_id).order_by(Prediction.created_at.desc()).first()

    return InterventionResponse(
        id=inv.id,
        patient_id=inv.patient_id,
        patient_name=patient.name if patient else "Unknown Patient",
        patient_code=patient.patient_id_code if patient else "N/A",
        patient_risk_score=prediction.risk_score if prediction else 0,
        patient_risk_level=prediction.risk_level if prediction else "LOW",
        intervention_type=inv.intervention_type,
        assigned_to=inv.assigned_to or "Nurse Robert Chen",
        priority=inv.priority or "Medium",
        due_date=inv.due_date.strftime("%Y-%m-%d") if inv.due_date else None,
        status=inv.status,
        outcome=inv.outcome,
        created_at=inv.created_at,
        completed_at=inv.completed_at,
        notes=inv.notes
    )

@router.get("", response_model=List[InterventionResponse])
def list_interventions(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Intervention)
    if status and status.lower() != "all":
        query = query.filter(Intervention.status == status.lower())
    
    interventions = query.order_by(Intervention.created_at.desc()).all()
    return [format_intervention_res(i, db) for i in interventions]

@router.post("", response_model=InterventionResponse)
def create_intervention(req: InterventionCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == req.patient_id).first()
    if not patient:
        patient = db.query(Patient).filter(Patient.patient_id_code == str(req.patient_id)).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    pred = db.query(Prediction).filter(Prediction.patient_id == patient.id).first()

    inv = Intervention(
        hospital_id=1,
        patient_id=patient.id,
        intervention_type=req.intervention_type,
        assigned_to=req.assigned_to or "Nurse Robert Chen",
        priority=req.priority or (pred.risk_level if pred else "Medium"),
        status="pending",
        notes=req.notes
    )
    db.add(inv)
    db.flush()

    audit = AuditLog(hospital_id=1, user_email="admin@caretrack.ai", action="intervention_created", details=f"Created intervention {req.intervention_type} for patient {patient.patient_id_code}")
    db.add(audit)
    db.commit()

    return format_intervention_res(inv, db)

@router.put("/{id}", response_model=InterventionResponse)
def update_intervention(id: int, req: InterventionUpdate, db: Session = Depends(get_db)):
    inv = db.query(Intervention).filter(Intervention.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    if req.status:
        inv.status = req.status
        if req.status == "completed":
            inv.completed_at = datetime.utcnow()
            if not inv.outcome:
                inv.outcome = "Appointment Confirmed"
    if req.outcome:
        inv.outcome = req.outcome
    if req.notes is not None:
        inv.notes = req.notes

    patient = db.query(Patient).filter(Patient.id == inv.patient_id).first()
    audit = AuditLog(hospital_id=1, user_email="admin@caretrack.ai", action="intervention_updated", details=f"Updated intervention #{id} to {inv.status}")
    db.add(audit)

    db.commit()
    db.refresh(inv)
    return format_intervention_res(inv, db)
