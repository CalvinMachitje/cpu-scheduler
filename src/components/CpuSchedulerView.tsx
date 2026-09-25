"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Process, SimulationResult, StateSnapshot } from "@/lib/types";

const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#e11d48", "#a855f7", "#0ea5e9", "#eab308",
  "#10b981", "#f43f5e", "#64748b", "#d946ef", "#0d9488",
];

function getColor(pid: number) {
  return COLORS[(pid - 1) % COLORS.length];
}

function ProcessChip({
  id,
  size = "md",
  pulse = false,
}: {
  id: number;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}) {
  const sizes = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-sm",
  };
  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full font-bold text-white shadow-md ${
        pulse ? "animate-pulse ring-2 ring-offset-2 ring-blue-400" : ""
      }`}
      style={{ backgroundColor: getColor(id) }}
      title={`Process P${id}`}
    >
      P{id}
    </div>
  );
}

function StateColumn({
  title,
  subtitle,
  colorClass,
  borderClass,
  children,
  count,
}: {
  title: string;
  subtitle: string;
  colorClass: string;
  borderClass: string;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <div
      className={`flex min-h-[180px] flex-col rounded-xl border-2 ${borderClass} bg-white dark:bg-zinc-900`}
    >
      <div className={`rounded-t-[10px] px-3 py-2 ${colorClass}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white">{title}</h4>
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold text-white">
            {count}
          </span>
        </div>
        <p className="text-[10px] text-white/80">{subtitle}</p>
      </div>
      <div className="flex flex-1 flex-wrap content-start gap-2 p-3">{children}</div>
    </div>
  );
}

interface CpuSchedulerViewProps {
  result: SimulationResult;
}

