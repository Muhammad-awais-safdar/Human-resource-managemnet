# 23 — Internal HR Help Desk & Ticketing UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: HR Operations Designers, Frontend Engineers, Support System Architects
- **Cross-References**: `09_Component_Library.md`, `14_Table_Standards.md`, `26_Notifications_UI.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Internal HR Help Desk & Service Desk Module. It covers the Ticket Queue Table, Real-Time Chat/Thread Inspector, SLA Breach Countdown Timers, and Knowledge Base Reader.

---

## 2. Executive Overview

Employees frequently require assistance with benefits, tax documentation, payroll queries, or equipment requests. Awais HR provides a unified Help Desk ticket queue, SLA countdown badges, canned macro responses, and an integrated Knowledge Base reader to deflect common inquiries.

---

## 3. Detailed Specifications

### 3.1 Help Desk Ticket Queue Workspace

```
┌────────────────────────────────────────────────────────────────────────┐
│ HR HELP DESK TICKET QUEUE                                              │
├────────────────────────────────────────────────────────────────────────┤
│ [Search Ticket #, Subject, Employee...] [Filter Priority] [Filter SLA] │
├────────────────────────────────────────────────────────────────────────┤
│ TICKET ID │ SUBJECT               │ REQUESTER    │ PRIORITY │ SLA REM  │
│ 🎫 T-1048 │ Tax Form W2 Request   │ Michael Chang│ High 🔴  │ 42m ⚠️   │
│ 🎫 T-1045 │ Address Change Update │ Sarah Jenkins│ Normal 🟡│ 4h 12m   │
│ 🎫 T-1042 │ Health Insurance Claim│ David Miller │ Low 🟢   │ 1d 08h   │
└───────────┴───────────────────────┴──────────────┴──────────┴──────────┘
```

### 3.2 Ticket Thread & Response Inspector Drawer
- **Header**: Ticket ID, Subject, Status Dropdown (`Open`, `In Progress`, `Resolved`, `Closed`).
- **Thread Message History**: Timestamped chat bubble messages with internal agent notes (`Yellow Tint Box`) hidden from the employee.
- **Canned Macro Trigger Bar**: One-click insertion of frequent responses (`"Insert W2 Request Instructions"`).

---

## 4. Design Decisions & Rationale

- **SLA Breach Visual Alerts**: Tickets nearing SLA breach (< 1 hour remaining) display animated red urgency badges (`animate-pulse bg-rose-500/20 text-rose-400`).
- **Internal Agent Notes vs. Public Replies**: Clear visual separation between internal notes (yellow background with lock icon) and public replies to prevent accidental customer leaks.

---

## 5. Examples & Implementation Contracts

```jsx
// SLA Countdown Badge Component Contract
export function SLACountdownBadge({ minutesRemaining }) {
  const isBreached = minutesRemaining <= 0;
  const isUrgent = minutesRemaining > 0 && minutesRemaining <= 60;

  if (isBreached) {
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 animate-pulse">SLA BREACHED</span>;
  }

  if (isUrgent) {
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">{minutesRemaining}m Remaining</span>;
  }

  const hours = Math.floor(minutesRemaining / 60);
  return <span className="text-[11px] font-medium text-[var(--text-secondary)]">{hours}h {minutesRemaining % 60}m</span>;
}
```

---

## 6. Best Practices

- **Enable Knowledge Base Deflection**: Suggest relevant Knowledge Base articles in real time as the employee types their ticket subject.
- **Support File Attachments**: Allow easy drag-and-drop file uploading (PDF, PNG, JPG) within the ticket thread.

---

## 7. Future Considerations

- **AI Auto-Responder Bot**: AI Copilot drafting instant initial responses to routine HR inquiries with manager approval review.
