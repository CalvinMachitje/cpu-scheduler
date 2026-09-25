# Code Standards

## General

- Keep domain logic in `src/lib`; keep React components presentational where possible
- Fix root causes; do not paper over algorithm bugs in the UI
- One concern per module: scheduling ≠ charting ≠ page layout

## TypeScript

- Strict typing for `Process`, `GanttEntry`, `Metrics`, `SimulationResult`, `StateSnapshot`
- Avoid `any` in new code; narrow chart data types when touching scaling charts
- Export shared types only from `src/lib/types.ts`

## Next.js

- App Router under `src/app`
- `"use client"` only on interactive pages/components (main page, charts, playback)
- No API routes required for core simulator behaviour
- Config: `allowedDevOrigins` and `turbopack.root` as needed for local network dev

## Styling

- Tailwind utility classes; prefer zinc/blue/emerald palette already used
- Process colours may use a fixed hex palette keyed by PID for consistent Gantt identity
- Support dark mode via existing `dark:` classes

## Simulation logic

- Algorithms must produce correct waiting, turnaround, response, completion times
- Gantt intervals are half-open in spirit: process runs on `[start, end)`
- `buildStateTimeline` must stay consistent with Gantt + `completionTime`
- Same workload instance must be passed to all three algorithms for comparison

## File Organization

- `src/lib/` — `types.ts`, `algorithms.ts` (generation + FCFS + SRTF + RR + timeline)
- `src/components/` — UI pieces only
- `src/app/` — `layout.tsx`, `page.tsx`, `globals.css`
- `context/` — product/architecture/workflow docs for development

## Testing / verification

- Prefer manual verification: small fixed seed workload, check Gantt vs table metrics
- `npm run build` should succeed before considering a unit done
