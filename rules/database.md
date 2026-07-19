# Rule: Database Design (PostgreSQL)

This file details the database architecture, schema conventions, indexes, soft delete strategies, and migration rules.

---

## 1. Naming Conventions & Schema Standards

*   **Database Engine:** PostgreSQL 16+.
*   **Case Style:** Lower snake_case (`first_name`, `tenant_id`).
*   **Table Names:** Singular nouns (`employee`, `department`, `leave_request`).
*   **Primary Keys:** Named `id` using random UUID v4 (`uuid DEFAULT gen_random_uuid()`).
*   **Foreign Keys:** `referenced_table_id` (`department_id` references `department.id`).
*   **Boolean Columns:** Prefix with `is_` or `has_` (`is_active`, `has_overtime`).
*   **Timestamp Columns:** Suffix with `_at` stored in UTC (`created_at`, `updated_at`).

---

## 2. Global System Columns & Soft Delete

Every table across master and tenant databases contains these auditing columns:
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
deleted_at TIMESTAMP WITH TIME ZONE
created_by UUID
updated_by UUID
deleted_by UUID
```

### Soft Delete Enforcement
*   Soft-deleted records have `deleted_at` set to the timestamp of deletion.
*   All queries executed by the application ORM must append a filter: `WHERE deleted_at IS NULL`.
*   Unique indexes must include the soft delete filter to prevent collisions on historical records:
    ```sql
    CREATE UNIQUE INDEX uq_employee_email ON employee(email) WHERE (deleted_at IS NULL);
    ```

---

## 3. Dynamic Schema Migrations & Audits

*   **Migration Engine:** Flyway.
*   **Audit Logging:** All write mutations (`INSERT`, `UPDATE`, `DELETE`) write to the `audit_trail` table inside the tenant DB via application Hibernate interceptors or Postgres triggers.
