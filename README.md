Medpulse — Explainable Patient Follow-up Risk & Intervention Platform

> **Predict risk. Understand why. Act earlier.**

CareTrack AI is a full-stack healthcare decision-support application built for hospitals to identify, rank, explain, and prioritize patient follow-up outreach before patients miss critical appointments.

---

## Key Features

1. **Transparent Weighted Risk Engine**:
   - Scores patient follow-up risk from **0 to 100**.
   - Categorizes risk into **LOW (0-29)**, **MEDIUM (30-59)**, and **HIGH (60-100)**.
   - Evaluates 6 weighted parameters: Missed appointments, Attendance history, Distance to hospital, Treatment duration, Appointment frequency, and Age.
   - **Mathematically Traceable**: Every displayed score is directly equal to the sum of its contributing factor scores.

2. **Explainability Engine**:
   - Generates granular factor breakdown cards with point impact, severity rating, and human-readable reasons strictly derived from scoring inputs.

3. **Recommendation & Workflow Engine**:
   - Converts risk factors into actionable clinical workflow suggestions (e.g. personal phone outreach, checking transport barriers, teleconsultation eligibility).

4. **Priority Intervention Queue & Management**:
   - Ranks all patients by risk score descending.
   - Enables care teams to assign, start, complete, and track follow-up outreach tasks.

5. **Interactive Risk Simulator**:
   - Live sliders for what-if scenario testing (e.g. changing appointment frequency or distance to visualize instant score impact).

6. **Hospital Analytics & Trends**:
   - Interactive charts built with Recharts visualizing department distributions, distance vs. risk scatter plots, and missed visit trends.

7. **1,000 Synthetic Patient Dataset & Predefined Demo Patients**:
   - `P1024`: Demo Patient A (High Risk ~92 - Eleanor Vance)
   - `P1092`: Demo Patient B (High Risk ~78 - Marcus Thorne)
   - `P1134`: Demo Patient C (Medium Risk ~47 - Clara Oswald)
   - `P1201`: Demo Patient D (Low Risk ~0 - David Tennant)

8. **Role-Based Access & Demo Controls**:
   - Roles: Admin, Doctor, Nurse, Reception.
   - Quick Demo Login: `admin@caretrack.ai` / `demo123`.

---

## Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy, Pydantic, SQLite
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React, Axios, React Router v6

---

## Running the Application

### 1. Backend Server (FastAPI)
```bash
cd caretrack-ai/backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger): `http://localhost:8000/docs`

### 2. Frontend Development Server (React Vite)
```bash
cd caretrack-ai/frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## Healthcare Decision-Support Disclaimer

CareTrack AI is a decision-support prototype designed to help prioritize follow-up outreach. It does not diagnose disease, determine treatment, or replace clinical judgment.
