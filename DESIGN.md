# DESIGN.md — VahanSaathi Design System

## Core Aesthetic Philosophy
VahanSaathi is designed to feel like a **genuinely better public-service experience**, not a generic startup landing page. It emphasizes clarity, trust, accessibility, and calm editorial authority.

### Key Visual & UX Principles
- **Mobile-First**: Primary target screen width is approximately **375px**, scaling cleanly to desktop.
- **Calm Neutral Palette**: Deep slate typography (`#0f172a`), warm off-white background (`#f8fafc` / `#f1f5f9`), soft border tones (`#e2e8f0`), and authoritative warm amber/emerald state indicators.
- **High Readability Typography**: Clean sans-serif hierarchy (Inter / System Sans), generous line heights, legible font weights.
- **Large Touch Targets**: Minimum 44px height for touch targets, inputs, buttons, and selection pills.
- **One Decision at a Time**: Focused screens, minimal form friction, obvious primary CTA (`Start my transfer`).
- **Accessible & Resilient**: High contrast ratios (WCAG AA compliant), non-color-dependent status indicators (using icon + text badges), low-network resiliency.

## Design Tokens & Palette

### Colors
- **Background**: `bg-slate-50` (`#f8fafc`), Surface `bg-white` (`#ffffff`)
- **Primary Text**: `text-slate-900` (`#0f172a`)
- **Secondary Text**: `text-slate-600` (`#475569`)
- **Muted Text**: `text-slate-500` (`#64748b`)
- **Borders**: `border-slate-200` (`#e2e8f0`), Focus `ring-slate-900`
- **Primary Action (CTA)**: `bg-slate-900` (`#0f172a`) hovering to `bg-slate-800` (`#1e293b`), text white.
- **Secondary Action**: `bg-slate-100` (`#f1f5f9`) hovering to `bg-slate-200` (`#e2e8f0`), text `text-slate-900`.
- **Disclaimer & Notice Banner**: `bg-amber-50`, `border-amber-200`, `text-amber-900`
- **Status Badges**:
  - *Pending*: `bg-amber-100`, `text-amber-800`, `border-amber-300`
  - *Action Required*: `bg-blue-100`, `text-blue-800`, `border-blue-300`
  - *Completed*: `bg-emerald-100`, `text-emerald-800`, `border-emerald-300`

### Typography Scale
- **Display Header**: `text-3xl` (30px), `font-semibold`, `tracking-tight`
- **Section Heading**: `text-xl` (20px), `font-semibold`
- **Subheading / Label**: `text-base` (16px), `font-medium`
- **Body Text**: `text-sm` (14px) / `text-base` (16px), `leading-relaxed`
- **Caption / Meta**: `text-xs` (12px), `text-slate-500`

### Spatial System & Layout
- **Container Max Width**: `max-w-md` (448px) for mobile-first forms/cards, `max-w-3xl` for desktop roadmap views.
- **Padding**: Mobile `p-4` or `p-6`, Section spacing `gap-4` or `gap-6`.
- **Borders & Radii**: Crisp, understated rounded corners (`rounded-lg` / `rounded-md`, 6px - 8px max). Avoid super-rounded pill containers for main cards.
- **Shadows**: Minimal to zero shadows (`shadow-sm` maximum on elevated elements).

## Components Guidelines

### 1. Header & Disclaimers
- Prominent non-intrusive disclosure badge: `Independent hackathon prototype — not an official government service.`
- Clear branding text: **VahanSaathi** with subtle tagline.

### 2. Buttons & Inputs
- Full-width touch-friendly buttons on mobile (`w-full py-3.5 px-4 text-center font-medium rounded-lg`).
- Focus rings visible for keyboard accessibility (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900`).

### 3. Step & Roadmap Cards
- Clean step number indicators (e.g., `Step 1 of 4`).
- Status tags explicitly labeled with icon + text (e.g. `[!] Action Required`, `[✓] Verified`).

## Strict Prohibitions
- No glassmorphism (`backdrop-blur` cards with semi-transparent backgrounds).
- No neon gradient text (`bg-gradient-to-r from-purple to-pink`).
- No floating 3D graphics or decorative AI illustrations.
- No dark mode glow effects or dense dashboard metric widgets.
