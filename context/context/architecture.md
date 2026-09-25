# Architecture Context

## Stack

| Layer      | Technology                         | Role                                      |
| ---------- | ---------------------------------- | ----------------------------------------- |
| Framework  | Next.js 16 (App Router) + TypeScript | App shell, routing, client UI             |
| UI         | React 19 + Tailwind CSS 4          | Interactive simulator interface           |
| Simulation | Pure TypeScript in `src/lib`       | Scheduling algorithms and metrics         |
| Auth       | None                               | No authentication                         |
| Database   | None                               | All state is in-memory / React state      |

## System Boundaries

- `src/app` — Next.js App Router pages and layout; `page.tsx` is the single main UI surface
- `src/lib` — Domain logic only: process generation, FCFS/SRTF/RR, metrics, state timeline builder
- `src/components` — Presentational and interactive UI (Gantt, CPU view, charts, tables)
- `context/` — Spec and progress docs for AI-assisted development; not shipped to runtime

## Storage Model

- **React client state**: Current workload, simulation results, scaling data, UI tab, playback time
- **No database / blob storage**: Simulations are ephemeral; refresh clears results
- **No server actions or API routes** required for core simulator behaviour

## Auth and Access Model

- No sign-in; the simulator is a public teaching tool
- No ownership or multi-user access control

## Data flow

1. User configures count / quantum → `generateProcesses()` produces `Process[]`
2. `runAlgorithm()` for FCFS, SRTF, RR → each returns `SimulationResult` (gantt, processes, metrics, timeline)
3. UI binds results to `CpuSchedulerView`, `GanttChart`, `ExecutionTrace`, `MetricsCard`, charts

## Invariants

1. Simulation logic lives only in `src/lib` — components must not reimplement scheduling rules.
2. All three algorithms run on the **same** workload snapshot for fair comparison.
3. State timeline snapshots are derived from Gantt + process completion times; they must stay consistent with the Gantt chart.
4. Client components (`"use client"`) are used only where interactivity is required (main page, charts, playback).
5. Metrics formulae remain standard OS definitions (waiting = TAT − burst, etc.).
6. Algorithm identity is the union type `Algorithm` (`"FCFS" | "SRTF" | "RR"`); results and UI props must not treat it as an unconstrained `string`.
