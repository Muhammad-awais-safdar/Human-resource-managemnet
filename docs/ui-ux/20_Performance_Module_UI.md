# 20 — Performance Management & 9-Box Grid UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Performance HR Leads, Frontend Engineers, Data UX Designers
- **Cross-References**: `12_Dashboard_UX.md`, `15_Employee_Module_UI.md`, `25_Analytics_UI.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Performance Management Module. It covers 360-degree feedback reviews, OKR goal progress tracking, quarterly appraisal wizards, and the 9-box talent matrix.

---

## 2. Executive Overview

Performance management drives talent retention and leadership succession. Awais HR provides interactive OKR goal trees, self-and-manager review review forms, 360-degree feedback collection, and an interactive 9-Box Talent Matrix grid.

---

## 3. Detailed Specifications

### 3.1 9-Box Talent Matrix Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9-BOX TALENT MATRIX (Performance vs. Potential)                       │
├─────────────────┬──────────────────┬──────────────────┬────────────────┤
│ POTENTIAL \ PERF│ LOW PERFORMANCE  │ MEDIUM PERF      │ HIGH PERF      │
├─────────────────┼──────────────────┼──────────────────┼────────────────┤
│ HIGH POTENTIAL  │ Enigma           │ Growth Star      │ Star Performer │
│                 │ (3 Employees)    │ (8 Employees)    │ (14 Employees) │
├─────────────────┼──────────────────┼──────────────────┼────────────────┤
│ MEDIUM POTENTIAL│ Core Dilemma     │ Core Performer   │ High Keeper    │
│                 │ (5 Employees)    │ (22 Employees)   │ (11 Employees) │
├─────────────────┼──────────────────┼──────────────────┼────────────────┤
│ LOW POTENTIAL   │ Risk / Action    │ Solid Worker     │ High Professional│
│                 │ (2 Employees)    │ (9 Employees)    │ (6 Employees)  │
└─────────────────┴──────────────────┴──────────────────┴────────────────┘
```

### 3.2 OKR Goal Progress Tree Component
- **Goal Cards**: Display objective title, owner avatar, key result milestones, and animated progress bar (`74% Completed`).
- **Interactive Check-ins**: Slide-over drawer for updating key result metric values with weekly comment updates.

---

## 4. Design Decisions & Rationale

- **Drag-and-Drop 9-Box Placement**: HR directors can drag employee nodes between 9-box grid quadrants during talent calibration meetings, with real-time justification log prompts.
- **Color-Coded Goal Status**: OKRs behind schedule highlight in red (`#ef4444`), on track in green (`#10b981`), and at risk in amber (`#f59e0b`).

---

## 5. Examples & Implementation Contracts

```jsx
// OKR Goal Progress Widget Contract
export function OKRGoalCard({ objective, ownerName, progress, keyResultsCount, dueDate }) {
  return (
    <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">Quarterly Objective</span>
          <h4 className="font-bold text-sm text-[var(--text-primary)] mt-0.5">{objective}</h4>
        </div>
        <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-[var(--bg-surface-l2)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--accent-primary)] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between items-center text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
        <span>Owner: {ownerName}</span>
        <span>{keyResultsCount} Key Results</span>
        <span>Due: {dueDate}</span>
      </div>
    </div>
  );
}
```

---

## 6. Best Practices

- **Support Peer Anonymity Controls**: Clearly indicate whether 360-degree peer feedback reviews are anonymous or visible to the reviewee.
- **Maintain Review History**: Provide historical performance trend charts across multiple annual review cycles.

---

## 7. Future Considerations

- **AI Feedback Summarizer**: Automated sentiment analysis summarizing 360-degree peer reviews into constructive summary bullets for managers.
