# Awais HR — Task Management Workflow & Scoped Permissions Architecture

## 1. Overview

Phase 13 implements **Task Management** with a lifecycle state machine (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `COMPLETED`, `CANCELLED`), scoped permissions, and status history logs (`task_status_history`).

---

## 2. Task Lifecycle States

```
BACKLOG ──► TODO ──► IN_PROGRESS ──► IN_REVIEW ──► COMPLETED
                        │                │
                        └──► BLOCKED     └──► IN_PROGRESS (Rework)
```

- Any state can transition to `CANCELLED`.

---

## 3. Core Security & Business Guarantees

1. **Scoped Task Permissions**:
   - `SELF`: Non-admin users view tasks assigned to or created by themselves.
   - `TEAM` / `COMPANY`: Managers and Admins can assign, reassign, view, and transition tasks across their teams.
2. **Task Reassignment Authorization**: Only the task creator or authorized managers can reassign tasks to different employees.
3. **Audit History Log**: Every status change or reassignment records an immutable entry in `task_status_history`.
4. **Declarative Audit**: Tagged with `@Auditable(action = "TASK_CREATE", entity = "Task")` and `@Auditable(action = "TASK_TRANSITION", entity = "Task")`.

---

## 4. Schema Reference (`V61__Task_Management_Workflow.sql`)

### `project_task`
- `id` (VARCHAR(36) PRIMARY KEY)
- `project_id` (VARCHAR(50))
- `title` (VARCHAR(150) NOT NULL)
- `description` (TEXT)
- `assignee_id` (VARCHAR(50) FOREIGN KEY)
- `creator_id` (VARCHAR(50) FOREIGN KEY)
- `priority` (VARCHAR(20))
- `status` (VARCHAR(30))
- `due_date` (DATE)

### `task_status_history`
- `id` (VARCHAR(36) PRIMARY KEY)
- `task_id` (VARCHAR(36) FOREIGN KEY)
- `previous_status`, `new_status` (VARCHAR(30))
- `actor_email` (VARCHAR(100))
- `comment` (VARCHAR(255))
- `created_at` (TIMESTAMP)
