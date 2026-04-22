# NexusLearnr Playground Barbershop

Interactive barbershop web platform used internally as a QA and SDET automation practice playground (Playwright and related tools).

## Internal product guardrails

- This repository's underlying purpose is to serve as a playground where QA and SDET engineers can develop testing skills.
- The application itself must never reveal or reference that underlying purpose in UI copy, content, flows, metadata, or branding.
- All product-facing experiences should mimic a realistic barbershop website.

## What this playground includes

- Authentication flow with positive and negative paths.
- Rich filtering controls (search, select, radio, checkbox).
- Appointment lifecycle with state transitions.
- Feature flags and simulated outage state.
- Checkout modal with success/failure branches.
- Metrics panel and empty-state rendering.

## QA difficulty roadmap (future)

The Settings page will evolve to include explicit QA difficulty levels that modify how testable the UI is:

- Easy mode: stable UI behavior, clean datasets, broad `data-testid` coverage, predictable loading and animation timing.
- Hard mode: noisier data quality, mixed selector reliability (fewer testids), more edge-case loading/transition behavior.

This roadmap is documented for future implementation and is not fully active yet.

## Run locally

```bash
npm install
npm run dev
```

## Run E2E tests

```bash
npx playwright install
npm run test:e2e
```
