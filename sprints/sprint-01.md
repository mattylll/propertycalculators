# Sprint 01 — 2025-02-15

## Goals
- Replace the boilerplate landing page with an AI-first PropertyCalculators overview.
- Wire navigation + routing to the new Component Kit and PD calculator experiences.
- Deliver a functional Permitted Development calculator UI that mimics the AI journey (inputs → AI response → metrics).

## Tasks & Outputs
- **Navigation refresh** (`src/app/(delete-this-and-modify-page.tsx)/NavigationBar.tsx`, `NavigationLinks.tsx`): Added brand badge, menu items for `/property-kit` and `/calculators/pd`, and a CTA button to enter the PD flow.
- **New hero/homepage** (`src/app/page.tsx`): Built a premium overview featuring hero metrics, bento tiles, and CTA buttons that link to the calculators and component kit.
- **PD calculator route** (`src/app/calculators/pd/page.tsx`): Implemented a client-side flow with floating inputs, Article 4/heritage toggles, derived GDV/build metrics, and a streaming-style AI response using the bespoke Property Kit components.
- **Sprint logging** (`sprints/README.md`, `sprints/sprint-01.md`): Added documentation describing how sprint notes are structured and captured this sprint’s outcomes for traceability.

## Validation
- `npm run lint` (ESLint) – ensures the new components comply with the repo rules.
- Manual UI run-through via `npm run dev` to ensure navigation links, landing page, and the new PD calculator render without runtime errors.

## Follow-ups
- Expand calculators for GDV/build/finance steps (Steps 2–3 in the PD journey) and hook them into shared deal storage.
- Surface live deal data on the homepage once persistence APIs are available.
