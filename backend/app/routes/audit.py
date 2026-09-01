from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AuditLog
from ..seed_data import generate_synthetic_data

router = APIRouter(prefix="/api/v1/audit", tags=["Audit & Admin"])

@router.get("/audit-logs", response_model=List[Dict[str, Any]])
def list_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_email": l.user_email or "System",
            "action": l.action,
            "details": l.details or "N/A",
            "timestamp": l.timestamp.isoformat()
        }
        for l in logs
    ]

@router.post("/seed/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    generate_synthetic_data(db, num_patients=1000)
    return {"message": "Synthetic dataset and demo state reset successfully!"}
