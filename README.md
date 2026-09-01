# 🩺 MedPulse Healthcare Platform

### Explainable Patient Follow-up Risk & Intervention Platform

> **Predict risk. Understand why. Act earlier.**

MedPulse is a full-stack healthcare decision-support platform designed to help hospitals identify patients who are at risk of missing critical follow-up appointments.

The platform combines an **explainable weighted risk engine**, patient analytics, intervention recommendations, and a priority-based outreach workflow so that care teams can focus their attention on patients who need it most.

---

## 🎯 Problem Statement

Hospitals often manage thousands of patients requiring regular follow-ups.

However, identifying which patients are most likely to miss their next appointment can be difficult when relying on manual tracking alone.

MedPulse addresses this problem by:

- Identifying patients with elevated follow-up risk
- Ranking patients according to their risk score
- Explaining exactly why a patient received their score
- Recommending appropriate follow-up interventions
- Providing an intervention queue for care teams
- Allowing healthcare teams to simulate "what-if" scenarios
- Visualizing hospital-level risk trends and patterns

---

# 🚀 Key Features

## 1. 🧮 Explainable Weighted Risk Engine

MedPulse calculates a patient follow-up risk score from:

**0 – 100**

### Risk Categories

| Score | Risk Level |
|------:|------------|
| 0 – 29 | 🟢 LOW |
| 30 – 59 | 🟡 MEDIUM |
| 60 – 100 | 🔴 HIGH |

The engine evaluates six measurable parameters:

1. Missed appointments
2. Attendance history
3. Distance from hospital
4. Treatment duration
5. Appointment frequency
6. Patient age

### Mathematical Traceability

Every displayed risk score is directly derived from its contributing factors.

```text
Total Risk Score
=
Missed Appointment Score
+
Attendance Score
+
Distance Score
+
Treatment Duration Score
+
Appointment Frequency Score
+
Age Score
