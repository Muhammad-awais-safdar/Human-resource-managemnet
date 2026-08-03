# 14 — Data Table Architecture & TanStack Table v8 Standards

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Table Engineers, Frontend Architects, Data UX Specialists
- **Cross-References**: `07_Spacing_Grid_System.md`, `09_Component_Library.md`, `15_Employee_Module_UI.md`, `18_Payroll_Module_UI.md`

---

## 1. Purpose

This document defines specifications for data tables in Awais HR. Built with **TanStack Table v8**, it details virtualized rendering, column sorting, filtering, selection triggers, sticky headers, batch action toolbars, and server-side pagination.

---

## 2. Executive Overview

Data tables are the core workhorse of Awais HR. HR admins manage thousands of employee records, attendance entries, and payroll details daily. Awais HR mandates virtualized scrolling for large data sets, sticky table headers, inline column sorting, batch selection controls, and instant search filtering.

---

## 3. Detailed Specifications

### 3.1 Data Table Feature Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA TABLE FEATURE MATRIX                       │
├───────────────────┬────────────────────────────────────────────────────┤
│ FEATURE           │ SPECIFICATION & IMPLEMENTATION                     │
├───────────────────┼────────────────────────────────────────────────────┤
│ Row Height        │ 36px (Compact) / 48px (Comfortable Default)        │
│ Table Header      │ Sticky (`top-0`), `bg-[var(--bg-surface-l2)]`, `z-10`│
│ Column Sorting    │ Single/Multi-column click sort with directional arrows│
│ Row Selection     │ Checkbox column (`w-10`) with select-all header trigger│
│ Floating Batch Bar│ Appears on selection: "Approve Selected", "Export" │
│ Pagination Controls│ Page size select (15, 25, 50, 100), direct page jump│
│ Virtualization    │ `@tanstack/react-virtual` for rows > 100 items      │
└───────────────────┴────────────────────────────────────────────────────┘
```

### 3.2 Floating Batch Action Toolbar Anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ FLOATING BATCH ACTION TOOLBAR (Appears at bottom center on selection)  │
├────────────────────────────────────────────────────────────────────────┤
│ [ 14 Items Selected ]  |  [ Approve ]  [ Reject ]  [ Export CSV ]  [✕] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **TanStack Table v8 Headless Core**: Using TanStack Table provides a headless table engine with complete control over rendering, accessibility, sorting algorithms, and cell formatting.
- **Row Click opens Inspector Drawer**: Clicking anywhere on a row (except checkboxes or action menus) immediately opens the right-side **Inspector Drawer**, keeping users in context.

---

## 5. Examples & Implementation Contracts

```jsx
// Enterprise Data Table Pattern (TanStack Table v8)
import React from 'react';
import { useReactTable, flexRender, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';

export function DataTable({ columns, data, onRowClick }) {
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
                <th key={header.id} className="px-4 py-3 cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}
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

## 6. Best Practices

- **Always Align Numbers to the Right**: Numeric cell values (salaries, hours, counts) must be right-aligned with tabular font numbers (`tabular-nums`).
- **Provide Clear Loading Skeletons**: Display animated skeleton table rows matching column widths during asynchronous data fetches.

---

## 7. Future Considerations

- **Saved Table Views & Custom Column Ordering**: Allowing users to drag-reorder columns, hide non-essential fields, and save custom view configurations.
