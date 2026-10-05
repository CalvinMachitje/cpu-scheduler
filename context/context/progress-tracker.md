# Progress Tracker

Update this file after every meaningful implementation change.

**Authority:** All work must follow `context/assignment-brief.md` (CMPG324 brief, due 19 October 2026).

## Current Phase

- Simulator (required deliverable #3) — **implemented and usable**
- Report PDF / DOCX (deliverable #1) — **done** (`artifacts/CMPG324_CPU_Scheduling_Report.pdf` / `.docx`)
- Presentation PPTX (deliverable #2) — **done** (`artifacts/CMPG324_CPU_Scheduling_Presentation.pptx`)

## Current Goal

- Polish simulator UX; keep docs in sync with code

## Assignment compliance checklist

| Requirement | Status |
|-------------|--------|
| FCFS, SRTF, Round Robin | Done |
| Processes 10 → 50 step 10 | Done (UI + Scaling Study) |
| Arrival random incremental, burst random, priority random, quantum configurable | Done |
| Waiting, response, CPU util, throughput, avg turnaround | Done |
| Visualise process execution | Done (Gantt, lanes, CPU state board, trace) |
| Compare algorithms as N grows (investigative Qs) | Done (Scaling Study charts) |
| Report PDF (IMRAD) | Done (+ DOCX) |
| Presentation PPTX | Done |
| Simulator submission | App ready; package/export as needed |

## Completed (simulator)

- Next.js + TypeScript + Tailwind app
- Process generator; FCFS / SRTF / RR; metrics
- **Run one algorithm at a time (FCFS | SRTF | RR) or Simulate All** — metrics calculated for each run
- Results stored in `resultMap` (merge individual runs; replace on Simulate All)
- Scaling Study (10–50)
- Gantt, ExecutionTrace, CpuSchedulerView (Ready/Running/Blocked/Terminated)
- Metrics + comparison + scaling charts
- **OS Group Project logo** (`public/os-group-logo.jpg`) in header + favicon
- Context docs + assignment-brief.md
- Type fix: `SimulationResult.algorithm` is `Algorithm`
- Report PDF/DOCX and presentation PPTX in `artifacts/`

## In Progress

- None actively

## Next Up (submission path)

1. Add student names / numbers to report cover and PPT title if required  
2. Package simulator (repo / zip / run instructions) for submission  
3. Optional screenshots of logo + per-algorithm runs for the report appendix  

## Open Questions

- Brief item 3 under investigative questions is incomplete in the source doc — treat as **response time** unless lecturer says otherwise  
- “Preemptive Priority” in the heading vs listed FCFS/SRTF/RR — **stick to the three listed algorithms**  
- True I/O Blocked vs “not arrived” — optional teaching aid; **not required** by the brief  

## Architecture Decisions

- Client-only simulator matching brief (workloads, run, visualise, compare)  
- Same workload for all three algorithms when comparing (Simulate All or sequential individual runs on unchanged workload)  
- `resultMap: Partial<Record<Algorithm, SimulationResult>>` allows partial completion  
- Scaling Study exists specifically to answer “as number of processes increases…”  
- Branding: OS Group Project circular logo as primary visual identity  

## Session Notes

- Local path: `E:\my projects\scheduling simulator\cpu-scheduler`  
- Prefer `http://localhost:3000`  
- Logo path: `public/os-group-logo.jpg`  
- Due date: **19 October 2026** — Report PDF, PPTX, Simulator  
- Key UI file for run controls: `src/app/page.tsx` (`runOne`, `runAll`, `resultMap`)  
