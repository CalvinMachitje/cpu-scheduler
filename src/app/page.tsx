// root/cpu-scheduler/src/app/page.tsx
"use client";

import { useMemo, useState } from "react";

import ComparisonChart, {
  ScalingChart,
} from "@/components/ComparisonChart";

import GanttChart from "@/components/GanttChart";
import MetricsCard from "@/components/MetricsCard";
import ProcessTable from "@/components/ProcessTable";

import {
  generateProcesses,
  runAlgorithm,
} from "@/lib/algorithms";

import {
  Algorithm,
  ComparisonMetric,
  Metrics,
  Process,
  SimulationResult,
} from "@/lib/types";

const ALGORITHMS: Algorithm[] = [
  "FCFS",
  "SRTF",
  "RR",
];

const PROCESS_OPTIONS = [
  10,
  20,
  30,
  40,
  50,
];

const ALGORITHM_META: Record<
  Algorithm,
  {
    name: string;
    description: string;
    color: string;
  }
> = {
  FCFS: {
    name: "First-Come, First-Served",
    description:
      "Processes execute in order of arrival.",
    color: "#3b82f6",
  },

  SRTF: {
    name: "Shortest Remaining Time First",
    description:
      "Preemptive scheduling based on remaining burst time.",
    color: "#22c55e",
  },

  RR: {
    name: "Round Robin",
    description:
      "Time-sharing scheduling with a configurable quantum.",
    color: "#f59e0b",
  },
};

function average(
  values: number[]
) {
  if (!values.length) return 0;

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}

function formatMetric(
  metric: ComparisonMetric,
  value: number
) {
  if (
    metric ===
    "cpuUtilization"
  ) {
    return `${value.toFixed(1)}%`;
  }

  if (
    metric === "throughput"
  ) {
    return value.toFixed(4);
  }

  return value.toFixed(2);
}

