# 26 — Notifications Engine, Toast System & Alert Drawer UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: UI Engineers, Notification Architects, Messaging Specialists
- **Cross-References**: `04_Color_System.md`, `09_Component_Library.md`, `10_Layout_System.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Notification & Alerting Engine in Awais HR. It covers the Notification Center Drawer, Toast Notifications, Preference Toggle Matrix, and Real-Time WebSocket Alerts.

---

## 2. Executive Overview

Notifications inform users about time-sensitive actions—such as leave request approvals, payroll execution alerts, security logins, and candidate applications. Awais HR uses a 3-tier notification system:
1. **Persistent Notification Drawer**: Accessible from the top navbar bell icon.
2. **Transient Toast Notifications**: Non-intrusive bottom-right feedback toasts.
3. **Email & Push Notification Channel Preference Settings**.

---

## 3. Detailed Specifications

### 3.1 Notification Center Drawer Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ NOTIFICATION CENTER DRAWER                                             │
├────────────────────────────────────────────────────────────────────────┤
│ Notifications (4 Unread)           [ Mark All as Read ] [ Settings ⚙️] │
├────────────────────────────────────────────────────────────────────────┤
│ [ All ]  [ Approvals ]  [ Security ]  [ System ]                       │
├────────────────────────────────────────────────────────────────────────┤
│ 🟢 Leave Request Approved                                 │ 10m ago    │
│ Your vacation request for Aug 12-15 was approved by Sarah│ [ View ]   │
├────────────────────────────────────────────────────────────────────────┤
│ ⚠️ Security Alert                                         │ 1h ago     │
│ New admin login detected from IP 185.220.101.5           │ [ Review ] │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Toast Alert Variant Matrix

| Toast Intent | Border / Accent Color | Left Icon | Timeout Duration | Target Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#10b981` (Emerald) | CheckCircle2 | 4000ms | Record saved, leave approved |
| **Error** | `#ef4444` (Red) | AlertCircle | 6000ms (Manual Close) | Network failure, invalid field |
| **Warning** | `#f59e0b` (Amber) | AlertTriangle | 5000ms | Approaching seat limit |
| **Info** | `#3b82f6` (Blue) | Info | 4000ms | Background export completed |

---

## 4. Design Decisions & Rationale

- **Non-Blocking Toast Positioning**: Toasts spawn at the `bottom-right` screen coordinate (`z-60`), ensuring they never obscure primary top navigation triggers or central form inputs.
- **WebSocket Real-Time Unread Badge**: The top navbar bell icon displays a subtle pulse indicator (`animate-ping bg-indigo-500`) when a new real-time event arrives via WebSockets.

---

## 5. Examples & Implementation Contracts

```jsx
// Toast Notification Component Contract
import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastItem({ title, message, type = 'success', onClose }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40',
    warning: 'border-amber-500/40',
    error: 'border-rose-500/40',
    info: 'border-blue-500/40',
  };

  return (
    <div className={`bg-[#1a1a22] border ${borders[type]} rounded-xl p-4 shadow-xl flex items-start gap-3 w-80 backdrop-blur-md`}>
      {icons[type]}
      <div className="flex-1 overflow-hidden">
        <h5 className="text-xs font-bold text-[var(--text-primary)]">{title}</h5>
        {message && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{message}</p>}
      </div>
      <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

## 6. Best Practices

- **Limit Maximum Toast Stack**: Display a maximum of 3 visible toasts simultaneously; queue additional toasts.
- **Group Notifications by Date**: In the notification drawer, group alerts under "Today", "Yesterday", and "Earlier This Week".

---

## 7. Future Considerations

- **Browser Native Push Notifications**: Web Push API integration delivering offline desktop notifications for critical HR approvals.
