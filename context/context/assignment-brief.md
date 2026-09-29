# CMPG324 Assignment Brief (Source of Truth)

**Course:** Operating Systems (CMPG324)  
**Institution:** North-West University  
**Compiled by:** Dr Lanka Sejaphala  
**Submission deadline:** 19 October 2026  

All product and report work for this repository **must** satisfy this brief. Do not add features that conflict with or replace the required algorithms, metrics, or deliverables.

---

## Objective

Develop a simulator that simulates and compares the performance of **three** CPU scheduling algorithms for an **audio-and-video system** with multiple processes.

## Required algorithms (implement and compare)

1. First Come First Served (FCFS)  
2. Shortest Remaining Time First (SRTF)  
3. Round Robin (RR)  

Note: The brief heading mentions “Preemptive Priority Scheduling” but the listed algorithms are FCFS, SRTF, and RR. **Implement these three.** Priority may be generated as a process parameter; a separate priority scheduler is **not** required unless the lecturer clarifies otherwise.

## Process creation

- Number of processes: **10, then increment by 10 until 50** (10, 20, 30, 40, 50)  
- Parameters:
  - Process ID  
  - Arrival time = random incremental  
  - Burst time = random  
  - Priority = random  
  - Time quantum = random (configurable for RR)

## Performance metrics (must be measured and reported)

- Waiting time  
- Response time  
- CPU utilisation  
- Throughput  
- Average turnaround time  

## Investigative questions (as number of processes increases)

1. Which algorithm minimises waiting time?  
2. Which algorithm gives the best turnaround time?  
3. Which algorithm performs best in terms of [response time — brief item 3 is incomplete in source; treat response time as the natural third metric]  
4. Which algorithm demonstrates higher throughput?  
5. Which algorithm demonstrates higher CPU utilisation?  

## Required submissions (19 October 2026)

1. **Report in PDF** — IMRAD format  
2. **Presentation PPTX**  
3. **Simulator**  

### Report structure (IMRAD + Conclusion)

**Introduction:** Background, Related work, Problem statement, Aim and Objectives, Significance  

**Methodology:** Tools used; simulator flow diagram; algorithms compared; performance metrics and formulae; data collection method (quantitative / mixed); data analysis approach  

**Results and Analysis:** Graphical representation of results and analysis  

**Discussion:** Findings vs metrics; best-performing algorithm; strengths/weaknesses of each; areas of application  

**Conclusion**

## Simulator expectations (from brief)

- Create workloads  
- Execute the three algorithms  
- Visualise process execution  
- Compare performance using standard OS metrics  

Context: audio-and-video multi-process system (justify workload characteristics in the report if relevant).
