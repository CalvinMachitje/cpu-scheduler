# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Core simulator + realistic CPU/state visualisation — complete for course demo
- Context docs maintained; course report/PPT still external

## Current Goal

- Keep types and docs in sync; support local TypeScript/build issues; optional next features on request

## Completed

- Next.js app scaffold (App Router, TypeScript, Tailwind)
- Process generator (10–50, arrival/burst/priority)
- Algorithms: FCFS, SRTF, Round Robin with metrics
- UI: workload table, Simulate All, Scaling Study (10→50)
- GanttChart (timeline + process lanes + legend)
- MetricsCard, ComparisonChart, ScalingChart
- ExecutionTrace
- State timeline builder (`buildStateTimeline`) on simulation results
- CpuSchedulerView: Ready / Running / Blocked / Terminated + play/scrub + CPU chip
- `next.config.ts` allowedDevOrigins + turbopack.root for network/dev warnings
- Context documentation set under `context/`
- **Type fix (2026-09-25):** `SimulationResult.algorithm` typed as `Algorithm` (`"FCFS" | "SRTF" | "RR"`) — resolves TS2322 on `MetricsCard` / `algorithm={r.algorithm}`

## In Progress

- None actively; awaiting user requests (report, PPT, extra algorithms, true I/O blocking)

## Next Up

- Optional: true I/O Blocked state (separate from “not arrived”) if course requires it
- Optional: Priority scheduling algorithm (field already on Process)
- Course deliverables outside the app: IMRAD report (PDF), presentation (PPTX)
- Ensure user’s local Windows project has latest `types.ts` and components

## Open Questions

- Should “Blocked” remain “not yet arrived”, or should processes model real I/O wait queues?
- Is Priority scheduling required beyond generating the priority field?
- Target Node/npm versions for student machines (user uses Windows + npm/pnpm)

## Architecture Decisions

- Client-only simulation — no backend (simplicity for course demo)
- Timeline derived from Gantt after the fact — single source of truth for execution order
- Same workload for all three algorithms — fair comparison
- Tailwind-only UI without shadcn — fewer install dependencies for students
- **`Algorithm` union type** is the single source of truth for algorithm names; `SimulationResult.algorithm` must be `Algorithm`, not `string`

## Session Notes

- Project path on user machine: `E:\my projects\scheduling simulator\cpu-scheduler`
- Parent folder may contain a package-lock outside git root → turbopack.root set to `process.cwd()`
- Access via LAN IP needs `allowedDevOrigins` entry for that IP
- Prefer `http://localhost:3000` for dev to avoid cross-origin warnings
- Meaningful files: `src/lib/algorithms.ts`, `src/lib/types.ts`, `src/components/CpuSchedulerView.tsx`, `src/app/page.tsx`
- If TS errors persist after type fix: VS Code → “TypeScript: Restart TS Server”
