// root/cpu-scheduler/src/lib/types.ts
export type Algorithm = "FCFS" | "SRTF" | "RR";

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
  processId: number | null;
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

export interface SimulationResult {
  algorithm: Algorithm;
  gantt: GanttEntry[];
  processes: Process[];
  metrics: Metrics;
}

export interface ScalingDataPoint {
  processCount: number;
  FCFS: number;
  SRTF: number;
  RR: number;
}

export interface ScalingExperiment {
  metric: keyof Metrics;
  metricLabel: string;
  data: ScalingDataPoint[];
}

export type ComparisonMetric =
  | "avgWaitingTime"
  | "avgTurnaroundTime"
  | "avgResponseTime"
  | "cpuUtilization"
  | "throughput";