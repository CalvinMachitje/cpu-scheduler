# Progress Tracker

Update this file after every meaningful implementation change.

**Authority:** All work must follow `context/assignment-brief.md` (CMPG324 brief, due 19 October 2026).

## Current Phase

- Simulator (required deliverable #3) — **implemented and usable**
- Report PDF (deliverable #1) — **not started**
- Presentation PPTX (deliverable #2) — **not started**

## Current Goal

- Keep the simulator aligned with the assignment; produce IMRAD report and PPTX when requested

## Assignment compliance checklist

| Requirement | Status |
|-------------|--------|
| FCFS, SRTF, Round Robin | Done |
| Processes 10 → 50 step 10 | Done (UI + Scaling Study) |
| Arrival random incremental, burst random, priority random, quantum configurable | Done |
| Waiting, response, CPU util, throughput, avg turnaround | Done |
| Visualise process execution | Done (Gantt, lanes, CPU state board, trace) |
| Compare algorithms as N grows (investigative Qs) | Done (Scaling Study charts) |
| Report PDF (IMRAD) | **Todo** |
| Presentation PPTX | **Todo** |
| Simulator submission | App ready; package/export as needed |

## Completed (simulator)

- Next.js + TypeScript + Tailwind app
- Process generator; FCFS / SRTF / RR; metrics
- Simulate All + Scaling Study (10–50)
- Gantt, ExecutionTrace, CpuSchedulerView (Ready/Running/Blocked/Terminated)
- Metrics + comparison + scaling charts
- Context docs + assignment-brief.md
- Type fix: `SimulationResult.algorithm` is `Algorithm`

## In Progress

- None (awaiting report / PPT / packaging instructions)

## Next Up (submission path)

1. Run Scaling Study; capture graphs for investigative questions → feed **Results** section  
2. Write IMRAD report (PDF) per assignment structure  
3. Build presentation (PPTX) summarising methods, results, recommendation  
4. Package simulator (repo / zip / run instructions) for submission  

## Open Questions

- Brief item 3 under investigative questions is incomplete in the source doc — treat as **response time** unless lecturer says otherwise  
- “Preemptive Priority” in the heading vs listed FCFS/SRTF/RR — **stick to the three listed algorithms**  
- True I/O Blocked vs “not arrived” — optional teaching aid; **not required** by the brief  

## Architecture Decisions

- Client-only simulator matching brief (workloads, run, visualise, compare)  
- Same workload for all three algorithms for fair comparison  
- Scaling Study exists specifically to answer “as number of processes increases…”  

## Session Notes

- Local path: `E:\my projects\scheduling simulator\cpu-scheduler`  
- Prefer `http://localhost:3000`  
- Due date: **19 October 2026** — Report PDF, PPTX, Simulator  
