// root/cpu-scheduler/src/components/GanttChart.tsx
"use client";

import { GanttEntry } from "@/lib/types";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#e11d48",
  "#a855f7",
  "#0ea5e9",
  "#eab308",
];

interface GanttChartProps {
  gantt: GanttEntry[];
  title?: string;
}

export default function GanttChart({
  gantt,
  title,
}: GanttChartProps) {
  if (!gantt?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          No schedule data available.
        </p>
      </div>
    );
  }

  const totalTime = Math.max(
    ...gantt.map((entry) => entry.end),
    1
  );

  const chartWidth = Math.max(
    totalTime * 10,
    700
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            {title}
          </h3>

          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            CPU execution timeline from time 0 to{" "}
            {totalTime}.
          </p>
        </div>
      )}

      <div className="overflow-x-auto pb-2">
        <div
          className="relative"
          style={{
            width: `${chartWidth}px`,
          }}
        >
          <div className="flex h-14 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
            {gantt.map(
              (entry, index) => {
                const duration =
                  entry.end -
                  entry.start;

                const width =
                  (duration /
                    totalTime) *
                  chartWidth;

                const isIdle =
                  entry.processId === null;

                const color = isIdle
                  ? undefined
                  : COLORS[
                      (entry.processId! -
                        1) %
                        COLORS.length
                    ];

                return (
                  <div
                    key={`${entry.processId}-${entry.start}-${index}`}
                    className={`flex shrink-0 items-center justify-center border-r border-white/30 text-xs font-bold ${
                      isIdle
                        ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300"
                        : "text-white"
                    }`}
                    style={{
                      width: `${Math.max(
                        width,
                        18
                      )}px`,
                      backgroundColor:
                        color,
                    }}
                    title={
                      isIdle
                        ? `CPU Idle: ${entry.start} → ${entry.end}`
                        : `P${entry.processId}: ${entry.start} → ${entry.end} (${duration} units)`
                    }
                  >
                    {width > 35
                      ? isIdle
                        ? "IDLE"
                        : `P${entry.processId}`
                      : ""}
                  </div>
                );
              }
            )}
          </div>

          <div className="relative mt-2 h-5 text-[10px] text-zinc-500">
            {gantt.map(
              (entry, index) => {
                const position =
                  (entry.start /
                    totalTime) *
                  chartWidth;

                return (
                  <span
                    key={`start-${index}`}
                    className="absolute -translate-x-1/2 font-mono"
                    style={{
                      left: `${position}px`,
                    }}
                  >
                    {entry.start}
                  </span>
                );
              }
            )}

            <span
              className="absolute font-mono"
              style={{
                left: `${chartWidth}px`,
                transform:
                  "translateX(-100%)",
              }}
            >
              {totalTime}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from(
          new Set(
            gantt
              .map(
                (entry) =>
                  entry.processId
              )
              .filter(
                (
                  id
                ): id is number =>
                  id !== null
              )
          )
        ).map((processId) => (
          <div
            key={processId}
            className="flex items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1 dark:bg-zinc-800"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  COLORS[
                    (processId - 1) %
                      COLORS.length
                  ],
              }}
            />

            <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              P{processId}
            </span>
          </div>
        ))}

        {gantt.some(
          (entry) =>
            entry.processId === null
        ) && (
          <div className="flex items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1 dark:bg-zinc-800">
            <span className="h-2 w-2 rounded-full bg-zinc-400" />

            <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              CPU Idle
            </span>
          </div>
        )}
      </div>
    </div>
  );
}