export default function CpuSchedulerView({ result }: CpuSchedulerViewProps) {
  const timeline = result.timeline ?? [];
  const processes = result.processes;
  const maxTime = Math.max(result.metrics.totalTime, 1);

  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400); // ms per time unit

  const snapshot: StateSnapshot = useMemo(() => {
    if (!timeline.length) {
      return {
        time: 0,
        running: null,
        ready: [],
        blocked: processes.map((p) => p.id),
        terminated: [],
        cpuIdle: true,
      };
    }
    const idx = Math.min(time, timeline.length - 1);
    return timeline[idx];
  }, [timeline, time, processes]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    if (time >= maxTime) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setTime((t) => Math.min(t + 1, maxTime)), speed);
    return () => clearTimeout(id);
  }, [playing, time, maxTime, speed]);

  const processMap = useMemo(() => {
    const m = new Map<number, Process>();
    processes.forEach((p) => m.set(p.id, p));
    return m;
  }, [processes]);

  const reset = useCallback(() => {
    setPlaying(false);
    setTime(0);
  }, []);

  const step = useCallback(
    (delta: number) => {
      setPlaying(false);
      setTime((t) => Math.max(0, Math.min(maxTime, t + delta)));
    },
    [maxTime]
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-slate-50 to-blue-50 p-4 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            {result.algorithm} — Live CPU & Process States
          </h3>
          <p className="text-xs text-zinc-500">
            Scrub or play through time to see Ready → Running → Terminated transitions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800"
          >
            ⏮ Reset
          </button>
          <button
            type="button"
            onClick={() => step(-1)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800"
          >
            ◀ Step
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white ${
              playing ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800"
          >
            Step ▶
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-800"
          >
            <option value={800}>Slow</option>
            <option value={400}>Normal</option>
            <option value={150}>Fast</option>
          </select>
        </div>
      </div>

      {/* Time scrubber */}
      <div className="mb-5">
        <div className="mb-1 flex justify-between text-xs text-zinc-500">
          <span>
            Time: <strong className="text-zinc-800 dark:text-zinc-100">{snapshot.time}</strong> /{" "}
            {maxTime}
          </span>
          <span>
            {snapshot.cpuIdle ? (
              <span className="text-amber-600">CPU Idle</span>
            ) : (
              <span className="text-emerald-600">
                CPU busy — running P{snapshot.running}
              </span>
            )}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxTime}
          value={time}
          onChange={(e) => {
            setPlaying(false);
            setTime(Number(e.target.value));
          }}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-blue-600 dark:bg-zinc-700"
        />
        {/* Mini Gantt under scrubber */}
        <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          {result.gantt.map((g, i) => (
            <div
              key={i}
              className="absolute top-0 h-full opacity-80"
              style={{
                left: `${(g.start / maxTime) * 100}%`,
                width: `${((g.end - g.start) / maxTime) * 100}%`,
                backgroundColor: getColor(g.processId),
              }}
            />
          ))}
          {/* Playhead */}
          <div
            className="absolute top-0 z-10 h-full w-0.5 bg-zinc-900 dark:bg-white"
            style={{ left: `${(time / maxTime) * 100}%` }}
          />
        </div>
      </div>

      {/* Main state board: Blocked | Ready | CPU | Terminated */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StateColumn
          title="Blocked"
          subtitle="Not yet arrived / waiting to enter"
          colorClass="bg-slate-500"
          borderClass="border-slate-300 dark:border-slate-600"
          count={snapshot.blocked.length}
        >
          {snapshot.blocked.length === 0 ? (
            <p className="text-xs text-zinc-400">Empty</p>
          ) : (
            snapshot.blocked.map((id) => <ProcessChip key={id} id={id} size="sm" />)
          )}
        </StateColumn>

        <StateColumn
          title="Ready Queue"
          subtitle="Arrived, waiting for CPU"
          colorClass="bg-amber-500"
          borderClass="border-amber-300 dark:border-amber-700"
          count={snapshot.ready.length}
        >
          {snapshot.ready.length === 0 ? (
            <p className="text-xs text-zinc-400">Empty</p>
          ) : (
            snapshot.ready.map((id) => <ProcessChip key={id} id={id} size="sm" />)
          )}
        </StateColumn>

        {/* CPU unit — centerpiece */}
        <div className="flex min-h-[180px] flex-col rounded-xl border-2 border-blue-400 bg-gradient-to-b from-blue-50 to-white dark:border-blue-600 dark:from-blue-950 dark:to-zinc-900">
          <div className="rounded-t-[10px] bg-blue-600 px-3 py-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">CPU</h4>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  snapshot.cpuIdle
                    ? "bg-amber-400 text-amber-950"
                    : "bg-emerald-400 text-emerald-950"
                }`}
              >
                {snapshot.cpuIdle ? "Idle" : "Busy"}
              </span>
            </div>
            <p className="text-[10px] text-blue-100">Running state</p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
            {/* CPU chip graphic */}
            <div
              className={`relative flex h-24 w-24 items-center justify-center rounded-2xl border-4 shadow-inner ${
                snapshot.cpuIdle
                  ? "border-zinc-300 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800"
                  : "border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900"
              }`}
            >
              {/* pins decoration */}
              <div className="absolute -left-1 top-3 h-2 w-1 rounded-sm bg-zinc-400" />
              <div className="absolute -left-1 top-8 h-2 w-1 rounded-sm bg-zinc-400" />
              <div className="absolute -left-1 top-13 h-2 w-1 rounded-sm bg-zinc-400" />
              <div className="absolute -right-1 top-3 h-2 w-1 rounded-sm bg-zinc-400" />
              <div className="absolute -right-1 top-8 h-2 w-1 rounded-sm bg-zinc-400" />
              <div className="absolute -right-1 top-13 h-2 w-1 rounded-sm bg-zinc-400" />

              {snapshot.running !== null ? (
                <ProcessChip id={snapshot.running} size="lg" pulse />
              ) : (
                <span className="text-xs font-medium text-zinc-400">IDLE</span>
              )}
            </div>
            {snapshot.running !== null && processMap.get(snapshot.running) && (
              <div className="text-center text-[10px] text-zinc-500">
                <div>
                  Burst left ≈ remaining work for P{snapshot.running}
                </div>
                <div>
                  Arrived t={processMap.get(snapshot.running)!.arrivalTime} · Burst{" "}
                  {processMap.get(snapshot.running)!.burstTime}
                </div>
              </div>
            )}
          </div>
        </div>

        <StateColumn
          title="Terminated"
          subtitle="Finished execution"
          colorClass="bg-emerald-600"
          borderClass="border-emerald-300 dark:border-emerald-700"
          count={snapshot.terminated.length}
        >
          {snapshot.terminated.length === 0 ? (
            <p className="text-xs text-zinc-400">None yet</p>
          ) : (
            snapshot.terminated.map((id) => <ProcessChip key={id} id={id} size="sm" />)
          )}
        </StateColumn>
      </div>

      {/* State legend / flow */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
        <span className="rounded-full bg-slate-200 px-2 py-1 dark:bg-slate-700">Blocked</span>
        <span>→</span>
        <span className="rounded-full bg-amber-200 px-2 py-1 dark:bg-amber-900">Ready</span>
        <span>→</span>
        <span className="rounded-full bg-blue-200 px-2 py-1 dark:bg-blue-900">Running (CPU)</span>
        <span>→</span>
        <span className="rounded-full bg-emerald-200 px-2 py-1 dark:bg-emerald-900">
          Terminated
        </span>
        <span className="ml-2 text-zinc-400">
          (preemption: Running → Ready)
        </span>
      </div>
    </div>
  );
}
