// root/cpu-scheduler/src/lib/algorithms.ts
import {
  Algorithm,
  GanttEntry,
  Metrics,
  Process,
  SimulationResult,
} from "./types";

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

function calculateMetrics(
  processes: Process[],
  totalTime: number
): Metrics {
  const n = processes.length;

  if (n === 0 || totalTime <= 0) {
    return {
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
      throughput: 0,
      totalTime: 0,
    };
  }

  const totalWaiting = processes.reduce(
    (sum, p) => sum + (p.waitingTime ?? 0),
    0
  );

  const totalTurnaround = processes.reduce(
    (sum, p) => sum + (p.turnaroundTime ?? 0),
    0
  );

  const totalResponse = processes.reduce(
    (sum, p) => sum + (p.responseTime ?? 0),
    0
  );

  const totalBurst = processes.reduce(
    (sum, p) => sum + p.burstTime,
    0
  );

  return {
    avgWaitingTime: totalWaiting / n,
    avgTurnaroundTime: totalTurnaround / n,
    avgResponseTime: totalResponse / n,
    cpuUtilization: Math.min(100, (totalBurst / totalTime) * 100),
    throughput: n / totalTime,
    totalTime,
  };
}

function addIdleEntry(
  gantt: GanttEntry[],
  start: number,
  end: number
) {
  if (end <= start) return;

  const last = gantt[gantt.length - 1];

  if (
    last &&
    last.processId === null &&
    last.end === start
  ) {
    last.end = end;
  } else {
    gantt.push({
      processId: null,
      start,
      end,
    });
  }
}

function addGanttEntry(
  gantt: GanttEntry[],
  processId: number,
  start: number,
  end: number
) {
  if (end <= start) return;

  const last = gantt[gantt.length - 1];

  if (
    last &&
    last.processId === processId &&
    last.end === start
  ) {
    last.end = end;
  } else {
    gantt.push({
      processId,
      start,
      end,
    });
  }
}

export function runFCFS(
  original: Process[]
): SimulationResult {
  const processes = deepCopyProcesses(original);

  processes.sort(
    (a, b) =>
      a.arrivalTime - b.arrivalTime ||
      a.id - b.id
  );

  const gantt: GanttEntry[] = [];

  let currentTime = 0;

  for (const process of processes) {
    if (currentTime < process.arrivalTime) {
      addIdleEntry(
        gantt,
        currentTime,
        process.arrivalTime
      );

      currentTime = process.arrivalTime;
    }

    process.startTime = currentTime;

    process.responseTime =
      currentTime - process.arrivalTime;

    process.completionTime =
      currentTime + process.burstTime;

    process.turnaroundTime =
      process.completionTime -
      process.arrivalTime;

    process.waitingTime =
      process.turnaroundTime -
      process.burstTime;

    process.remainingTime = 0;
    process.firstRun = false;

    addGanttEntry(
      gantt,
      process.id,
      currentTime,
      process.completionTime
    );

    currentTime = process.completionTime;
  }

  return {
    algorithm: "FCFS",
    gantt,
    processes,
    metrics: calculateMetrics(
      processes,
      currentTime
    ),
  };
}

export function runSRTF(
  original: Process[]
): SimulationResult {
  const processes = deepCopyProcesses(original);

  const gantt: GanttEntry[] = [];

  let currentTime = 0;
  let completed = 0;

  const totalBurst = processes.reduce(
    (sum, p) => sum + p.burstTime,
    0
  );

  const maxArrival = Math.max(
    ...processes.map((p) => p.arrivalTime),
    0
  );

  const maxTime =
    maxArrival +
    totalBurst +
    1000;

  while (
    completed < processes.length &&
    currentTime < maxTime
  ) {
    const available = processes
      .filter(
        (p) =>
          p.arrivalTime <= currentTime &&
          p.remainingTime > 0
      )
      .sort(
        (a, b) =>
          a.remainingTime -
            b.remainingTime ||
          a.arrivalTime -
            b.arrivalTime ||
          a.id - b.id
      );

    if (available.length === 0) {
      const remaining = processes
        .filter((p) => p.remainingTime > 0)
        .sort(
          (a, b) =>
            a.arrivalTime -
            b.arrivalTime
        );

      if (remaining.length === 0) {
        break;
      }

      const nextArrival =
        remaining[0].arrivalTime;

      addIdleEntry(
        gantt,
        currentTime,
        nextArrival
      );

      currentTime = nextArrival;

      continue;
    }

    const current = available[0];

    if (current.firstRun) {
      current.startTime = currentTime;

      current.responseTime =
        currentTime -
        current.arrivalTime;

      current.firstRun = false;
    }

    addGanttEntry(
      gantt,
      current.id,
      currentTime,
      currentTime + 1
    );

    current.remainingTime -= 1;
    currentTime += 1;

    if (current.remainingTime === 0) {
      current.completionTime =
        currentTime;

      current.turnaroundTime =
        current.completionTime -
        current.arrivalTime;

      current.waitingTime =
        current.turnaroundTime -
        current.burstTime;

      completed += 1;
    }
  }

  return {
    algorithm: "SRTF",
    gantt,
    processes,
    metrics: calculateMetrics(
      processes,
      currentTime
    ),
  };
}

