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

interface GanttChartProps {
  gantt: GanttEntry[];
  processes?: Process[];
  title?: string;
  showLanes?: boolean;
}

export default function GanttChart({
  gantt,
  processes = [],
  title,
  showLanes = true,
}: GanttChartProps) {
  if (!gantt || gantt.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500">No schedule data</p>
      </div>
    );
  }

  const totalTime = Math.max(...gantt.map((g) => g.end), 1);
  const processIds = processes.length
    ? processes.map((p) => p.id).sort((a, b) => a - b)
    : [...new Set(gantt.map((g) => g.processId))].sort((a, b) => a - b);

  const lanes: Record<number, GanttEntry[]> = {};
  for (const pid of processIds) {
    lanes[pid] = gantt.filter((g) => g.processId === pid);
  }

  const step = totalTime <= 20 ? 1 : totalTime <= 50 ? 5 : totalTime <= 100 ? 10 : 20;
  const markers: number[] = [];
  for (let t = 0; t <= totalTime; t += step) markers.push(t);
  if (markers[markers.length - 1] !== totalTime) markers.push(totalTime);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {title && (
        <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {title}
        </h3>
      )}

      {/* Classic single-row Gantt */}
      <div className="mb-5">
        <p className="mb-1.5 text-xs font-medium text-zinc-500">Timeline (CPU execution order)</p>
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[480px]">
            <div className="relative flex h-11 items-stretch overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              {gantt.map((entry, idx) => {
                const widthPct = ((entry.end - entry.start) / totalTime) * 100;
                const color = getColor(entry.processId);
                return (
                  <div
                    key={`bar-${entry.processId}-${entry.start}-${idx}`}
                    className="relative flex items-center justify-center border-r border-white/40 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: color,
                      minWidth: widthPct < 3 ? 28 : undefined,
                    }}
                    title={`P${entry.processId}: t=${entry.start} → ${entry.end} (duration ${entry.end - entry.start})`}
                  >
                    <span className="truncate px-0.5">
                      {widthPct > 4 ? `P${entry.processId}` : entry.processId}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="relative mt-1 h-5 text-[10px] text-zinc-500">
              {markers.map((t) => (
                <span
                  key={t}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${(t / totalTime) * 100}%` }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-lane (per-process) Gantt */}
      {showLanes && (
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-500">
            Process lanes (each row = one process)
          </p>
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              {processIds.map((pid) => {
                const segments = lanes[pid] || [];
                return (
                  <div key={pid} className="mb-1.5 flex items-center gap-2">
                    <div
                      className="w-10 shrink-0 text-right text-xs font-semibold"
                      style={{ color: getColor(pid) }}
                    >
                      P{pid}
                    </div>
                    <div className="relative h-7 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                      {segments.map((seg, i) => {
                        const left = (seg.start / totalTime) * 100;
                        const width = ((seg.end - seg.start) / totalTime) * 100;
                        return (
                          <div
                            key={i}
                            className="absolute top-0.5 bottom-0.5 rounded-sm flex items-center justify-center text-[10px] font-medium text-white shadow-sm"
                            style={{
                              left: `${left}%`,
                              width: `${Math.max(width, 1.2)}%`,
                              backgroundColor: getColor(pid),
                            }}
                            title={`P${pid}: ${seg.start} → ${seg.end}`}
                          >
                            {width > 6 ? `${seg.start}-${seg.end}` : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="relative ml-12 mt-1 h-4 text-[10px] text-zinc-500">
                {markers.map((t) => (
                  <span
                    key={t}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${(t / totalTime) * 100}%` }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        {processIds.map((pid) => (
          <div key={pid} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: getColor(pid) }}
            />
            P{pid}
          </div>
        ))}
      </div>
    </div>
  );
}
