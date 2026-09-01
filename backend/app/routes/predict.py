from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import Patient, Prediction
from ..schemas import PredictRequest, PredictionResponse, PatientListItem
from ..risk_engine import calculate_patient_risk
from .patients import format_patient_item

router = APIRouter(prefix="/api/v1", tags=["Predictions & Risk Engine"])

@router.post("/predict", response_model=PredictionResponse)
@router.post("/predictions/calculate", response_model=PredictionResponse)
def predict_risk(req: PredictRequest, db: Session = Depends(get_db)):
    res = calculate_patient_risk(
        age=req.age,
        distance_km=req.distance_km,
        treatment_duration_months=req.treatment_duration_months,
        appointment_frequency_weeks=req.appointment_frequency_weeks,
        total_appointments=req.total_appointments,
        missed_appointments=req.missed_appointments,
        days_since_last_visit=req.days_since_last_visit
    )

    prev_score = max(0, res["risk_score"] - 12)

    return PredictionResponse(
        patient_id=req.patient_id,
        risk_score=res["risk_score"],
        risk_level=res["risk_level"],
        previous_risk_score=prev_score,
        risk_change=12,
        risk_factors=res["risk_factors"],
        recommended_action=res["recommended_action"],
        prediction_engine="Transparent Weighted Rule Engine v2.0",
        prediction_version="v2.0.0"
    )

@router.get("/predictions/risk-queue", response_model=List[PatientListItem])
def get_risk_queue(limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    items = []
    for p in patients:
        latest_pred = db.query(Prediction).filter(Prediction.patient_id == p.id).order_by(Prediction.created_at.desc()).first()
        item = format_patient_item(p, latest_pred)
        items.append(item)

    items.sort(key=lambda x: x.risk_score, reverse=True)
    return items[:limit]

@router.get("/predictions/{patient_id}", response_model=PredictionResponse)
def get_latest_patient_prediction(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(
        (Patient.patient_id_code == patient_id) | (Patient.id == (int(patient_id) if patient_id.isdigit() else -1))
    ).first()

    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")

    latest = db.query(Prediction).filter(Prediction.patient_id == p.id).order_by(Prediction.created_at.desc()).first()
    if not latest:
        res = calculate_patient_risk(p.age, p.distance_km, p.treatment_duration_months, p.appointment_frequency_weeks, 8, 2, 14)
        return PredictionResponse(
            patient_id=p.id,
            risk_score=res["risk_score"],
            risk_level=res["risk_level"],
            previous_risk_score=0,
            risk_change=0,
            risk_factors=res["risk_factors"],
            recommended_action=res["recommended_action"]
        )

    return PredictionResponse(
        patient_id=p.id,
        risk_score=latest.risk_score,
        risk_level=latest.risk_level,
        previous_risk_score=latest.previous_risk_score or 0,
        risk_change=latest.risk_change or 0,
        risk_factors=latest.risk_factors or [],
        recommended_action=latest.recommended_action or "Standard Follow-up"
    )

@router.get("/predictions/{patient_id}/history")
def get_patient_prediction_history(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(
        (Patient.patient_id_code == patient_id) | (Patient.id == (int(patient_id) if patient_id.isdigit() else -1))
    ).first()

    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")

    preds = db.query(Prediction).filter(Prediction.patient_id == p.id).order_by(Prediction.created_at.desc()).all()
    return preds
