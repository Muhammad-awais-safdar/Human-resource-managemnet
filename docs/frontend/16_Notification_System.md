# 16 — Notification System: WebSockets, Drawer & Toast Engine

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Messaging Engineers, WebSocket Architects, Frontend Developers
- **Design System Cross-Reference**: `docs/ui-ux/26_Notifications_UI.md`

---

## 1. Purpose

This document details the notification engine architecture for **Awais HR**. It specifies real-time WebSocket event listeners, the Notification Center Drawer, notification preferences, and transient Toast notifications.

---

## 2. Scope

This specification governs all real-time alerts (leave approvals, payroll alerts, security warnings) and user feedback toasts across the application.

---

## 3. Standards & Notification Tiers

### 3.1 3-Tier Notification Architecture
1. **Persistent Notification Drawer**: Accessible via top navbar bell icon (`z-50`).
2. **Transient Toasts**: Non-intrusive bottom-right feedback toasts (`z-60`).
3. **WebSockets (STOMP/SockJS)**: Real-time event push updates for active user sessions.

---

## 4. Folder Structure & Notification Directory

```
src/components/
├── overlay/
│   ├── ToastContainer.tsx          # Toast Stack Manager
│   └── ToastItem.tsx               # Individual Toast Alert Pill
├── shell/
│   └── NotificationDrawer.tsx      # Persistent Notification Sheet
└── services/
    └── websocketService.ts         # WebSocket STOMP Client Service
```

---

## 5. Naming Conventions

- **Notification Components**: `ToastContainer.tsx`, `NotificationDrawer.tsx`.
- **WebSocket Service**: `websocketService.ts`.

---

## 6. Implementation Code Contracts

```typescript
// WebSocket Real-Time Listener Service Contract (src/services/websocketService.ts)
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '@/store/useAuthStore';

class WebSocketService {
  private client: Client | null = null;

  connect() {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    this.client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.awais.com/ws',
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        this.client?.subscribe('/user/queue/notifications', (message) => {
          const notification = JSON.parse(message.body);
          // Dispatch notification to store or toast
        });
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.client?.deactivate();
  }
}

export const websocketService = new WebSocketService();
```

---

## 7. Best Practices

- **Limit Visible Toast Stack**: Display a maximum of 3 visible toasts simultaneously; queue additional toasts.
- **Support Sound & Badge Controls**: Allow users to toggle notification sound chimes and unread badge pulse animations in preference settings.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** position toasts at `bottom-right` screen coordinates so they do not block top navigation triggers.
- **DO** auto-dismiss success toasts after 4000ms, but keep critical error toasts visible until manually closed.

### Don'ts
- **DON'T** flood the user with duplicate toasts when repetitive network errors occur.
- **DON'T** leave WebSocket connections active after user logout.

---

## 9. Dependencies Reference

- `@stomp/stompjs`: STOMP client over WebSockets
- `lucide-react`: Alert icons (`CheckCircle2`, `AlertTriangle`, `AlertCircle`, `Info`)

---

## 10. Implementation Notes

The top navbar bell icon displays a subtle pulse indicator (`animate-ping bg-indigo-500`) when a new real-time WebSocket notification arrives.
