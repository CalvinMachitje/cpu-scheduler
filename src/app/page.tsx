/**
 * Main simulator page (CMPG324 audio-and-video multi-process scheduling).
 *
 * Flow for collaborators:
 * 1) generateProcesses → workload table
 * 2) Run one algorithm (FCFS | SRTF | RR) or Simulate All
 * 3) Metrics are calculated for whatever was run; tabs show Gantt / Compare / Scaling
 *
 * Keep scheduling logic in src/lib; this file only holds UI state and wiring.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import {
  generateProcesses,
  runAlgorithm,
} from "@/lib/algorithms";
import { Process, SimulationResult, Algorithm } from "@/lib/types";
import ProcessTable from "@/components/ProcessTable";
import GanttChart from "@/components/GanttChart";
import ExecutionTrace from "@/components/ExecutionTrace";
import CpuSchedulerView from "@/components/CpuSchedulerView";
import MetricsCard from "@/components/MetricsCard";
import ComparisonChart, { ScalingChart } from "@/components/ComparisonChart";

const PROCESS_COUNTS = [10, 20, 30, 40, 50];
const ALGORITHMS: Algorithm[] = ["FCFS", "SRTF", "RR"];

const ALGO_LABELS: Record<Algorithm, string> = {
  FCFS: "FCFS",
  SRTF: "SRTF",
  RR: "Round Robin",
};

export default function Home() {
  const [processCount, setProcessCount] = useState(10);
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [seed, setSeed] = useState(42);
  const [processes, setProcesses] = useState<Process[]>(() =>
    generateProcesses(10, 42)
  );
  /** Results keyed by algorithm — supports running one or many */
  const [resultMap, setResultMap] = useState<Partial<Record<Algorithm, SimulationResult>>>({});
  const [scalingData, setScalingData] = useState<{
    waiting: any[];
    turnaround: any[];
    response: any[];
    cpu: any[];
    throughput: any[];
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runningAlgo, setRunningAlgo] = useState<Algorithm | "ALL" | "SCALING" | null>(null);
  const [activeTab, setActiveTab] = useState<"single" | "compare" | "scaling">("single");

  const results = useMemo(
    () => ALGORITHMS.map((a) => resultMap[a]).filter(Boolean) as SimulationResult[],
    [resultMap]
  );

  const hasResults = results.length > 0;

  const regenerate = useCallback(() => {
    const newSeed = Date.now() % 100000;
    setSeed(newSeed);
    setProcesses(generateProcesses(processCount, newSeed));
    setResultMap({});
  }, [processCount]);

  const handleCountChange = (count: number) => {
    setProcessCount(count);
    setProcesses(generateProcesses(count, seed));
    setResultMap({});
  };

  /** Run a single algorithm and merge into resultMap (keeps other algorithms if already run). */
  const runOne = (algorithm: Algorithm) => {
    setIsRunning(true);
    setRunningAlgo(algorithm);
    setTimeout(() => {
      const result = runAlgorithm(algorithm, processes, timeQuantum);
      setResultMap((prev) => ({ ...prev, [algorithm]: result }));
      setIsRunning(false);
      setRunningAlgo(null);
      setActiveTab("single");
    }, 30);
  };

  /** Run FCFS, SRTF and RR on the current workload and replace all results. */
  const runAll = () => {
    setIsRunning(true);
    setRunningAlgo("ALL");
    setTimeout(() => {
      const next: Partial<Record<Algorithm, SimulationResult>> = {};
      for (const algo of ALGORITHMS) {
        next[algo] = runAlgorithm(algo, processes, timeQuantum);
      }
      setResultMap(next);
      setIsRunning(false);
      setRunningAlgo(null);
      setActiveTab("compare");
    }, 50);
  };

  const clearResults = () => {
    setResultMap({});
  };

  const runScaling = () => {
    setIsRunning(true);
    setRunningAlgo("SCALING");
    setTimeout(() => {
      const waiting: any[] = [];
      const turnaround: any[] = [];
      const response: any[] = [];
      const cpu: any[] = [];
      const throughput: any[] = [];

      for (const count of PROCESS_COUNTS) {
        const procs = generateProcesses(count, seed + count);
        const fcfs = runAlgorithm("FCFS", procs, timeQuantum);
        const srtf = runAlgorithm("SRTF", procs, timeQuantum);
        const rr = runAlgorithm("RR", procs, timeQuantum);

        waiting.push({
          processCount: count,
          FCFS: Number(fcfs.metrics.avgWaitingTime.toFixed(2)),
          SRTF: Number(srtf.metrics.avgWaitingTime.toFixed(2)),
          RR: Number(rr.metrics.avgWaitingTime.toFixed(2)),
        });
        turnaround.push({
          processCount: count,
          FCFS: Number(fcfs.metrics.avgTurnaroundTime.toFixed(2)),
          SRTF: Number(srtf.metrics.avgTurnaroundTime.toFixed(2)),
          RR: Number(rr.metrics.avgTurnaroundTime.toFixed(2)),
        });
        response.push({
          processCount: count,
          FCFS: Number(fcfs.metrics.avgResponseTime.toFixed(2)),
          SRTF: Number(srtf.metrics.avgResponseTime.toFixed(2)),
          RR: Number(rr.metrics.avgResponseTime.toFixed(2)),
        });
        cpu.push({
          processCount: count,
          FCFS: Number(fcfs.metrics.cpuUtilization.toFixed(1)),
          SRTF: Number(srtf.metrics.cpuUtilization.toFixed(1)),
          RR: Number(rr.metrics.cpuUtilization.toFixed(1)),
        });
        throughput.push({
          processCount: count,
          FCFS: Number(fcfs.metrics.throughput.toFixed(4)),
          SRTF: Number(srtf.metrics.throughput.toFixed(4)),
          RR: Number(rr.metrics.throughput.toFixed(4)),
        });
      }

      setScalingData({ waiting, turnaround, response, cpu, throughput });
      setIsRunning(false);
      setRunningAlgo(null);
      setActiveTab("scaling");
    }, 50);
  };

  const bestWaiting = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((best, r) =>
      r.metrics.avgWaitingTime < best.metrics.avgWaitingTime ? r : best
    ).algorithm;
  }, [results]);

  const bestTurnaround = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((best, r) =>
      r.metrics.avgTurnaroundTime < best.metrics.avgTurnaroundTime ? r : best
    ).algorithm;
  }, [results]);

  const bestResponse = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((best, r) =>
      r.metrics.avgResponseTime < best.metrics.avgResponseTime ? r : best
    ).algorithm;
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              ⚙️
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                CPU Scheduling Simulator
              </h1>
              <p className="text-xs text-zinc-500">
                Audio-and-video multi-process system · FCFS · SRTF · Round Robin
              </p>
            </div>
          </div>
          <div className="hidden text-right text-xs text-zinc-500 sm:block">
            · Operating Systems
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Number of Processes
              </label>
              <select
                value={processCount}
                onChange={(e) => handleCountChange(Number(e.target.value))}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {PROCESS_COUNTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Time Quantum (RR)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Number(e.target.value) || 4)}
                className="w-20 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <button
              onClick={regenerate}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              🔄 New Workload
            </button>
          </div>

          {/* Per-algorithm + run all */}
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Run algorithms (metrics calculated automatically)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {ALGORITHMS.map((algo) => {
                const done = Boolean(resultMap[algo]);
                const active = runningAlgo === algo;
                return (
                  <button
                    key={algo}
                    onClick={() => runOne(algo)}
                    disabled={isRunning}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-60 ${
                      done
                        ? "border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                        : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {active ? "Running…" : done ? `✓ ${ALGO_LABELS[algo]}` : `▶ ${ALGO_LABELS[algo]}`}
                  </button>
                );
              })}

              <button
                onClick={runAll}
                disabled={isRunning}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
              >
                {runningAlgo === "ALL" ? "Running…" : "▶ Simulate All"}
              </button>

              {hasResults && (
                <button
                  onClick={clearResults}
                  disabled={isRunning}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Clear results
                </button>
              )}

              <button
                onClick={runScaling}
                disabled={isRunning}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
              >
                {runningAlgo === "SCALING" ? "Running…" : "📊 Scaling Study (10→50)"}
              </button>
            </div>
            {hasResults && (
              <p className="mt-2 text-xs text-zinc-500">
                Completed: {results.map((r) => r.algorithm).join(", ")}
                {results.length < 3 && " — run the remaining algorithms or Simulate All to compare."}
              </p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            A/V workload ({processes.length} concurrent processes)
          </h2>
          <ProcessTable processes={processes} />
        </section>

        {(hasResults || scalingData) && (
          <div className="mb-4 flex gap-2 border-b border-zinc-200 dark:border-zinc-700">
            {(["single", "compare", "scaling"] as const).map((tab) => {
              const disabled =
                (tab === "single" || tab === "compare") && !hasResults
                  ? true
                  : tab === "scaling" && !scalingData;
              return (
                <button
                  key={tab}
                  onClick={() => !disabled && setActiveTab(tab)}
                  disabled={disabled}
                  className={`px-4 py-2 text-sm font-medium capitalize transition ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : disabled
                      ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {tab === "single"
                    ? "Gantt Charts"
                    : tab === "compare"
                    ? "Metrics Comparison"
                    : "Scaling Analysis"}
                </button>
              );
            })}
          </div>
        )}

        {hasResults && activeTab === "single" && (
          <div className="space-y-6">
            {results.map((r) => (
              <div key={r.algorithm} className="space-y-3">
                <CpuSchedulerView result={r} />
                <GanttChart
                  gantt={r.gantt}
                  processes={r.processes}
                  title={`${r.algorithm} Gantt Chart`}
                />
                <ExecutionTrace
                  gantt={r.gantt}
                  processes={r.processes}
                  algorithm={r.algorithm}
                />
                <ProcessTable processes={r.processes} showResults />
              </div>
            ))}
          </div>
        )}

        {hasResults && activeTab === "compare" && (
          <div className="space-y-6">
            <div
              className={`grid gap-4 ${
                results.length === 1
                  ? "md:grid-cols-1 max-w-md"
                  : results.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
              }`}
            >
              {results.map((r) => (
                <MetricsCard
                  key={r.algorithm}
                  metrics={r.metrics}
                  algorithm={r.algorithm}
                />
              ))}
            </div>

            {results.length >= 2 && (
              <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                {bestWaiting && (
                  <p>
                    <strong>Best average waiting time:</strong> {bestWaiting}
                  </p>
                )}
                {bestTurnaround && (
                  <p>
                    <strong>Best average turnaround time:</strong> {bestTurnaround}
                  </p>
                )}
                {bestResponse && (
                  <p>
                    <strong>Best average response time:</strong> {bestResponse}
                  </p>
                )}
              </div>
            )}

            {results.length >= 2 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ComparisonChart
                  results={results}
                  metric="avgWaitingTime"
                  title="Average Waiting Time"
                />
                <ComparisonChart
                  results={results}
                  metric="avgTurnaroundTime"
                  title="Average Turnaround Time"
                />
                <ComparisonChart
                  results={results}
                  metric="avgResponseTime"
                  title="Average Response Time"
                />
                <ComparisonChart
                  results={results}
                  metric="cpuUtilization"
                  title="CPU Utilization (%)"
                />
                <ComparisonChart
                  results={results}
                  metric="throughput"
                  title="Throughput (proc / time unit)"
                />
              </div>
            )}

            {results.length === 1 && (
              <p className="text-sm text-zinc-500">
                Run at least one more algorithm (or Simulate All) to see side-by-side
                comparison charts.
              </p>
            )}
          </div>
        )}

        {scalingData && activeTab === "scaling" && (
          <div className="space-y-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Results for process counts 10 → 50 using the same generation seed offset.
              Answers the investigative questions about behaviour as the number of processes
              increases.
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <ScalingChart
                data={scalingData.waiting}
                metricLabel="Avg Waiting Time"
                yLabel="Time"
              />
              <ScalingChart
                data={scalingData.turnaround}
                metricLabel="Avg Turnaround Time"
                yLabel="Time"
              />
              <ScalingChart
                data={scalingData.response}
                metricLabel="Avg Response Time"
                yLabel="Time"
              />
              <ScalingChart
                data={scalingData.cpu}
                metricLabel="CPU Utilization (%)"
                yLabel="%"
              />
              <ScalingChart
                data={scalingData.throughput}
                metricLabel="Throughput"
                yLabel="proc/unit"
              />
            </div>
          </div>
        )}

        <footer className="mt-12 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
          <p>
            · Audio-and-video multi-process CPU scheduling · Algorithms: FCFS
            (non-preemptive) · SRTF (preemptive) · Round Robin (time quantum)
          </p>
          <p className="mt-1">
            Metrics: Waiting Time · Turnaround Time · Response Time · CPU Utilization ·
            Throughput · Processes: 10–50
          </p>
        </footer>
      </main>
    </div>
  );
}
