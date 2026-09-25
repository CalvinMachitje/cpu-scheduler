"use client";

import { SimulationResult } from "@/lib/types";

interface ComparisonChartProps {
  results: SimulationResult[];
  metric: "avgWaitingTime" | "avgTurnaroundTime" | "avgResponseTime" | "cpuUtilization" | "throughput";
  title: string;
}

const COLORS: Record<string, string> = {
  FCFS: "#3b82f6",
  SRTF: "#22c55e",
  RR: "#f59e0b",
};

export default function ComparisonChart({ results, metric, title }: ComparisonChartProps) {
  const data = results.map((r) => ({
    name: r.algorithm,
    value: Number(r.metrics[metric].toFixed(4)),
  }));

  const maxVal = Math.max(...data.map((d) => d.value), 0.001);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="w-12 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {d.name}
            </span>
            <div className="flex-1 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(d.value / maxVal) * 100}%`,
                  backgroundColor: COLORS[d.name] || "#888",
                }}
              />
            </div>
            <span className="w-16 text-right text-xs font-semibold text-zinc-800 dark:text-zinc-100">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ScalingDataPoint {
  processCount: number;
  FCFS: number;
  SRTF: number;
  RR: number;
}

interface ScalingChartProps {
  data: ScalingDataPoint[];
  metricLabel: string;
  yLabel?: string;
}

export function ScalingChart({ data, metricLabel }: ScalingChartProps) {
  if (!data || data.length === 0) return null;

  const allValues = data.flatMap((d) => [d.FCFS, d.SRTF, d.RR]);
  const maxVal = Math.max(...allValues, 0.001);
  const minVal = Math.min(...allValues, 0);

  const height = 180;
  const width = 400;
  const padding = 30;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const xScale = (i: number) => padding + (i / (data.length - 1 || 1)) * chartW;
  const yScale = (v: number) =>
    padding + chartH - ((v - minVal) / (maxVal - minVal || 1)) * chartH;

  const makePath = (key: "FCFS" | "SRTF" | "RR") =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d[key])}`)
      .join(" ");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
        {metricLabel} vs Number of Processes
      </h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={padding}
              y1={padding + t * chartH}
              x2={width - padding}
              y2={padding + t * chartH}
              stroke="#e4e4e7"
              strokeWidth={1}
            />
          ))}
          <path d={makePath("FCFS")} fill="none" stroke="#3b82f6" strokeWidth={2} />
          <path d={makePath("SRTF")} fill="none" stroke="#22c55e" strokeWidth={2} />
          <path d={makePath("RR")} fill="none" stroke="#f59e0b" strokeWidth={2} />
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={xScale(i)} cy={yScale(d.FCFS)} r={3} fill="#3b82f6" />
              <circle cx={xScale(i)} cy={yScale(d.SRTF)} r={3} fill="#22c55e" />
              <circle cx={xScale(i)} cy={yScale(d.RR)} r={3} fill="#f59e0b" />
              <text
                x={xScale(i)}
                y={height - 8}
                textAnchor="middle"
                fontSize={10}
                fill="#71717a"
              >
                {d.processCount}
              </text>
            </g>
          ))}
          <g transform={`translate(${padding}, 12)`}>
            <rect x={0} y={0} width={10} height={10} fill="#3b82f6" />
            <text x={14} y={9} fontSize={10} fill="#3f3f46">
              FCFS
            </text>
            <rect x={50} y={0} width={10} height={10} fill="#22c55e" />
            <text x={64} y={9} fontSize={10} fill="#3f3f46">
              SRTF
            </text>
            <rect x={100} y={0} width={10} height={10} fill="#f59e0b" />
            <text x={114} y={9} fontSize={10} fill="#3f3f46">
              RR
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
