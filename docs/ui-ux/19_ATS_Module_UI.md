# 19 — Recruitment (ATS) & Candidate Pipeline UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Talent Acquisition Designers, Frontend Engineers, ATS Architects
- **Cross-References**: `09_Component_Library.md`, `13_Form_Standards.md`, `15_Employee_Module_UI.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Recruitment & Applicant Tracking System (ATS) Module. It covers the Drag-and-Drop Candidate Kanban Board, Candidate Resume Inspector Drawer, Interview Scorecards, and Job Board Builder.

---

## 2. Executive Overview

The ATS module optimizes the hiring workflow for recruiters and hiring managers. It features a drag-and-drop Kanban pipeline board, side-by-side resume PDF parsing inspection, automated interview scheduling, and structured candidate evaluation scorecards.

---

## 3. Detailed Specifications

### 3.1 Candidate Recruitment Kanban Board Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│ ATS RECRUITMENT KANBAN PIPELINE (Job: Senior Frontend Engineer)        │
├───────────────┬───────────────┬───────────────┬───────────────┬────────┤
│ APPLIED (24)  │ SCREENING (8) │ INTERVIEW (4) │ OFFER (2)     │ HIRED (1)│
├───────────────┼───────────────┼───────────────┼───────────────┼────────┤
│ [Card: Alex]  │ [Card: Sarah] │ [Card: David] │ [Card: Emma]  │ [Card] │
│ - Score: 4.8★ │ - Score: 4.5★ │ - Today 2 PM  │ - Sent 2d ago │        │
│ [Card: John]  │ [Card: Lisa]  │               │               │        │
└───────────────┴───────────────┴───────────────┴───────────────┴────────┘
```

### 3.2 Candidate Inspector Drawer & Scorecard Split View
- **Left Column (Resume Viewer)**: Embedded PDF previewer with text search highlighting.
- **Right Column (Candidate Profile & Scorecard)**: Evaluation criteria (Technical Skills, Culture Fit, Communication) rated on a 5-star scale with interviewer feedback comments.

---

## 4. Design Decisions & Rationale

- **Drag-and-Drop Stage Transitions**: Moving a candidate card from "Screening" to "Interview" triggers a spring-animated card drop effect while opening a quick prompt to schedule an interview or select interviewers.
- **Color-Coded Rating Badges**: High-score candidates (> 4.5★) feature a gold star badge (`bg-amber-500/15 text-amber-400`).

---

## 5. Examples & Implementation Contracts

```jsx
// Candidate Kanban Card Component Contract
export function CandidateKanbanCard({ name, role, rating, avatarUrl, tags, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-lg p-3.5 flex flex-col gap-2 hover:border-[var(--accent-primary)] cursor-grab active:cursor-grabbing transition-all shadow-sm"
    >
      <div className="flex items-center gap-2.5">
        <img src={avatarUrl || '/default-avatar.png'} alt={name} className="w-8 h-8 rounded-full object-cover" />
        <div className="overflow-hidden">
          <h5 className="font-bold text-xs text-[var(--text-primary)] truncate">{name}</h5>
          <p className="text-[11px] text-[var(--text-secondary)] truncate">{role}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1 pt-2 border-t border-[var(--border-subtle)]">
        <span className="text-[11px] font-semibold text-amber-400">★ {rating} / 5.0</span>
        <div className="flex gap-1">
          {tags?.map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-surface-l2)] text-[var(--text-muted)]">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Best Practices

- **Support PDF Resume Fullscreen**: Allow recruiters to expand the candidate resume previewer to fullscreen with one click.
- **Automate Rejection Emails**: When moving candidates to "Rejected", prompt an optional personalized rejection email template.

---

## 7. Future Considerations

- **AI Resume Match Score**: Automated NLP algorithms rating candidates based on job requisition skill match percentages.
