# 02 — Enterprise Brand Guidelines & Multi-Tenant Identity

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: Brand Designers, UI Engineers, White-Labeling Architects
- **Cross-References**: `01_UI_UX_Vision.md`, `04_Color_System.md`, `06_Design_Tokens.md`, `24_Subscriptions_UI.md`

---

## 1. Purpose

This specification defines the visual brand identity for **Awais HR** and establishes the technical multi-tenant white-labeling framework. It governs logo positioning, brand mark rules, typography pairings, color palette overrides, and tenant co-branding guidelines across all workspace portals.

---

## 2. Executive Overview

Awais HR balances two distinct branding requirements:
1. **Core Platform Brand**: Premium, authoritative, precise, and sleek dark-mode aesthetics when operating in platform administration or SaaS super-admin modes.
2. **Tenant Workspace Co-Branding**: Seamless white-label adaptation for enterprise customers (e.g., Acme Corp), allowing customer-defined primary/secondary colors, corporate logos, and domain branding while preserving accessibility and design system integrity.

---

## 3. Detailed Specifications

### 3.1 Brand Identity Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BRAND ARCHITECTURE                              │
├───────────────────────────────────┬────────────────────────────────────┤
│ PLATFORM PORTAL (Base Domain)     │ TENANT PORTAL (Subdomain / CNAME)  │
│ - Brand Name: Awais HR            │ - Brand Name: Tenant Custom Name   │
│ - Core Logo: Geometric 'A' Shield │ - Tenant Logo: Uploaded PNG/SVG    │
│ - Primary Color: Indigo (#6366f1) │ - Primary Color: Tenant HSL Accent │
│ - Tone: Authoritative, Technical  │ - Powered By: Subtitle Badge       │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 3.2 Logo Specifications & Geometry
- **Primary Mark**: Geometric 3D Hex Shield incorporating an inner 'A' vector.
- **Minimum Clear Space**: `16px` (1rem) margin on all sides.
- **Minimum Dimensions**:
  - Desktop Header: `32px` x `32px`
  - Mobile Navbar: `24px` x `24px`
  - Favicon / Touch Icon: `64px` x `64px` SVG

### 3.3 Dynamic Multi-Tenant Branding Engine Rules
When a tenant loads the application, the API returns branding configuration tokens. The frontend runtime injects these parameters safely into Root CSS variable definitions:

| Branding Token | CSS Variable Target | Default Fallback | Contrast Guard Constraint |
| :--- | :--- | :--- | :--- |
| `primaryColor` | `--accent-primary` | `#6366f1` | Luminance check >= 4.5:1 against dark background |
| `secondaryColor` | `--accent-secondary` | `#a855f7` | Luminance check >= 4.5:1 against dark background |
| `logoUrl` | `--tenant-logo-src` | Default Awais Mark | Max dimensions: 180px width, 40px height |
| `customDomain` | Domain Binding | `subdomain.awais.com` | SSL Let's Encrypt automated challenge validation |

---

## 4. Design Decisions & Rationale

- **Automated Color Luminance Protection**: If a tenant provides a custom primary brand color with poor contrast (e.g., pure black `#000000` on dark mode or bright yellow `#ffff00` on white text), the runtime engine automatically shifts the HSL lightness channel to guarantee WCAG AA accessibility compliance.
- **Subtle "Powered by Awais HR" Attribution**: Enterprise tenants on Starter/Professional plans display a minimal, glassmorphic attribution pill in the bottom-left sidebar. Enterprise/Custom tiers can toggle this off.

---

## 5. Examples & Implementation Contracts

```javascript
// Runtime Multi-Tenant Brand Color Guard Engine
export function applyTenantBranding(tenantBranding) {
  const root = document.documentElement;
  
  if (tenantBranding?.primaryColor) {
    const safePrimary = ensureAccessibleContrast(tenantBranding.primaryColor, '#0a0a0c');
    root.style.setProperty('--accent-primary', safePrimary);
  }
  
  if (tenantBranding?.secondaryColor) {
    const safeSecondary = ensureAccessibleContrast(tenantBranding.secondaryColor, '#0a0a0c');
    root.style.setProperty('--accent-secondary', safeSecondary);
  }

  if (tenantBranding?.logoUrl) {
    document.getElementById('app-tenant-logo').src = tenantBranding.logoUrl;
  }
}
```

---

## 6. Best Practices

- **Never Distort Tenant Logos**: Always apply `object-fit: contain` and enforce maximum rendering dimensions.
- **Maintain Neutral Canvas Colors**: Backgrounds (`--bg-primary`, `--bg-secondary`) must remain consistent to prevent brand color bleeding from causing visual chaos.

---

## 7. Future Considerations

- **Tenant Theme Builder Sandbox**: Real-time side-by-side preview mode in Tenant Admin Settings for customizing workspace themes with immediate CSS variable hot-reloading.
