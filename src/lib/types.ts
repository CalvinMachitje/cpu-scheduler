export interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime: number;
  // Runtime tracking
  startTime?: number;
  completionTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  responseTime?: number;
  firstRun?: boolean;
}

export interface GanttEntry {
  processId: number;
  start: number;
  end: number;
  color?: string;
}

export interface Metrics {
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
  throughput: number;
  totalTime: number;
}

/** Classic process states for visualization */
export type ProcessStateName = "new" | "ready" | "running" | "blocked" | "terminated";

export interface StateSnapshot {
  time: number;
  /** Process currently on the CPU (null if idle) */
  running: number | null;
  /** Process IDs in the ready queue (FIFO order) */
  ready: number[];
  /** Process IDs blocked / not yet arrived (waiting to enter system) */
  blocked: number[];
  /** Process IDs that have finished */
  terminated: number[];
  /** True when CPU is idle */
  cpuIdle: boolean;
}

export interface SimulationResult {
  algorithm: Algorithm;
  gantt: GanttEntry[];
  processes: Process[];
  metrics: Metrics;
  /** One snapshot per time unit for realistic state playback */
  timeline?: StateSnapshot[];
}

export type Algorithm = "FCFS" | "SRTF" | "RR";
