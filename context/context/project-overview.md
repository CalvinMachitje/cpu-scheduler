# CPU Scheduling Simulator (CMPG324)

## Overview

A web-based CPU scheduling simulator built for the North-West University Operating Systems module (CMPG324). It lets students create random multi-process workloads, run three classic scheduling algorithms (FCFS, SRTF, Round Robin), and compare performance using standard OS metrics. The UI visualises how the CPU schedules processes over time, including Ready / Running / Blocked (not-yet-arrived) / Terminated states, Gantt charts, and a playable timeline.

## Goals

1. Accurately simulate FCFS, SRTF (preemptive SJF), and Round Robin for configurable workloads (10–50 processes).
2. Visualise process execution with Gantt charts, per-process lanes, execution traces, and a live CPU + state board.
3. Answer investigative questions: as process count grows, which algorithm minimises waiting time, turnaround, maximises throughput and CPU utilisation.
4. Support the course deliverables: simulator, IMRAD research report, and presentation.

## Core User Flow

1. User opens the app and sees a generated workload (PID, arrival, burst, priority).
2. User optionally changes process count (10–50), time quantum (RR), or regenerates the workload.
3. User clicks **Simulate All** → FCFS, SRTF, and RR run on the same workload.
4. User explores **Gantt Charts** tab: live CPU/state playback, multi-lane Gantt, execution trace, results table.
5. User compares metrics side-by-side and runs **Scaling Study (10→50)** for graphs vs process count.

## Features

### Simulation

- Random workload generation (incremental arrival, random burst 1–15, priority 1–10)
- FCFS (non-preemptive), SRTF (preemptive), Round Robin (configurable quantum)
- Metrics: average waiting time, turnaround, response time, CPU utilisation, throughput

### Visualisation

- Live CPU chip + Ready / Blocked / Terminated state columns with play/scrub controls
- Single-row and multi-lane Gantt charts with colour legend
- Execution trace table and per-process status cards
- Comparison bar charts and scaling line charts (10→50 processes)

### Course alignment

- Workloads sized 10, 20, 30, 40, 50 for investigative analysis
- Screenshots and metrics suitable for IMRAD Results section

## Scope

### In Scope

- Client-side simulation only (no backend, no persistence)
- Three algorithms: FCFS, SRTF, RR
- Process states for teaching: Blocked (not arrived), Ready, Running, Terminated
- Metrics and scaling comparison UI
- Next.js + React + TypeScript + Tailwind frontend

### Out of Scope

- Priority scheduling algorithm (priority field is generated but unused by the three required algorithms)
- Real multi-core / multiprocessor scheduling
- Disk/I/O-bound blocking with separate I/O queue (Blocked currently means “not yet arrived”)
- User accounts, auth, or server-side storage
- Automated report/PPT generation inside the app

## Success Criteria

1. User can generate a workload and run all three algorithms in one click.
2. Gantt Charts tab shows playable state transitions and Gantt for each algorithm.
3. Metrics Comparison and Scaling Study produce charts usable for the research report.
4. App builds and runs with `npm run dev` / `npm run build`.