export default function Page() {
  const [processCount, setProcessCount] =
    useState(20);

  const [timeQuantum, setTimeQuantum] =
    useState(4);

  const [seed, setSeed] =
    useState(42);

  const [processes, setProcesses] =
    useState<Process[]>(() =>
      generateProcesses(20, 42)
    );

  const [results, setResults] =
    useState<SimulationResult[]>(
      []
    );

  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<Algorithm>("FCFS");

  const [activeMetric, setActiveMetric] =
    useState<ComparisonMetric>(
      "avgWaitingTime"
    );

  const [showScaling, setShowScaling] =
    useState(true);

  const [showWorkload, setShowWorkload] =
    useState(true);

  const [showGantt, setShowGantt] =
    useState(true);

  const [isRunning, setIsRunning] =
    useState(false);

  const generateWorkload = () => {
    const generated =
      generateProcesses(
        processCount,
        seed
      );

    setProcesses(generated);
    setResults([]);
  };

  const runSimulation = () => {
    setIsRunning(true);

    requestAnimationFrame(() => {
      const simulationResults =
        ALGORITHMS.map(
          (algorithm) =>
            runAlgorithm(
              algorithm,
              processes,
              timeQuantum
            )
        );

      setResults(
        simulationResults
      );

      setSelectedAlgorithm(
        "FCFS"
      );

      setIsRunning(false);
    });
  };

  const selectedResult =
    results.find(
      (result) =>
        result.algorithm ===
        selectedAlgorithm
    );

  const bestAlgorithms = useMemo(() => {
    if (!results.length) {
      return {
        waiting: null,
        turnaround: null,
        response: null,
        utilization: null,
        throughput: null,
      };
    }

    const lowest = (
      metric:
        | "avgWaitingTime"
        | "avgTurnaroundTime"
        | "avgResponseTime"
    ) =>
      results.reduce(
        (best, current) =>
          current.metrics[
            metric
          ] <
          best.metrics[metric]
            ? current
            : best
      ).algorithm;

    const highest = (
      metric:
        | "cpuUtilization"
        | "throughput"
    ) =>
      results.reduce(
        (best, current) =>
          current.metrics[
            metric
          ] >
          best.metrics[metric]
            ? current
            : best
      ).algorithm;

    return {
      waiting: lowest(
        "avgWaitingTime"
      ),
      turnaround: lowest(
        "avgTurnaroundTime"
      ),
      response: lowest(
        "avgResponseTime"
      ),
      utilization: highest(
        "cpuUtilization"
      ),
      throughput: highest(
        "throughput"
      ),
    };
  }, [results]);

  const overallWinner =
    useMemo(() => {
      if (!results.length) {
        return null;
      }

      const scores =
        results.map(
          (result) => ({
            algorithm:
              result.algorithm,
            score: 0,
          })
        );

      const metrics: {
        key:
          | "avgWaitingTime"
          | "avgTurnaroundTime"
          | "avgResponseTime"
          | "cpuUtilization"
          | "throughput";
        lower: boolean;
      }[] = [
        {
          key: "avgWaitingTime",
          lower: true,
        },
        {
          key: "avgTurnaroundTime",
          lower: true,
        },
        {
          key: "avgResponseTime",
          lower: true,
        },
        {
          key: "cpuUtilization",
          lower: false,
        },
        {
          key: "throughput",
          lower: false,
        },
      ];

      for (const metric of metrics) {
        const ordered =
          [...results].sort(
            (a, b) =>
              metric.lower
                ? a.metrics[
                    metric.key
                  ] -
                  b.metrics[
                    metric.key
                  ]
                : b.metrics[
                    metric.key
                  ] -
                  a.metrics[
                    metric.key
                  ]
          );

        ordered.forEach(
          (result, index) => {
            const score =
              scores.find(
                (item) =>
                  item.algorithm ===
                  result.algorithm
              );

            if (score) {
              score.score +=
                results.length -
                index;
            }
          }
        );
      }

      return scores.sort(
        (a, b) =>
          b.score - a.score
      )[0]?.algorithm ?? null;
    }, [results]);

  const scalingData =
    useMemo(() => {
      const counts =
        PROCESS_OPTIONS;

      const waiting = counts.map(
        (count) => {
          const workload =
            generateProcesses(
              count,
              seed
            );

          return {
            processCount: count,
            FCFS: runAlgorithm(
              "FCFS",
              workload,
              timeQuantum
            ).metrics
              .avgWaitingTime,
            SRTF: runAlgorithm(
              "SRTF",
              workload,
              timeQuantum
            ).metrics
              .avgWaitingTime,
            RR: runAlgorithm(
              "RR",
              workload,
              timeQuantum
            ).metrics
              .avgWaitingTime,
          };
        }
      );

      const turnaround =
        counts.map((count) => {
          const workload =
            generateProcesses(
              count,
              seed
            );

          return {
            processCount: count,
            FCFS: runAlgorithm(
              "FCFS",
              workload,
              timeQuantum
            ).metrics
              .avgTurnaroundTime,
            SRTF: runAlgorithm(
              "SRTF",
              workload,
              timeQuantum
            ).metrics
              .avgTurnaroundTime,
            RR: runAlgorithm(
              "RR",
              workload,
              timeQuantum
            ).metrics
              .avgTurnaroundTime,
          };
        });

      const response = counts.map(
        (count) => {
          const workload =
            generateProcesses(
              count,
              seed
            );

          return {
            processCount: count,
            FCFS: runAlgorithm(
              "FCFS",
              workload,
              timeQuantum
            ).metrics
              .avgResponseTime,
            SRTF: runAlgorithm(
              "SRTF",
              workload,
              timeQuantum
            ).metrics
              .avgResponseTime,
            RR: runAlgorithm(
              "RR",
              workload,
              timeQuantum
            ).metrics
              .avgResponseTime,
          };
        }
      );

      const utilization =
        counts.map((count) => {
          const workload =
            generateProcesses(
              count,
              seed
            );

          return {
            processCount: count,
            FCFS: runAlgorithm(
              "FCFS",
              workload,
              timeQuantum
            ).metrics
              .cpuUtilization,
            SRTF: runAlgorithm(
              "SRTF",
              workload,
              timeQuantum
            ).metrics
              .cpuUtilization,
            RR: runAlgorithm(
              "RR",
              workload,
              timeQuantum
            ).metrics
              .cpuUtilization,
          };
        });

      const throughput =
        counts.map((count) => {
          const workload =
            generateProcesses(
              count,
              seed
            );

          return {
            processCount: count,
            FCFS: runAlgorithm(
              "FCFS",
              workload,
              timeQuantum
            ).metrics
              .throughput,
            SRTF: runAlgorithm(
              "SRTF",
              workload,
              timeQuantum
            ).metrics
              .throughput,
            RR: runAlgorithm(
              "RR",
              workload,
              timeQuantum
            ).metrics
              .throughput,
          };
        });

      return {
        waiting,
        turnaround,
        response,
        utilization,
        throughput,
      };
    }, [
      seed,
      timeQuantum,
    ]);

  const workloadStats =
    useMemo(() => {
      if (!processes.length) {
        return {
          totalBurst: 0,
          avgBurst: 0,
          maxBurst: 0,
          maxArrival: 0,
        };
      }

      const bursts =
        processes.map(
          (p) => p.burstTime
        );

      return {
        totalBurst:
          bursts.reduce(
            (a, b) => a + b,
            0
          ),
        avgBurst:
          average(bursts),
        maxBurst:
          Math.max(...bursts),
        maxArrival:
          Math.max(
            ...processes.map(
              (p) =>
                p.arrivalTime
            )
          ),
      };
    }, [processes]);

  const selectedMetrics =
    selectedResult?.metrics;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      {/* HEADER */}
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white dark:bg-white dark:text-zinc-900">
                  Operating Systems
                </span>

                <span className="text-xs text-zinc-400">
                  CPU Scheduling Lab
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                CPU Scheduling Simulator
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Simulate, visualize and compare
                FCFS, SRTF and Round Robin
                scheduling algorithms using
                reproducible workloads.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={generateWorkload}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Generate Workload
              </button>

              <button
                onClick={runSimulation}
                disabled={
                  isRunning ||
                  !processes.length
                }
                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {isRunning
                  ? "Running..."
                  : "Run Simulation"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* CONTROL PANEL */}
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              Simulation Configuration
            </h2>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Configure the workload and experiment parameters before running the simulation.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Processes
              </span>

              <select
                value={processCount}
                onChange={(event) =>
                  setProcessCount(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              >
                {PROCESS_OPTIONS.map(
                  (count) => (
                    <option
                      key={count}
                      value={count}
                    >
                      {count} processes
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                RR Time Quantum
              </span>

              <input
                type="number"
                min={1}
                max={20}
                value={timeQuantum}
                onChange={(event) =>
                  setTimeQuantum(
                    Math.max(
                      1,
                      Number(
                        event.target.value
                      )
                    )
                  )
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Random Seed
              </span>

              <input
                type="number"
                value={seed}
                onChange={(event) =>
                  setSeed(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Algorithms
              </span>

              <div className="mt-2 flex h-[42px] items-center gap-2">
                {ALGORITHMS.map(
                  (algorithm) => (
                    <span
                      key={algorithm}
                      className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-bold dark:border-zinc-700"
                    >
                      {algorithm}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* WORKLOAD SUMMARY */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Processes",
              processes.length,
              "workload size",
            ],
            [
              "Total Burst",
              workloadStats.totalBurst,
              "CPU time",
            ],
            [
              "Average Burst",
              workloadStats.avgBurst.toFixed(
                1
              ),
              "time units",
            ],
            [
              "Latest Arrival",
              workloadStats.maxArrival,
              "time units",
            ],
          ].map(
            ([label, value, suffix]) => (
              <div
                key={label}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {label}
                </p>

                <p className="mt-2 text-2xl font-black tracking-tight">
                  {value}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {suffix}
                </p>
              </div>
            )
          )}
        </section>

        {/* EMPTY STATE */}
        {!results.length && (
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-xl font-black dark:bg-zinc-800">
                CPU
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Ready to simulate
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Configure the workload above and
                run the simulation to compare the
                three scheduling algorithms.
              </p>

              <button
                onClick={runSimulation}
                className="mt-6 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-zinc-950"
              >
                Run Simulation
              </button>
            </div>
          </section>
        )}

        {/* RESULTS */}
        {results.length > 0 && (
          <>
            {/* EXECUTIVE SUMMARY */}
            <section className="rounded-2xl border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm dark:border-zinc-800">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Simulation Summary
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    {overallWinner} performs best overall
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Ranking considers waiting time,
                    turnaround time, response time,
                    CPU utilization and throughput
                    across the current workload.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Workload
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {processes.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Quantum
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {timeQuantum}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Seed
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {seed}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* BEST METRICS */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-black">
                  Performance Overview
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Best-performing algorithm for each required metric.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  [
                    "Waiting Time",
                    bestAlgorithms.waiting,
                    "Lower is better",
                  ],
                  [
                    "Turnaround",
                    bestAlgorithms.turnaround,
                    "Lower is better",
                  ],
                  [
                    "Response",
                    bestAlgorithms.response,
                    "Lower is better",
                  ],
                  [
                    "CPU Utilization",
                    bestAlgorithms.utilization,
                    "Higher is better",
                  ],
                  [
                    "Throughput",
                    bestAlgorithms.throughput,
                    "Higher is better",
                  ],
                ].map(
                  ([label, winner, direction]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {label}
                      </p>

                      <p className="mt-3 text-xl font-black">
                        {winner}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {direction}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* ALGORITHM CARDS */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-black">
                  Algorithm Results
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Detailed performance metrics for each scheduling strategy.
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {results.map(
                  (result) => (
                    <MetricsCard
                      key={
                        result.algorithm
                      }
                      algorithm={
                        result.algorithm
                      }
                      metrics={
                        result.metrics
                      }
                      isBest={
                        result.algorithm ===
                        overallWinner
                      }
                    />
                  )
                )}
              </div>
            </section>

            {/* METRIC COMPARISON */}
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-black">
                    Metric Comparison
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Compare the scheduling algorithms on individual performance measures.
                  </p>
                </div>

                <select
                  value={activeMetric}
                  onChange={(event) =>
                    setActiveMetric(
                      event.target
                        .value as ComparisonMetric
                    )
                  }
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="avgWaitingTime">
                    Average Waiting Time
                  </option>

                  <option value="avgTurnaroundTime">
                    Average Turnaround Time
                  </option>

                  <option value="avgResponseTime">
                    Average Response Time
                  </option>

                  <option value="cpuUtilization">
                    CPU Utilization
                  </option>

                  <option value="throughput">
                    Throughput
                  </option>
                </select>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <ComparisonChart
                  results={results}
                  metric={
                    activeMetric
                  }
                  title="Algorithm Comparison"
                />

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-sm font-bold">
                    Metric Interpretation
                  </h3>

                  <div className="mt-4 space-y-3">
                    {results.map(
                      (result) => (
                        <div
                          key={
                            result.algorithm
                          }
                          className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  ALGORITHM_META[
                                    result.algorithm
                                  ].color,
                              }}
                            />

                            <span className="text-sm font-semibold">
                              {
                                result.algorithm
                              }
                            </span>
                          </div>

                          <span className="font-mono text-sm font-bold">
                            {formatMetric(
                              activeMetric,
                              result.metrics[
                                activeMetric
                              ]
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* GANTT */}
            <section>
              <button
                onClick={() =>
                  setShowGantt(
                    (value) =>
                      !value
                  )
                }
                className="mb-4 flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <h2 className="text-lg font-black">
                    CPU Execution Timeline
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Gantt chart showing process execution order.
                  </p>
                </div>

                <span className="text-xs font-bold text-zinc-400">
                  {showGantt
                    ? "Collapse"
                    : "Expand"}
                </span>
              </button>

              {showGantt && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {ALGORITHMS.map(
                      (algorithm) => (
                        <button
                          key={
                            algorithm
                          }
                          onClick={() =>
                            setSelectedAlgorithm(
                              algorithm
                            )
                          }
                          className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                            selectedAlgorithm ===
                            algorithm
                              ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                              : "border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                          }`}
                        >
                          {algorithm}
                        </button>
                      )
                    )}
                  </div>

                  {selectedResult && (
                    <GanttChart
                      gantt={
                        selectedResult.gantt
                      }
                      title={`${selectedAlgorithm} — ${ALGORITHM_META[selectedAlgorithm].name}`}
                    />
                  )}
                </div>
              )}
            </section>

            {/* PROCESS RESULTS */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-black">
                  Process-Level Results
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Completion, waiting, turnaround and response times for the selected algorithm.
                </p>
              </div>

              {selectedResult && (
                <ProcessTable
                  processes={
                    selectedResult.processes
                  }
                  showResults
                />
              )}
            </section>

            {/* SCALING EXPERIMENT */}
            <section>
              <button
                onClick={() =>
                  setShowScaling(
                    (value) =>
                      !value
                  )
                }
                className="mb-4 flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <h2 className="text-lg font-black">
                    Scaling Experiment
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Compare performance as the number of processes increases from 10 to 50.
                  </p>
                </div>

                <span className="text-xs font-bold text-zinc-400">
                  {showScaling
                    ? "Collapse"
                    : "Expand"}
                </span>
              </button>

              {showScaling && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <ScalingChart
                    data={
                      scalingData.waiting
                    }
                    metricLabel="Average Waiting Time"
                  />

                  <ScalingChart
                    data={
                      scalingData.turnaround
                    }
                    metricLabel="Average Turnaround Time"
                  />

                  <ScalingChart
                    data={
                      scalingData.response
                    }
                    metricLabel="Average Response Time"
                  />

                  <ScalingChart
                    data={
                      scalingData.utilization
                    }
                    metricLabel="CPU Utilization"
                  />

                  <div className="lg:col-span-2">
                    <ScalingChart
                      data={
                        scalingData.throughput
                      }
                      metricLabel="Throughput"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* INPUT WORKLOAD */}
            <section>
              <button
                onClick={() =>
                  setShowWorkload(
                    (value) =>
                      !value
                  )
                }
                className="mb-4 flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <h2 className="text-lg font-black">
                    Input Workload
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Generated process parameters used in this experiment.
                  </p>
                </div>

                <span className="text-xs font-bold text-zinc-400">
                  {showWorkload
                    ? "Collapse"
                    : "Expand"}
                </span>
              </button>

              {showWorkload && (
                <ProcessTable
                  processes={
                    processes
                  }
                />
              )}
            </section>

            {/* METHODOLOGY */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-black">
                Experiment Notes
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <h3 className="text-sm font-bold">
                    FCFS
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Non-preemptive scheduling where processes execute according to arrival order.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold">
                    SRTF
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Preemptive scheduling that selects the process with the shortest remaining execution time.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold">
                    Round Robin
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Time-sharing scheduling where each ready process receives a fixed CPU quantum.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                <p className="text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                  The current experiment uses a deterministic
                  random seed so that workloads can be reproduced.
                  Scaling analysis evaluates workloads containing
                  10, 20, 30, 40 and 50 processes using the same
                  seed and Round Robin quantum.
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-zinc-400 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
          <span>
            CPU Scheduling Simulator
          </span>

          <span>
            FCFS · SRTF · Round Robin
          </span>
        </div>
      </footer>
    </main>
  );
}