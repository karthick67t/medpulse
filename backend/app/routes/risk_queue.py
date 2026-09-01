from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, Prediction
from ..schemas import PatientListItem
from .patients import format_patient_item

router = APIRouter(prefix="/api/v1/risk-queue", tags=["Risk Queue"])

@router.get("", response_model=Dict[str, List[PatientListItem]])
def get_risk_queue(db: Session = Depends(get_db)):
    results = db.query(Patient, Prediction)\
        .outerjoin(Prediction, Patient.id == Prediction.patient_id)\
        .order_by(Prediction.risk_score.desc().nullslast())\
        .all()

    high_queue = []
    med_queue = []
    low_queue = []

    for patient, prediction in results:
        item = format_patient_item(patient, prediction)
        if item.risk_level == "HIGH":
            high_queue.append(item)
        elif item.risk_level == "MEDIUM":
            med_queue.append(item)
        else:
            low_queue.append(item)

    return {
        "high_priority": high_queue,
        "medium_priority": med_queue,
        "low_priority": low_queue
    }
