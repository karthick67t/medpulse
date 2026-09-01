from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routes import (
    auth,
    dashboard,
    patients,
    risk_queue,
    predict,
    analytics,
    interventions,
    continuity,
    settings,
    audit,
    calendar,
    data_quality,
    model_monitoring,
    outreach
)
from .seed_data import generate_synthetic_data

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedPulse Healthcare Platform",
    description="Explainable Patient Follow-up Risk Prediction & Smart Outreach Platform (v2.0.0). Stay ahead of every follow-up.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Versioned Routers under /api/v1
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(patients.router)
app.include_router(patients.appointments_router)
app.include_router(risk_queue.router)
app.include_router(predict.router)
app.include_router(analytics.router)
app.include_router(interventions.router)
app.include_router(outreach.router)
app.include_router(continuity.router)
app.include_router(calendar.router)
app.include_router(data_quality.router)
app.include_router(model_monitoring.router)
app.include_router(settings.router)
app.include_router(audit.router)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        generate_synthetic_data(db, num_patients=1000)
    finally:
        db.close()

@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": "MedPulse Platform",
        "database": "MySQL (caretrack)",
        "version": "2.0.0",
        "api_version": "v1",
        "smart_outreach_ready": True
    }
