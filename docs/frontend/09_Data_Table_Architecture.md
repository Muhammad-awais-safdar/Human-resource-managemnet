# 09 — Data Table Architecture: TanStack Table v8 & Virtualization

- **Document Version**: 1.0.0
- **Status**: Production Engineering Specification
- **Target Audience**: Data Table Engineers, Frontend Architects, Performance Specialists
- **Design System Cross-Reference**: `docs/ui-ux/14_Table_Standards.md`

---

## 1. Purpose

This document specifies the technical architecture for enterprise data tables in **Awais HR**. Built with **TanStack Table v8** and `@tanstack/react-virtual`, it details virtualized rendering, column sorting, server-side pagination, batch actions, and row selection.

---

## 2. Scope

This specification governs all tabular data displays across Core HR, Attendance, Leave, Payroll, ATS, Assets, Help Desk, and Audit modules.

---

## 3. Standards & Table Architecture

### 3.1 Data Table Feature Standard
- **Fixed Height Row Densities**: 36px Compact mode, 48px Comfortable mode default.
- **Sticky Table Headers**: `sticky top-0 z-10 bg-[var(--bg-surface-l2)]`.
- **Floating Batch Bar**: Displays at bottom-center when rows are selected (`14 Items Selected`).
- **Row Click Trigger**: Clicking a row opens the right-side **Inspector Drawer**.

---

## 4. Folder Structure & Table Directory

```
src/components/data-display/
├── DataTable.tsx                   # Main TanStack Table Wrapper
├── DataTableHeader.tsx             # Sortable Header Renderer
├── DataTablePagination.tsx         # Page size & Navigation Bar
├── FloatingBatchToolbar.tsx        # Bottom Batch Selection Action Bar
└── cells/                          # Reusable Cell Formatters
    ├── CurrencyCell.tsx            # Formatted Monetary Cell (tabular-nums)
    ├── StatusCell.tsx              # Badge Status Cell
    └── UserAvatarCell.tsx          # Avatar + Name Stack Cell
```

---

## 5. Naming Conventions

- **Table Component**: `DataTable.tsx` or module-specific `[Module]Table.tsx` (e.g. `EmployeeTable.tsx`).
- **Column Definitions**: `[entity]Columns.tsx` (e.g. `employeeColumns.tsx`).

---

## 6. Implementation Code Contracts

```typescript
// Generic TanStack Table Architecture Contract (src/components/data-display/DataTable.tsx)
import React from 'react';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
} from '@tanstack/react-table';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface-l1)]">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[var(--bg-surface-l2)] text-[var(--text-secondary)] uppercase font-semibold border-b border-[var(--border-subtle)] sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 select-none">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick && onRowClick(row.original)}
              className="hover:bg-[var(--bg-surface-l2)]/60 transition-colors cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 7. Best Practices

- **Right-Align Monetary Figures**: Numbers must be right-aligned with `tabular-nums` monospace formatting (`Geist Mono`).
- **Virtualize Rows > 100 Items**: Use `@tanstack/react-virtual` to preserve 60 FPS scrolling on large datasets.

---

## 8. Core Engineering Do's & Don'ts

### Do's
- **DO** memoize column definitions using `useMemo()` to prevent unnecessary table re-renders.
- **DO** render clear skeleton table rows during asynchronous server fetches.

### Don'ts
- **DON'T** use client-side pagination for datasets containing thousands of records; use server-side pagination.
- **DON'T** allow long text strings to stretch table cell widths; enforce `truncate` with tooltip fallbacks.

---

## 9. Dependencies Reference

- `@tanstack/react-table`: `^8.15.0`
- `@tanstack/react-virtual`: Virtualized list renderer

---

## 10. Implementation Notes

The floating batch bar renders via an animated Framer Motion portal when `table.getSelectedRowModel().rows.length > 0`.
