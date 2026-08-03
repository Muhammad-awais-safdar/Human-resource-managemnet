# 22 — IT Assets & Hardware Lifecycle UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: IT Asset Managers, Frontend Engineers, Hardware Logistics Specialists
- **Cross-References**: `14_Table_Standards.md`, `15_Employee_Module_UI.md`, `23_Helpdesk_Module_UI.md`

---

## 1. Purpose

This document details the UI/UX architecture for the Assets & IT Management Module. It covers the Hardware/Software Asset Registry, Asset Assignment Custody Log, QR Code Asset Tagging, and Offboarding Recovery Checklists.

---

## 2. Executive Overview

Managing physical hardware assets (MacBooks, monitors, peripherals) and software licenses across a remote workforce requires rigorous tracking. Awais HR provides an asset registry table, custodian assignment history, QR code verification, and offboarding asset recovery tracking.

---

## 3. Detailed Specifications

### 3.1 Hardware Asset Registry Workspace

```
┌────────────────────────────────────────────────────────────────────────┐
│ IT ASSET MANAGEMENT REGISTRY                                           │
├────────────────────────────────────────────────────────────────────────┤
│ [Search Tag #, Serial, Model...]  [Filter Category] [Filter Custodian] │
├────────────────────────────────────────────────────────────────────────┤
│ ASSET TAG │ MODEL / SPEC          │ CUSTODIAN          │ STATUS        │
│ 💻 AST-489│ MacBook Pro M3 Max 16"│ Sarah Jenkins (Eng)│ Assigned 🟢   │
│ 🖥️ AST-102│ Dell UltraSharp 27" 4K│ In IT Storage Vault│ Available ⚪  │
│ 📱 AST-044│ iPhone 15 Pro Test    │ Alex Rivera (QA)   │ Assigned 🟢   │
└───────────┴───────────────────────┴────────────────────┴───────────────┘
```

### 3.2 Asset Custody Inspector Drawer
- **Asset Details**: Serial number, purchase date, warranty expiration countdown, acquisition cost.
- **Assignment History**: Timeline log detailing every employee who has held custody of the device.
- **Maintenance Notes**: Service history and repair logs.

---

## 4. Design Decisions & Rationale

- **Offboarding Recovery Checklist Integration**: Terminating an employee automatically flags all assigned hardware assets in an "Offboarding Recovery Queue", generating prepaid shipping labels for hardware return.

---

## 5. Examples & Implementation Contracts

```jsx
// Asset Status Badge Contract
export function AssetStatusBadge({ status }) {
  const configs = {
    ASSIGNED: { label: 'Assigned', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    AVAILABLE: { label: 'Available in Vault', class: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    MAINTENANCE: { label: 'In Repair', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    RETIRED: { label: 'Decommissioned', class: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
  };

  const config = configs[status] || configs.AVAILABLE;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.class}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
```

---

## 6. Best Practices

- **Support QR Code Label Printing**: Allow IT managers to select asset rows and print formatted QR code tags directly to zebra barcode printers.
- **Alert on Expiring Warranties**: Display visual warning badges for devices with warranties expiring in < 30 days.

---

## 7. Future Considerations

- **MDM (Mobile Device Management) Remote Wipe Integration**: One-click remote lock/wipe triggers for lost or stolen company MacBooks directly from the asset inspector drawer.
