# Awais HR Enterprise SaaS — Frontend Web Application

> **Modern Enterprise Multi-Tenant SaaS User Interface**  
> Built with Next.js 15, Tailwind CSS, and custom B2B design system tokens.

---

## 🎨 UI/UX Design System & Color Palette

The frontend interface features an executive dark-mode aesthetic with glassmorphism overlays, dynamic gradient brand accents, role-based visual badges, and accessible WCAG 2.2 AA compliant focus states.

### Core Color Scheme Tokens (`variables.css`)

```
  Primary Indigo       Secondary Purple      Success Emerald       Warning Amber         Danger Rose          Info Royal Blue
     #6366f1              #8b5cf6               #10b981              #f59e0b             #ef4444              #3b82f6
   [ ████████ ]         [ ████████ ]          [ ████████ ]         [ ████████ ]        [ ████████ ]         [ ████████ ]
```

* **Viewport Canvas**: Deep Slate `#0b0f19` (`--bg-primary`)
* **Container / Sidebar**: Midnight Charcoal `#111827` (`--bg-secondary`)
* **Raised Surface / Cards**: Dark Gray `#1f2937` (`--bg-surface`)
* **Primary Brand Accent**: Vibrant Indigo `#6366f1` (`--primary`), Hover `#4f46e5`
* **Secondary Brand Accent**: Electric Purple `#8b5cf6` (`--secondary`), Hover `#7c3aed`
* **Text Hierarchy**: Primary (`#f9fafb`), Secondary (`#9ca3af`), Muted (`#6b7280`)

---

## 🛡️ Role-Based Dynamic Badge Styling

* **System Admin**: Glowing Amber Gold (`rgba(234, 179, 8, 0.12)`, text `#facc15`, border `rgba(234, 179, 8, 0.3)`)
* **Tenant Admin**: Glowing Indigo (`rgba(99, 102, 241, 0.12)`, text `#818cf8`, border `rgba(99, 102, 241, 0.3)`)
* **HR Manager**: Glowing Purple (`rgba(168, 85, 247, 0.12)`, text `#c084fc`)
* **Employee**: Glowing Emerald (`rgba(16, 185, 129, 0.12)`, text `#34d399`)

---

## 🚀 Getting Started

First, launch the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📑 Comprehensive Design Architecture Guide

For full technical specifications on CSS variables, glassmorphic custom scrollbars, keyframe animations, org tree connecting lines, and typography scales, refer to:
* 📄 [`docs/UI-DESIGN-SYSTEM-AND-COLOR-SCHEME.md`](file:///home/awais/awais/projects/spring-boot/Human-resource-managemnet/docs/UI-DESIGN-SYSTEM-AND-COLOR-SCHEME.md)

