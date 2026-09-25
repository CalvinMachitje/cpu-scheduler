"use client";

import { GanttEntry, Process } from "@/lib/types";

const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#e11d48", "#a855f7", "#0ea5e9", "#eab308",
  "#10b981", "#f43f5e", "#64748b", "#d946ef", "#0d9488",
];

function getColor(pid: number) {
  return COLORS[(pid - 1) % COLORS.length];
}

interface ExecutionTraceProps {
  gantt: GanttEntry[];
  processes: Process[];
  algorithm: string;
}

export default function ExecutionTrace({ gantt, processes, algorithm }: ExecutionTraceProps) {
  if (!gantt.length) return null;

  const totalTime = Math.max(...gantt.map((g) => g.end));

  // Build a simple "who was running" summary per segment
  const segments = gantt.map((g, i) => {
    const prevEnd = i === 0 ? 0 : gantt[i - 1].end;
    const idle = g.start > prevEnd;
    return { ...g, idleBefore: idle ? g.start - prevEnd : 0 };
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
        {algorithm} — Execution Trace
      </h3>

      <div className="mb-3 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>Total time units: <strong className="text-zinc-800 dark:text-zinc-200">{totalTime}</strong></span>
        <span>CPU bursts: <strong className="text-zinc-800 dark:text-zinc-200">{gantt.length}</strong></span>
        <span>Processes: <strong className="text-zinc-800 dark:text-zinc-200">{processes.length}</strong></span>
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-100 dark:border-zinc-800">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
            <tr className="text-zinc-500">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Duration</th>
              <th className="px-3 py-2 font-medium">Running</th>
              <th className="px-3 py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {segments.map((seg, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                <td className="px-3 py-1.5 text-zinc-400">{i + 1}</td>
                <td className="px-3 py-1.5 font-mono text-zinc-700 dark:text-zinc-200">
                  {seg.start} → {seg.end}
                </td>
                <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">
                  {seg.end - seg.start}
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: getColor(seg.processId) }}
                  >
                    P{seg.processId}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-zinc-500">
                  {seg.idleBefore > 0 && (
                    <span className="mr-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      idle {seg.idleBefore}
                    </span>
                  )}
                  {i === 0 && "First process starts"}
                  {i === segments.length - 1 && "Last process finishes"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mini status cards */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {processes
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-zinc-100 bg-zinc-50 px-2.5 py-2 dark:border-zinc-800 dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getColor(p.id) }}
                />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                  P{p.id}
                </span>
              </div>
              <div className="mt-1 space-y-0.5 text-[10px] text-zinc-500">
                <div>Arrive: {p.arrivalTime}</div>
                <div>Burst: {p.burstTime}</div>
                <div>Wait: {p.waitingTime?.toFixed(1) ?? "–"}</div>
                <div>TAT: {p.turnaroundTime?.toFixed(1) ?? "–"}</div>
                <div>Resp: {p.responseTime?.toFixed(1) ?? "–"}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
