# 21 — Learning Management System (LMS) UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: LMS Designers, Frontend Engineers, Video UX Specialists
- **Cross-References**: `09_Component_Library.md`, `15_Employee_Module_UI.md`, `20_Performance_Module_UI.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Learning Management System (LMS) Module. It covers the Course Catalog Grid, Video Player Interface, Quiz Assessment Engine, and Employee Skill Certification Tracker.

---

## 2. Executive Overview

Continuous learning is critical for employee growth and compliance (e.g., mandatory annual security training). Awais HR delivers a modern course catalog, video learning player with playback position memory, interactive quiz assessments, and downloadable certificate generation.

---

## 3. Detailed Specifications

### 3.1 Course Catalog & Learning Dashboard Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ LMS COURSE CATALOG & LEARNING HUB                                      │
├────────────────────────────────────────────────────────────────────────┤
│ [Search Courses, Skills...]  [Filter Category] [Mandatory Compliance Only]│
├────────────────────────────────────────────────────────────────────────┤
│ COURSE CARD                │ CATEGORY     │ PROGRESS   │ ACTIONS       │
│ 🎓 SOC2 Security Training   │ Compliance   │ 100% Done  │ [Certificate] │
│ 🎓 Lead Management 101     │ Management   │ 45% (In P) │ [Continue]    │
│ 🎓 React 19 Architecture   │ Engineering  │ 0% Not St  │ [Start]       │
└────────────────────────────┴──────────────┴────────────┴───────────────┘
```

### 3.2 Integrated Video Player & Lesson Sidebar Layout
- **Left/Center Canvas**: Video player with custom HTML5 controls (Playback Speed 1x-2x, Fullscreen, Subtitles).
- **Right Sidebar**: Course lesson outline with module completion checkmarks.

---

## 4. Design Decisions & Rationale

- **Mandatory Compliance Banners**: Overdue compliance courses render a persistent amber warning banner on the employee's main dashboard until completed.

---

## 5. Examples & Implementation Contracts

```jsx
// Course Card Component Contract
export function CourseCard({ title, category, duration, progress, isMandatory, thumbnailUrl, onStart }) {
  return (
    <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[var(--accent-primary)] transition-all">
      <div className="relative h-36 bg-[var(--bg-surface-l2)]">
        <img src={thumbnailUrl || '/course-placeholder.png'} alt={title} className="w-full h-full object-cover" />
        {isMandatory && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white">
            REQUIRED
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">{category}</span>
        <h4 className="font-bold text-sm text-[var(--text-primary)] line-clamp-2">{title}</h4>
        <div className="text-xs text-[var(--text-muted)] flex justify-between mt-1">
          <span>Duration: {duration}</span>
          <span>{progress}% Completed</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--bg-surface-l2)] rounded-full overflow-hidden mt-1">
          <div className="h-full bg-[var(--accent-primary)] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <button onClick={onStart} className="mt-3 w-full py-2 text-xs font-bold bg-[var(--accent-primary)] text-white rounded-lg hover:brightness-110">
          {progress > 0 ? 'Continue Course' : 'Start Course'}
        </button>
      </div>
    </div>
  );
}
```

---

## 6. Best Practices

- **Save Video Progress Continuously**: Save video playback position every 5 seconds to allow seamless resumption across devices.
- **Generate Print-Ready Certificates**: Render certificates as downloadable vector PDF files with verification QR codes.

---

## 7. Future Considerations

- **Interactive Code Playgrounds**: Embedded WebContainers enabling real-time code editing and execution directly within developer training lessons.
