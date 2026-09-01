import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import Base, engine
from .models import Hospital, User, Patient, Appointment, Prediction, Intervention, OutreachLog, ModelVersion, DataQualityLog, AuditLog
from .risk_engine import calculate_patient_risk

DEPARTMENTS = ["Cardiology", "Orthopedics", "General Medicine", "Neurology", "Dermatology", "ENT"]
GENDERS = ["Male", "Female", "Other"]
CONTACT_METHODS = ["Phone", "SMS", "WhatsApp", "Email"]

FIRST_NAMES_MALE = ["Eleanor", "Marcus", "Arthur", "Julian", "Alexander", "David", "Robert", "James", "Victor", "Charles"]
FIRST_NAMES_FEMALE = ["Clara", "Sophia", "Amelia", "Victoria", "Elena", "Sarah", "Emily", "Grace", "Hannah", "Olivia"]
LAST_NAMES = ["Vance", "Thorne", "Oswald", "Tennant", "Rostova", "Jenkins", "Chen", "Blackwood", "Sterling", "Holloway"]

STAFF_MEMBERS = ["Nurse Robert Chen", "Dr. Sarah Jenkins", "Elena Rostova (Reception)", "Care Coordinator"]

def generate_synthetic_data(db: Session, num_patients: int = 1000):
    try:
        existing_count = db.query(Patient).count()
        if existing_count >= num_patients:
            print(f"[MySQL] Database ready with {existing_count} patient records.")
            return
    except Exception as e:
        print(f"[MySQL] Initializing schema: {e}")

    print(f"[MySQL] Seeding {num_patients} synthetic patient records into MySQL...")
    Base.metadata.create_all(bind=engine)

    # 1. Create Default Hospital
    hospital = db.query(Hospital).first()
    if not hospital:
        hospital = Hospital(
            name="City General Hospital",
            code="CGH-01",
            address="100 Healthcare Blvd, Metro City"
        )
        db.add(hospital)
        db.commit()

    # 2. Create Users
    if db.query(User).count() == 0:
        users = [
            User(hospital_id=hospital.id, email="admin@caretrack.ai", name="Demo Admin", password_hash="demo123", role="Admin"),
            User(hospital_id=hospital.id, email="doctor@caretrack.ai", name="Dr. Sarah Jenkins", password_hash="demo123", role="Doctor"),
            User(hospital_id=hospital.id, email="nurse@caretrack.ai", name="Nurse Robert Chen", password_hash="demo123", role="Nurse"),
            User(hospital_id=hospital.id, email="reception@caretrack.ai", name="Elena Rostova", password_hash="demo123", role="Reception"),
        ]
        db.add_all(users)
        db.commit()

    # 3. Create Model Version
    if db.query(ModelVersion).count() == 0:
        model_v1 = ModelVersion(
            hospital_id=hospital.id,
            name="Transparent Weighted Rule Engine",
            version="v2.0.0",
            engine_type="Rule-based Weighted Scoring",
            is_active=True,
            accuracy=0.885,
            precision=0.862,
            recall=0.910,
            f1_score=0.885,
            auc=0.912,
            training_records_count=num_patients
        )
        db.add(model_v1)
        db.commit()

    # 4. Batch Create Patients
    now = datetime.utcnow()
    demo_specs = [
        {"code": "P1024", "name": "Eleanor Vance", "age": 68, "gender": "Female", "dept": "Cardiology", "dist": 28.5, "dur": 18, "freq": 2, "contact": "Phone"},
        {"code": "P1092", "name": "Marcus Thorne", "age": 72, "gender": "Male", "dept": "Orthopedics", "dist": 34.0, "dur": 24, "freq": 3, "contact": "Phone"},
        {"code": "P1134", "name": "Clara Oswald", "age": 45, "gender": "Female", "dept": "General Medicine", "dist": 12.0, "dur": 6, "freq": 4, "contact": "SMS"},
        {"code": "P1201", "name": "David Tennant", "age": 38, "gender": "Male", "dept": "Neurology", "dist": 5.2, "dur": 12, "freq": 4, "contact": "WhatsApp"},
    ]

    patients_to_add = []
    current_count = db.query(Patient).count()

    for i in range(current_count, num_patients):
        if i < len(demo_specs):
            spec = demo_specs[i]
            p_code = spec["code"]
            p_name = spec["name"]
            p_age = spec["age"]
            p_gender = spec["gender"]
            p_dept = spec["dept"]
            p_dist = spec["dist"]
            p_dur = spec["dur"]
            p_freq = spec["freq"]
            p_contact = spec["contact"]
        else:
            p_code = f"P{2000 + i}"
            p_gender = random.choice(GENDERS[:2])
            first = random.choice(FIRST_NAMES_MALE if p_gender == "Male" else FIRST_NAMES_FEMALE)
            last = random.choice(LAST_NAMES)
            p_name = f"{first} {last}"
            p_age = random.randint(22, 85)
            p_dept = random.choice(DEPARTMENTS)
            p_dist = round(random.uniform(1.0, 50.0), 1)
            p_dur = random.choice([3, 6, 12, 18, 24, 36])
            p_freq = random.choice([1, 2, 3, 4, 8])
            p_contact = random.choice(CONTACT_METHODS)

        phone_num = f"+1 (555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"

        patient = Patient(
            hospital_id=hospital.id,
            patient_id_code=p_code,
            name=p_name,
            age=p_age,
            gender=p_gender,
            phone=phone_num,
            department=p_dept,
            distance_km=p_dist,
            treatment_duration_months=p_dur,
            appointment_frequency_weeks=p_freq,
            priority_override="HIGH" if p_code == "P1092" else None,
            override_reason="Recent hospitalization alert" if p_code == "P1092" else None,
            preferred_contact_method=p_contact,
            whatsapp_number=phone_num,
            last_contacted_at=now - timedelta(days=random.randint(1, 14)),
            contact_attempt_count=random.randint(1, 4),
            appointment_confirmed=random.random() > 0.4
        )
        patients_to_add.append(patient)

    if patients_to_add:
        db.add_all(patients_to_add)
        db.commit()

    # Generate Predictions, Appointments, & Outreach Logs in batch
    all_patients = db.query(Patient).all()
    existing_preds = {pred.patient_id for pred in db.query(Prediction.patient_id).all()}

    preds_to_add = []
    appts_to_add = []
    interventions_to_add = []
    outreach_logs_to_add = []

    for p in all_patients:
        if p.id in existing_preds:
            continue

        total_appts = random.randint(4, 12)
        missed_appts = random.randint(0, min(5, total_appts))
        days_since = random.randint(5, 45)

        for k in range(3):
            days_ago = (3 - k) * 21
            status = "Attended" if random.random() > 0.3 else "Missed"
            appts_to_add.append(Appointment(
                hospital_id=hospital.id,
                patient_id=p.id,
                appointment_date=now - timedelta(days=days_ago),
                status=status,
                notes=f"Follow-up visit #{k+1}"
            ))

        appts_to_add.append(Appointment(
            hospital_id=hospital.id,
            patient_id=p.id,
            appointment_date=now + timedelta(days=random.randint(2, 28)),
            status="Scheduled",
            notes="Upcoming follow-up visit"
        ))

        pred_res = calculate_patient_risk(
            age=p.age,
            distance_km=p.distance_km,
            treatment_duration_months=p.treatment_duration_months,
            appointment_frequency_weeks=p.appointment_frequency_weeks,
            total_appointments=total_appts,
            missed_appointments=missed_appts,
            days_since_last_visit=days_since
        )

        prev_risk = max(0, pred_res["risk_score"] - random.choice([0, 5, 12, 18, 22]))
        risk_change = pred_res["risk_score"] - prev_risk
        risk_pct = round((risk_change / max(1, prev_risk)) * 100, 1)

        pred = Prediction(
            hospital_id=hospital.id,
            patient_id=p.id,
            risk_score=pred_res["risk_score"],
            risk_level=pred_res["risk_level"],
            previous_risk_score=prev_risk,
            risk_change=risk_change,
            risk_change_percentage=risk_pct,
            prediction_engine="Transparent Weighted Rule Engine v2.0",
            prediction_version="v2.0.0",
            risk_factors=pred_res["risk_factors"],
            recommended_action=pred_res["recommended_action"]
        )
        preds_to_add.append(pred)

        if pred_res["risk_level"] == "HIGH":
            outreach_logs_to_add.append(OutreachLog(
                hospital_id=hospital.id,
                patient_id=p.id,
                channel="Phone",
                message_type="High-Risk Phone Call",
                status="Sent",
                attempted_at=now - timedelta(hours=random.randint(1, 24)),
                delivered_at=now - timedelta(hours=random.randint(1, 24)),
                response="Appointment Confirmed" if random.random() > 0.5 else "Callback Requested",
                created_by="Nurse Robert Chen"
            ))
        elif pred_res["risk_level"] == "LOW":
            outreach_logs_to_add.append(OutreachLog(
                hospital_id=hospital.id,
                patient_id=p.id,
                channel=p.preferred_contact_method or "SMS",
                message_type="Automated Reminder (English)",
                status="Delivered",
                attempted_at=now - timedelta(hours=random.randint(2, 48)),
                delivered_at=now - timedelta(hours=random.randint(2, 48)),
                response="Appointment Confirmed",
                created_by="CareTrack Automated Dispatcher"
            ))

    if appts_to_add:
        db.add_all(appts_to_add)
    if preds_to_add:
        db.add_all(preds_to_add)
    if outreach_logs_to_add:
        db.add_all(outreach_logs_to_add)

    # Data Quality Log
    if db.query(DataQualityLog).count() == 0:
        db.add(DataQualityLog(
            hospital_id=hospital.id,
            filename="hospital_patient_history_v2.csv",
            records_processed=num_patients,
            valid_records=int(num_patients * 0.94),
            invalid_records=int(num_patients * 0.06),
            completeness_score=94.0
        ))

    db.commit()
    print(f"[MySQL] Seeding complete! Populated {num_patients} patients and outreach logs.")
