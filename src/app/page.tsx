"use client";

import { useState, useMemo, useCallback } from "react";
import {
  generateProcesses,
  runAlgorithm,
} from "@/lib/algorithms";
import { Process, SimulationResult } from "@/lib/types";
import ProcessTable from "@/components/ProcessTable";
import GanttChart from "@/components/GanttChart";
import ExecutionTrace from "@/components/ExecutionTrace";
import CpuSchedulerView from "@/components/CpuSchedulerView";
import MetricsCard from "@/components/MetricsCard";
import ComparisonChart, { ScalingChart } from "@/components/ComparisonChart";


const PROCESS_COUNTS = [10, 20, 30, 40, 50];

export default function Home() {
  const [processCount, setProcessCount] = useState(10);
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [seed, setSeed] = useState(42);
  const [processes, setProcesses] = useState<Process[]>(() =>
    generateProcesses(10, 42)
  );
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [scalingData, setScalingData] = useState<{
    waiting: any[];
    turnaround: any[];
    response: any[];
    cpu: any[];
    throughput: any[];
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "compare" | "scaling">("single");

  const regenerate = useCallback(() => {
    const newSeed = Date.now() % 100000;
    setSeed(newSeed);
    setProcesses(generateProcesses(processCount, newSeed));
    setResults(null);
  }, [processCount]);

  const handleCountChange = (count: number) => {
    setProcessCount(count);
    setProcesses(generateProcesses(count, seed));
    setResults(null);
  };

  const runSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const fcfs = runAlgorithm("FCFS", processes);
      const srtf = runAlgorithm("SRTF", processes);
      const rr = runAlgorithm("RR", processes, timeQuantum);
      setResults([fcfs, srtf, rr]);
      setIsRunning(false);
      setActiveTab("compare");
    }, 50);
  };

  const runScaling = () => {
    setIsRunning(true);
    setTimeout(() => {
      const waiting: any[] = [];
      const turnaround: any[] = [];
      const response: any[] = [];
      const cpu: any[] = [];
      const throughput: any[] = [];

      for (const count of PROCESS_COUNTS) {
        const procs = generateProcesses(count, seed + count);
        const fcfs = runAlgorithm("FCFS", procs);
        const srtf = runAlgorithm("SRTF", procs);
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
      setActiveTab("scaling");
    }, 50);
  };

  const bestWaiting = useMemo(() => {
    if (!results) return null;
    return results.reduce((best, r) =>
      r.metrics.avgWaitingTime < best.metrics.avgWaitingTime ? r : best
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
                 · FCFS · SRTF · Round Robin
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
              🔄
              New Workload
            </button>

            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
            >
              ▶
              {isRunning ? "Running…" : "Simulate All"}
            </button>

            <button
              onClick={runScaling}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
            >
              📊
              Scaling Study (10→50)
            </button>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Current Workload ({processes.length} processes)
          </h2>
          <ProcessTable processes={processes} />
        </section>

        {results && (
          <div className="mb-4 flex gap-2 border-b border-zinc-200 dark:border-zinc-700">
            {(["single", "compare", "scaling"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {tab === "single"
                  ? "Gantt Charts"
                  : tab === "compare"
                  ? "Metrics Comparison"
                  : "Scaling Analysis"}
              </button>
            ))}
          </div>
        )}

        {results && activeTab === "single" && (
          <div className="space-y-6">
            {results.map((r) => (
              <div key={r.algorithm} className="space-y-3">
                <CpuSchedulerView result={r} />
                <GanttChart gantt={r.gantt} processes={r.processes} title={`${r.algorithm} Gantt Chart`} />
                <ExecutionTrace gantt={r.gantt} processes={r.processes} algorithm={r.algorithm} />
                <ProcessTable processes={r.processes} showResults />
              </div>
            ))}
          </div>
        )}

        {results && activeTab === "compare" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {results.map((r) => (
                <MetricsCard
                  key={r.algorithm}
                  metrics={r.metrics}
                  algorithm={r.algorithm}
                />
              ))}
            </div>

            {bestWaiting && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                <strong>Best average waiting time:</strong> {bestWaiting}
              </div>
            )}

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
          </div>
        )}

        {scalingData && activeTab === "scaling" && (
          <div className="space-y-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Results for process counts 10 → 50 using the same generation seed offset.
              Answers the investigative questions about behaviour as the number of processes increases.
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
            Algorithms: First-Come-First-Served (non-preemptive) · Shortest Remaining Time First
            (preemptive SJF) · Round Robin (preemptive with quantum)
          </p>
          <p className="mt-1">
            Metrics: Waiting Time · Turnaround Time · Response Time · CPU Utilization · Throughput
          </p>
        </footer>
      </main>
    </div>
  );
}
