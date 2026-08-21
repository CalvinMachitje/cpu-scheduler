// root/cpu-scheduler/src/components/MetricsCard.tsx
"use client";

import {
  Algorithm,
  Metrics,
} from "@/lib/types";

interface MetricsCardProps {
  metrics: Metrics;
  algorithm: Algorithm;
  isBest?: boolean;
}

const algorithmConfig: Record<
  Algorithm,
  {
    label: string;
    description: string;
    accent: string;
    badge: string;
  }
> = {
  FCFS: {
    label: "First-Come, First-Served",
    description:
      "Non-preemptive scheduling based on arrival order.",
    accent: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },

  SRTF: {
    label: "Shortest Remaining Time First",
    description:
      "Preemptive scheduling favouring the shortest remaining burst.",
    accent: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },

  RR: {
    label: "Round Robin",
    description:
      "Time-sharing scheduling using a configurable quantum.",
    accent: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
};

export default function MetricsCard({
  metrics,
  algorithm,
  isBest = false,
}: MetricsCardProps) {
  const config =
    algorithmConfig[algorithm];

  const items = [
    {
      label: "Avg Waiting",
      value:
        metrics.avgWaitingTime.toFixed(2),
      unit: "time",
    },
    {
      label: "Avg Turnaround",
      value:
        metrics.avgTurnaroundTime.toFixed(2),
      unit: "time",
    },
    {
      label: "Avg Response",
      value:
        metrics.avgResponseTime.toFixed(2),
      unit: "time",
    },
    {
      label: "CPU Utilization",
      value:
        metrics.cpuUtilization.toFixed(1),
      unit: "%",
    },
    {
      label: "Throughput",
      value:
        metrics.throughput.toFixed(4),
      unit: "proc/unit",
    },
    {
      label: "Total Time",
      value:
        metrics.totalTime.toString(),
      unit: "units",
    },
  ];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${config.accent}`}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                {algorithm}
              </h3>

              {isBest && (
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-white dark:text-zinc-900">
                  Best
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {config.label}
            </p>

            <p className="mt-1 max-w-md text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {config.description}
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${config.badge}`}
          >
            {algorithm}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/60"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {item.label}
              </p>

              <p className="mt-1 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {item.value}
              </p>

              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {item.unit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}