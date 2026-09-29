/**
 * Scheduling core for audio-and-video multi-process system.
 *
 * Important exports for collaborators:
 * - generateProcesses  → build a random workload (assignment: 10–50 processes)
 * - runAlgorithm       → run FCFS | SRTF | RR and attach state timeline
 * - runFCFS / runSRTF / runRR → individual schedulers (prefer runAlgorithm from UI)
 * - buildStateTimeline → Ready/Running/Blocked/Terminated per time unit for the CPU view
 *
 * Do not reimplement these rules inside React components.
 */
import {
  Process,
  GanttEntry,
  Metrics,
  SimulationResult,
  Algorithm,
  StateSnapshot,
} from "./types";

/** Clone workload and reset runtime fields so each algorithm starts clean. */
function deepCopyProcesses(processes: Process[]): Process[] {
  return processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
    startTime: undefined,
    completionTime: undefined,
    waitingTime: undefined,
    turnaroundTime: undefined,
    responseTime: undefined,
    firstRun: true,
  }));
}

/**
 * Metrics:
 * waiting = TAT − burst, TAT = completion − arrival, response = first run − arrival,
 * CPU util = total burst / total time, throughput = n / total time.
 */
function calculateMetrics(processes: Process[], totalTime: number): Metrics {
  const n = processes.length;
  if (n === 0 || totalTime === 0) {
    return {
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
      throughput: 0,
      totalTime: 0,
    };
  }

  const totalWaiting = processes.reduce((sum, p) => sum + (p.waitingTime || 0), 0);
  const totalTurnaround = processes.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalResponse = processes.reduce((sum, p) => sum + (p.responseTime || 0), 0);
  const totalBurst = processes.reduce((sum, p) => sum + p.burstTime, 0);

  return {
    avgWaitingTime: totalWaiting / n,
    avgTurnaroundTime: totalTurnaround / n,
    avgResponseTime: totalResponse / n,
    cpuUtilization: (totalBurst / totalTime) * 100,
    throughput: n / totalTime,
    totalTime,
  };
}

/** Non-preemptive: run processes in arrival order to completion. */
export function runFCFS(original: Process[]): SimulationResult {
  const processes = deepCopyProcesses(original);
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id);

  const gantt: GanttEntry[] = [];
  let currentTime = 0;

  for (const p of processes) {
    if (currentTime < p.arrivalTime) {
      currentTime = p.arrivalTime;
    }
    p.startTime = currentTime;
    p.responseTime = currentTime - p.arrivalTime;
    p.completionTime = currentTime + p.burstTime;
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.waitingTime = p.turnaroundTime - p.burstTime;

    gantt.push({
      processId: p.id,
      start: currentTime,
      end: p.completionTime,
    });
    currentTime = p.completionTime;
  }

  return {
    algorithm: "FCFS",
    gantt,
    processes,
    metrics: calculateMetrics(processes, currentTime),
  };
}

/**
 * Preemptive shortest-remaining-time: each time unit, run the ready process
 * with the least remaining burst (ties broken by arrival, then id).
 */
