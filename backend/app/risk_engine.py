from typing import Dict, Any, List, Optional

def calculate_patient_risk(
    age: int,
    distance_km: float,
    treatment_duration_months: int = 12,
    appointment_frequency_weeks: int = 2,
    total_appointments: int = 10,
    missed_appointments: int = 2,
    days_since_last_visit: int = 14,
    attended_appointments: Optional[int] = None,
    appointment_frequency_days: Optional[int] = None,
    next_followup_days_away: int = 7,
    low_threshold: int = 29,
    medium_threshold: int = 59
) -> Dict[str, Any]:
    """
    Transparent Weighted Rule Engine for CareTrack AI.
    Calculates risk score, risk level, traceable contributing factors, and recommendations.
    """
    if attended_appointments is not None:
        tot = max(1, attended_appointments + missed_appointments)
    else:
        tot = max(1, total_appointments)

    att_count = max(0, tot - missed_appointments)
    attendance_rate = att_count / tot

    freq_days = appointment_frequency_days if appointment_frequency_days is not None else (appointment_frequency_weeks * 7)

    # 1. Missed Appointments Score (Max 30)
    if missed_appointments == 0:
        missed_score = 0
        missed_severity = "Low"
        missed_reason = f"0 missed visits out of {tot} scheduled appointments."
    elif missed_appointments == 1:
        missed_score = 10
        missed_severity = "Low"
        missed_reason = f"Missed 1 of the previous {tot} appointments."
    elif missed_appointments == 2:
        missed_score = 20
        missed_severity = "Medium"
        missed_reason = f"Missed 2 of the previous {tot} appointments."
    elif missed_appointments == 3:
        missed_score = 25
        missed_severity = "High"
        missed_reason = f"Missed 3 of the previous {tot} appointments."
    else:
        missed_score = 30
        missed_severity = "High"
        missed_reason = f"Missed {missed_appointments} of the previous {tot} appointments."

    # 2. Attendance Rate Score (Max 20)
    if attendance_rate >= 0.90:
        attendance_score = 0
        attendance_severity = "Low"
        attendance_reason = f"High historical attendance rate of {int(attendance_rate * 100)}%."
    elif attendance_rate >= 0.75:
        attendance_score = 5
        attendance_severity = "Low"
        attendance_reason = f"Moderate historical attendance rate of {int(attendance_rate * 100)}%."
    elif attendance_rate >= 0.60:
        attendance_score = 12
        attendance_severity = "Medium"
        attendance_reason = f"Reduced historical attendance rate of {int(attendance_rate * 100)}%."
    else:
        attendance_score = 20
        attendance_severity = "High"
        attendance_reason = f"Low historical attendance rate of {int(attendance_rate * 100)}%."

    # 3. Distance Score (Max 15)
    if distance_km <= 5:
        distance_score = 0
        distance_severity = "Low"
        distance_reason = f"Patient lives nearby ({distance_km:.1f} km from hospital)."
    elif distance_km <= 15:
        distance_score = 5
        distance_severity = "Low"
        distance_reason = f"Patient lives {distance_km:.1f} km from hospital."
    elif distance_km <= 25:
        distance_score = 10
        distance_severity = "Medium"
        distance_reason = f"Patient lives a moderate distance ({distance_km:.1f} km) from hospital."
    else:
        distance_score = 15
        distance_severity = "High"
        distance_reason = f"Patient lives a significant distance ({distance_km:.1f} km) from hospital."

    # 4. Days Since Last Visit / Frequency (Max 15)
    if days_since_last_visit <= 14:
        days_score = 0
        days_severity = "Low"
        days_reason = f"Recent care contact ({days_since_last_visit} days ago)."
    elif days_since_last_visit <= 30:
        days_score = 5
        days_severity = "Low"
        days_reason = f"Care contact was {days_since_last_visit} days ago."
    elif days_since_last_visit <= 45:
        days_score = 10
        days_severity = "Medium"
        days_reason = f"Extended gap since last visit ({days_since_last_visit} days ago)."
    else:
        days_score = 15
        days_severity = "High"
        days_reason = f"Significant gap since last visit ({days_since_last_visit} days ago)."

    # 5. Treatment Duration (Max 10)
    if treatment_duration_months >= 12:
        duration_score = 10
        duration_severity = "Medium"
        duration_reason = f"Long-term chronic care treatment ({treatment_duration_months} months)."
    elif treatment_duration_months >= 6:
        duration_score = 5
        duration_severity = "Low"
        duration_reason = f"Ongoing treatment regimen ({treatment_duration_months} months)."
    else:
        duration_score = 0
        duration_severity = "Low"
        duration_reason = f"Short-term treatment ({treatment_duration_months} months)."

    # 6. Senior Age (Max 10)
    if age >= 70:
        age_score = 10
        age_severity = "Medium"
        age_reason = f"Senior patient age ({age} years)."
    elif age >= 60:
        age_score = 5
        age_severity = "Low"
        age_reason = f"Mature patient age ({age} years)."
    else:
        age_score = 0
        age_severity = "Low"
        age_reason = f"Patient age is {age} years."

    raw_total = missed_score + attendance_score + distance_score + days_score + duration_score + age_score
    risk_score = min(100, max(0, raw_total))

    if risk_score >= 65:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    risk_factors = [
        {"factor": "Missed appointments", "impact_points": missed_score, "severity": missed_severity, "value": f"{missed_appointments} missed", "description": missed_reason},
        {"factor": "Attendance history", "impact_points": attendance_score, "severity": attendance_severity, "value": f"{int(attendance_rate*100)}%", "description": attendance_reason},
        {"factor": "Travel distance", "impact_points": distance_score, "severity": distance_severity, "value": f"{distance_km} km", "description": distance_reason},
        {"factor": "Days since last visit", "impact_points": days_score, "severity": days_severity, "value": f"{days_since_last_visit} days", "description": days_reason},
        {"factor": "Treatment duration", "impact_points": duration_score, "severity": duration_severity, "value": f"{treatment_duration_months} mos", "description": duration_reason},
        {"factor": "Patient age", "impact_points": age_score, "severity": age_severity, "value": f"{age} yrs", "description": age_reason},
    ]

    # Sort risk factors by impact score
    risk_factors.sort(key=lambda x: x["impact_points"], reverse=True)

    # Action Recommendation Rules
    if risk_level == "HIGH":
        recommended_action = "Initiate phone call outreach within 24 hours & offer transportation assistance."
    elif risk_level == "MEDIUM":
        recommended_action = "Send SMS reminder & check appointment rescheduling preference."
    else:
        recommended_action = "Standard automated pre-visit notification."

    factors_detail = [
        {
            "factor_name": f["factor"],
            "impact_score": f["impact_points"],
            "severity": f["severity"],
            "reason": f["description"]
        }
        for f in risk_factors
    ]

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "factors_detail": factors_detail,
        "reasons": [f["description"] for f in risk_factors if f["impact_points"] > 0],
        "recommended_action": recommended_action,
        "recommended_actions": [recommended_action],
        "data_completeness": 100.0
    }
