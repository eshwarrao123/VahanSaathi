# PRODUCT.md — VahanSaathi

## Tagline
> Tell us what happened. We'll tell you what to do next.

## Overview
**VahanSaathi** is an independent citizen guidance and process-understanding layer built around the existing Indian Parivahan / VAHAN vehicle ownership-transfer experience.

It is **NOT** an official government service, **NOT** a replacement for VAHAN, and must **NEVER** imply government endorsement.

## Core Problem
A used-vehicle buyer or seller—especially in an interstate transfer—does not know which steps, documents, responsibilities, conditions, and follow-ups apply to their specific situation.

## Hero Hackathon Scenario
A synthetic citizen sold a Telangana-registered (TG) used vehicle to a buyer in Karnataka (KA).

## Core Interaction Model
```text
Citizen situation
→ structured case
→ verified rules
→ personalized roadmap
→ responsibilities
→ documents
→ mock government action
→ persistent status
```

## Architecture & Rule Guarantee
- **Citizen input** → **Structured case** → **Deterministic rules engine** → **Applicable workflow** → **OpenAI explanation**
- The **rules layer** is the sole source of truth for legal/government requirements. AI MUST NEVER independently decide legal/government rules or steps.

## Product Personality
- **Trustworthy**: Clear disclaimers, precise instructions, zero ambiguity.
- **Modern & Calm**: Uncluttered editorial layouts, soft neutral tones, purposeful accent colors.
- **Premium & Human**: Respectful tone for users of all digital literacy levels.
- **Utility-Focused**: Quick progress, minimal typing, high legibility.

## Strict Aesthetic & UX Anti-Patterns (AVOID)
- Generic AI dashboard aesthetics
- Glassmorphism, neon effects, or glossy gradients
- Repetitive, generic card grids
- Oversized rounded cards or floating bubbles
- Massive hero graphics or decorative AI icons/stock photos
- Heavy drop shadows
- Unnecessary micro-animations or layout shifts
- Generic SaaS marketing templates

## Target Scenarios for Demo Data
1. **Scenario A**: Same-state ownership transfer (TG → TG).
2. **Scenario B**: Interstate ownership transfer (TG → KA) — Hero Scenario.
3. **Scenario C**: Interstate ownership transfer (TG → KA) + Active Bank Hypothecation / Loan.
