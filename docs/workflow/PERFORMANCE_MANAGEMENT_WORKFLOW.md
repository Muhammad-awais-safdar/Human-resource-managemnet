# Awais HR — Performance Management 360 Appraisal Workflow Architecture

## 1. Overview

Phase 14 refactors **Performance Management** into a multi-actor **360-Degree Appraisal Review Cycle** with strict 1-5 rating validation, self-evaluation guards, and step-by-step history logs (`appraisal_cycle_log`).

---

## 2. 360 Appraisal State Machine

```
SELF_APPRAISAL ──► PEER_REVIEW ──► MANAGER_REVIEW ──► CALIBRATION ──► FINALIZED ──► ACKNOWLEDGED
```

1. **`SELF_APPRAISAL`**: Employee submits self-rating (1-5) and self-summary.
2. **`PEER_REVIEW`**: Peer feedback submitted anonymously or confidentially.
3. **`MANAGER_REVIEW`**: Line Manager evaluates employee performance (`evaluatorId != employeeId`).
4. **`CALIBRATION`**: HR Admin/Executive calibrates final score.
5. **`FINALIZED`**: Appraisal completed and released to employee.
6. **`ACKNOWLEDGED`**: Employee formally acknowledges review.

---

## 3. Core Security & Business Guarantees

1. **Rating Boundaries**: Ratings must strictly adhere to the integer scale $[1, 5]$. Invalid ratings throw `IllegalArgumentException`.
2. **Manager Self-Evaluation Protection**: Managers CANNOT act as evaluators for their own performance appraisal.
3. **Audit Cycle Log**: All state transitions record actor email, previous status, new status, and timestamp in `appraisal_cycle_log`.
4. **Declarative Audit**: Tagged with `@Auditable(action = "APPRAISAL_CYCLE_START", entity = "PerformanceCycle")`, `@Auditable(action = "APPRAISAL_SELF_SUBMIT", entity = "PerformanceAppraisal")`, and `@Auditable(action = "APPRAISAL_CALIBRATE", entity = "PerformanceAppraisal")`.

---

## 4. Schema Reference (`V62__Performance_360_Appraisal_Workflow.sql`)

### `performance_review_cycle`
- `id` (VARCHAR(36) PRIMARY KEY)
- `title` (VARCHAR(150) NOT NULL)
- `review_period` (VARCHAR(30) NOT NULL)
- `status` (VARCHAR(30))
- `start_date`, `end_date` (DATE)

### `employee_appraisal_360`
- `id` (VARCHAR(36) PRIMARY KEY)
- `cycle_id` (VARCHAR(36) FOREIGN KEY)
- `employee_id` (VARCHAR(50) FOREIGN KEY)
- `evaluator_id` (VARCHAR(50) FOREIGN KEY)
- `self_rating`, `manager_rating`, `calibrated_rating` (INT)
- `status` (VARCHAR(30))
