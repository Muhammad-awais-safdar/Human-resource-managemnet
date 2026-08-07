# 16 — Attendance, Shift Rosters & Time Tracking UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Workforce Engineers, UI Designers, Mobile UX Architects
- **Cross-References**: `12_Dashboard_UX.md`, `14_Table_Standards.md`, `28_Mobile_Responsive.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Attendance & Time Tracking Module. It specifies the real-time Clock-In/Out widget, shift roster calendar, overtime approval drawer, and attendance anomaly tracking matrix.

---

## 2. Executive Overview

Timekeeping accuracy directly impacts payroll execution and labor law compliance. The Attendance module delivers instant clock-in triggers, real-time geofence validation feedback, visual shift assignment grids, and anomaly detection highlights (e.g., late arrivals, unexcused absences).

---

## 3. Detailed Specifications

### 3.1 Real-Time Clock-In Widget Anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ REAL-TIME ESS CLOCK-IN WIDGET                                          │
├────────────────────────────────────────────────────────────────────────┤
│ ⏰ 09:42:15 AM   |  Current Shift: Morning Core (09:00 - 17:00)       │
│ Location: Main HQ Office (Geofence Verified 🟢)                        │
├────────────────────────────────────────────────────────────────────────┤
│  [ 🟢 CLOCK IN NOW ]  │  [ ☕ TAKE BREAK ]  │  [ 🔴 CLOCK OUT ]        │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Shift Roster Calendar Matrix View
- **Grid Layout**: 7-day or 14-day horizontal timeline grid.
- **Shift Cards**: Color-coded pill nodes (e.g. Morning `#3b82f6`, Evening `#a855f7`, Night `#1e293b`).
- **Drag-and-Drop Reassignment**: Managers can drag shifts between employees with real-time overtime alert validation.

---

## 4. Design Decisions & Rationale

- **Visual Anomaly Indicators**: Late arrivals (>15 mins) display amber warning tags (`#f59e0b`), while missing clock-outs trigger red alert highlight tags (`#ef4444`).
- **One-Click Bulk Shift Approval**: Managers can approve entire team attendance logs for the week in a single click with preview validation.

---

## 5. Examples & Implementation Contracts

```jsx
// Real-Time Clock-In Action Component Pattern
import React, { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';

export function ClockInWidget({ onClockIn, isClockedIn }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  return (
    <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col items-center text-center">
      <div className="text-3xl font-extrabold text-[var(--text-primary)] font-mono tabular-nums mb-2 flex items-center gap-2">
        <Clock className="w-6 h-6 text-[var(--accent-primary)] animate-pulse" /> {time}
      </div>
      <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mb-6">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Geofence Verified: London Office
      </div>
      <button
        onClick={onClockIn}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-md ${
          isClockedIn
            ? 'bg-[var(--accent-danger)] hover:brightness-110 text-white'
            : 'bg-[var(--accent-success)] hover:brightness-110 text-white'
        }`}
      >
        {isClockedIn ? 'Clock Out' : 'Clock In Now'}
      </button>
    </div>
  );
}
```

---

## 6. Best Practices

- **Provide Geofence Fallbacks**: If GPS location fails, allow manual clock-in with mandatory manager approval notes.
- **Maintain Clear Time Formatting**: Always display timestamps with explicit AM/PM indicators or 24-hour notation based on tenant regional settings.

---

## 7. Future Considerations

- **Biometric Facial Verification Interface**: Integrated webcam clock-in verification for warehouse and retail branch workers.