export function runRR(
  original: Process[],
  timeQuantum: number
): SimulationResult {
  const processes = deepCopyProcesses(original);

  const gantt: GanttEntry[] = [];

  const queue: number[] = [];
  const arrived = new Set<number>();

  let currentTime = 0;
  let completed = 0;

  const addArrived = () => {
    const newlyArrived = processes
      .filter(
        (p) =>
          p.arrivalTime <= currentTime &&
          !arrived.has(p.id) &&
          p.remainingTime > 0
      )
      .sort(
        (a, b) =>
          a.arrivalTime -
            b.arrivalTime ||
          a.id - b.id
      );

    for (const process of newlyArrived) {
      queue.push(process.id);
      arrived.add(process.id);
    }
  };

  addArrived();

  const totalBurst = processes.reduce(
    (sum, p) => sum + p.burstTime,
    0
  );

  const maxArrival = Math.max(
    ...processes.map((p) => p.arrivalTime),
    0
  );

  const maxTime =
    maxArrival +
    totalBurst +
    1000;

  while (
    completed < processes.length &&
    currentTime < maxTime
  ) {
    if (queue.length === 0) {
      const next = processes
        .filter(
          (p) =>
            p.remainingTime > 0 &&
            !arrived.has(p.id)
        )
        .sort(
          (a, b) =>
            a.arrivalTime -
            b.arrivalTime ||
            a.id - b.id
        )[0];

      if (!next) {
        break;
      }

      addIdleEntry(
        gantt,
        currentTime,
        next.arrivalTime
      );

      currentTime =
        next.arrivalTime;

      addArrived();

      continue;
    }

    const pid = queue.shift();

    if (pid === undefined) {
      continue;
    }

    const process = processes.find(
      (p) => p.id === pid
    );

    if (!process) {
      continue;
    }

    if (process.firstRun) {
      process.startTime =
        currentTime;

      process.responseTime =
        currentTime -
        process.arrivalTime;

      process.firstRun = false;
    }

    const executionTime = Math.min(
      timeQuantum,
      process.remainingTime
    );

    addGanttEntry(
      gantt,
      process.id,
      currentTime,
      currentTime + executionTime
    );

    process.remainingTime -=
      executionTime;

    currentTime += executionTime;

    addArrived();

    if (process.remainingTime > 0) {
      queue.push(process.id);
    } else {
      process.completionTime =
        currentTime;

      process.turnaroundTime =
        process.completionTime -
        process.arrivalTime;

      process.waitingTime =
        process.turnaroundTime -
        process.burstTime;

      completed += 1;
    }
  }

  return {
    algorithm: "RR",
    gantt,
    processes,
    metrics: calculateMetrics(
      processes,
      currentTime
    ),
  };
}

export function runAlgorithm(
  algorithm: Algorithm,
  processes: Process[],
  timeQuantum = 4
): SimulationResult {
  switch (algorithm) {
    case "FCFS":
      return runFCFS(processes);

    case "SRTF":
      return runSRTF(processes);

    case "RR":
      return runRR(
        processes,
        Math.max(1, timeQuantum)
      );

    default:
      throw new Error(
        `Unknown algorithm: ${algorithm}`
      );
  }
}

export function generateProcesses(
  count: number,
  seed = Date.now()
): Process[] {
  let s = seed || 1;

  const random = () => {
    s =
      (s * 16807) %
      2147483647;

    return (
      (s - 1) /
      2147483646
    );
  };

  const processes: Process[] = [];

  let arrival = 0;

  for (
    let i = 1;
    i <= count;
    i++
  ) {
    arrival += Math.floor(
      random() * 6
    );

    const burst =
      Math.floor(
        random() * 15
      ) + 1;

    const priority =
      Math.floor(
        random() * 10
      ) + 1;

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