export function runSRTF(original: Process[]): SimulationResult {
  const processes = deepCopyProcesses(original);
  const n = processes.length;
  const gantt: GanttEntry[] = [];
  let currentTime = 0;
  let completed = 0;
  let lastProcessId: number | null = null;
  let ganttStart = 0;

  const maxArrival = Math.max(...processes.map((p) => p.arrivalTime));
  const totalBurst = processes.reduce((s, p) => s + p.burstTime, 0);
  const maxTime = maxArrival + totalBurst + 1000;

  while (completed < n && currentTime < maxTime) {
    const available = processes.filter(
      (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    if (available.length === 0) {
      const remaining = processes.filter((p) => p.remainingTime > 0);
      if (remaining.length === 0) break;
      const nextArrival = Math.min(...remaining.map((p) => p.arrivalTime));
      if (lastProcessId !== null) {
        gantt.push({ processId: lastProcessId, start: ganttStart, end: currentTime });
        lastProcessId = null;
      }
      currentTime = nextArrival;
      continue;
    }

    available.sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime);
    const current = available[0];

    if (lastProcessId !== current.id) {
      if (lastProcessId !== null) {
        gantt.push({ processId: lastProcessId, start: ganttStart, end: currentTime });
      }
      ganttStart = currentTime;
      lastProcessId = current.id;
      if (current.firstRun) {
        current.responseTime = currentTime - current.arrivalTime;
        current.firstRun = false;
        current.startTime = currentTime;
      }
    }

    current.remainingTime -= 1;
    currentTime += 1;

    if (current.remainingTime === 0) {
      current.completionTime = currentTime;
      current.turnaroundTime = current.completionTime - current.arrivalTime;
      current.waitingTime = current.turnaroundTime - current.burstTime;
      completed += 1;
      gantt.push({ processId: current.id, start: ganttStart, end: currentTime });
      lastProcessId = null;
    }
  }

  if (lastProcessId !== null) {
    gantt.push({ processId: lastProcessId, start: ganttStart, end: currentTime });
  }

  const mergedGantt: GanttEntry[] = [];
  for (const entry of gantt) {
    const last = mergedGantt[mergedGantt.length - 1];
    if (last && last.processId === entry.processId && last.end === entry.start) {
      last.end = entry.end;
    } else {
      mergedGantt.push({ ...entry });
    }
  }

  return {
    algorithm: "SRTF",
    gantt: mergedGantt,
    processes,
    metrics: calculateMetrics(processes, currentTime),
  };
}

/**
 * Preemptive Round Robin: each ready process runs for at most timeQuantum,
 * then goes to the back of the ready queue if it still has remaining time.
 */
export function runRR(original: Process[], timeQuantum: number): SimulationResult {
  const processes = deepCopyProcesses(original);
  const n = processes.length;
  const gantt: GanttEntry[] = [];
  let currentTime = 0;
  let completed = 0;

  const queue: number[] = [];
  const arrived = new Set<number>();

  const addArrived = () => {
    for (const p of processes) {
      if (p.arrivalTime <= currentTime && !arrived.has(p.id) && p.remainingTime > 0) {
        queue.push(p.id);
        arrived.add(p.id);
      }
    }
  };

  addArrived();

  const maxTime =
    Math.max(...processes.map((p) => p.arrivalTime)) +
    processes.reduce((s, p) => s + p.burstTime, 0) +
    1000;

  while (completed < n && currentTime < maxTime) {
    if (queue.length === 0) {
      const next = processes
        .filter((p) => p.remainingTime > 0 && !arrived.has(p.id))
        .sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      if (!next) break;
      currentTime = next.arrivalTime;
      addArrived();
      continue;
    }

    const pid = queue.shift()!;
    const p = processes.find((x) => x.id === pid)!;

    if (p.firstRun) {
      p.responseTime = currentTime - p.arrivalTime;
      p.firstRun = false;
      p.startTime = currentTime;
    }

    const execTime = Math.min(timeQuantum, p.remainingTime);
    gantt.push({
      processId: p.id,
      start: currentTime,
      end: currentTime + execTime,
    });

    p.remainingTime -= execTime;
    currentTime += execTime;
    addArrived();

    if (p.remainingTime > 0) {
      queue.push(p.id);
    } else {
      p.completionTime = currentTime;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime = p.turnaroundTime - p.burstTime;
      completed += 1;
    }
  }

  const mergedGantt: GanttEntry[] = [];
  for (const entry of gantt) {
    const last = mergedGantt[mergedGantt.length - 1];
    if (last && last.processId === entry.processId && last.end === entry.start) {
      last.end = entry.end;
    } else {
      mergedGantt.push({ ...entry });
    }
  }

  return {
    algorithm: "RR",
    gantt: mergedGantt,
    processes,
    metrics: calculateMetrics(processes, currentTime),
  };
}

/**
 * Builds one StateSnapshot per time unit from Gantt + completion times.
 * Required input for CpuSchedulerView play/scrub visualisation.
 */
export function buildStateTimeline(
  processes: Process[],
  gantt: GanttEntry[],
  totalTime: number
): StateSnapshot[] {
  const snapshots: StateSnapshot[] = [];
  const maxT = Math.max(totalTime, 0);

  for (let t = 0; t <= maxT; t++) {
    const runningEntry = gantt.find((g) => t >= g.start && t < g.end);

    const ready: number[] = [];
    const blocked: number[] = [];
    const terminated: number[] = [];

    for (const p of processes) {
      const done = p.completionTime !== undefined && t >= p.completionTime;
      const arrived = t >= p.arrivalTime;

      if (done) {
        terminated.push(p.id);
      } else if (!arrived) {
        blocked.push(p.id);
      } else if (runningEntry?.processId === p.id) {
        // on CPU
      } else {
        ready.push(p.id);
      }
    }

    ready.sort((a, b) => {
      const pa = processes.find((x) => x.id === a)!;
      const pb = processes.find((x) => x.id === b)!;
      return pa.arrivalTime - pb.arrivalTime || a - b;
    });
    blocked.sort((a, b) => a - b);
    terminated.sort((a, b) => a - b);

    snapshots.push({
      time: t,
      running: runningEntry ? runningEntry.processId : null,
      ready,
      blocked,
      terminated,
      cpuIdle: !runningEntry,
    });
  }

  return snapshots;
}

/** Attaches timeline to a simulation result before returning to the UI. */
function withTimeline(result: SimulationResult): SimulationResult {
  return {
    ...result,
    timeline: buildStateTimeline(result.processes, result.gantt, result.metrics.totalTime),
  };
}

/**
 * Main entry point from the UI: run one algorithm and return Gantt, metrics, timeline.
 * Always prefer this over calling runFCFS/runSRTF/runRR directly from page.tsx.
 */
export function runAlgorithm(
  algorithm: Algorithm,
  processes: Process[],
  timeQuantum: number = 4
): SimulationResult {
  let result: SimulationResult;
  switch (algorithm) {
    case "FCFS":
      result = runFCFS(processes);
      break;
    case "SRTF":
      result = runSRTF(processes);
      break;
    case "RR":
      result = runRR(processes, timeQuantum);
      break;
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
  return withTimeline(result);
}

/**
 * Workload generator: random incremental arrivals, random burst 1–15,
 * random priority 1–10.
 */
export function generateProcesses(count: number, seed?: number): Process[] {
  let s = seed ?? Date.now();
  const random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  const processes: Process[] = [];
  let arrival = 0;

  for (let i = 1; i <= count; i++) {
    arrival += Math.floor(random() * 6);
    const burst = Math.floor(random() * 15) + 1;
    const priority = Math.floor(random() * 10) + 1;

    processes.push({
      id: i,
      arrivalTime: arrival,
      burstTime: burst,
      priority,
      remainingTime: burst,
    });
  }

  return processes;
}
