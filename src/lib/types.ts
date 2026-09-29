/**
 * Shared domain types for the audio-and-video CPU scheduling simulator.
 * Collaborators: keep algorithm names typed as Algorithm; do not widen to string.
 */

/** One A/V task competing for the CPU. Runtime fields are filled by the schedulers. */
export interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime: number;
  startTime?: number;
  completionTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  responseTime?: number;
  firstRun?: boolean;
}

/** One continuous CPU burst on the Gantt chart: process runs on [start, end). */
export interface GanttEntry {
  processId: number;
  start: number;
  end: number;
  color?: string;
}

/** Aggregate performance brief. */
export interface Metrics {
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
  throughput: number;
  totalTime: number;
}

export type ProcessStateName = "new" | "ready" | "running" | "blocked" | "terminated";

/**
 * Process queues at a single time unit — used by CpuSchedulerView playback.
 * blocked = not yet arrived; ready = waiting for CPU; running = on CPU.
 */
export interface StateSnapshot {
  time: number;
  running: number | null;
  ready: number[];
  blocked: number[];
  terminated: number[];
  cpuIdle: boolean;
}

/** The three algorithms required. */
export type Algorithm = "FCFS" | "SRTF" | "RR";

/** Full output of one algorithm run — pass this into UI components. */
export interface SimulationResult {
  algorithm: Algorithm;
  gantt: GanttEntry[];
  processes: Process[];
  metrics: Metrics;
  timeline?: StateSnapshot[];
}
