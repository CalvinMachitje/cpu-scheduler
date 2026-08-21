// root/cpu-scheduler/src/components/ComparisonChart.tsx
"use client";

import {
  ComparisonMetric,
  ScalingDataPoint,
  SimulationResult,
} from "@/lib/types";

interface ComparisonChartProps {
  results: SimulationResult[];
  metric: ComparisonMetric;
  title: string;
}

const COLORS: Record<
  string,
  string
> = {
  FCFS: "#3b82f6",
  SRTF: "#22c55e",
  RR: "#f59e0b",
};

const METRIC_DIRECTION: Record<
  ComparisonMetric,
  "lower" | "higher"
> = {
  avgWaitingTime: "lower",
  avgTurnaroundTime: "lower",
  avgResponseTime: "lower",
  cpuUtilization: "higher",
  throughput: "higher",
};

function formatMetric(
  metric: ComparisonMetric,
  value: number
) {
  if (metric === "cpuUtilization") {
    return `${value.toFixed(1)}%`;
  }

  if (metric === "throughput") {
    return value.toFixed(4);
  }

  return value.toFixed(2);
}

export default function ComparisonChart({
  results,
  metric,
  title,
}: ComparisonChartProps) {
  if (!results.length) {
    return null;
  }

  const data = results.map((result) => ({
    name: result.algorithm,
    value: result.metrics[metric],
  }));

  const direction =
    METRIC_DIRECTION[metric];

  const bestValue =
    direction === "lower"
      ? Math.min(
          ...data.map((item) => item.value)
        )
      : Math.max(
          ...data.map((item) => item.value)
        );

  const maxVal = Math.max(
    ...data.map((item) => item.value),
    0.001
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            {title}
          </h3>

          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {direction === "lower"
              ? "Lower values indicate better performance."
              : "Higher values indicate better performance."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const isBest =
            item.value === bestValue;

          const percentage =
            maxVal > 0
              ? (item.value / maxVal) * 100
              : 0;

          return (
            <div
              key={item.name}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[item.name],
                    }}
                  />

                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    {item.name}
                  </span>

                  {isBest && (
                    <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      Best
                    </span>
                  )}
                </div>

                <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                  {formatMetric(
                    metric,
                    item.value
                  )}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor:
                      COLORS[item.name] ??
                      "#71717a",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ScalingChartProps {
  data: ScalingDataPoint[];
  metricLabel: string;
}

export function ScalingChart({
  data,
  metricLabel,
}: ScalingChartProps) {
  if (!data?.length) {
    return null;
  }

  const width = 760;
  const height = 300;

  const paddingLeft = 52;
  const paddingRight = 20;
  const paddingTop = 35;
  const paddingBottom = 45;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const values = data.flatMap(
    (point) => [
      point.FCFS,
      point.SRTF,
      point.RR,
    ]
  );

  const maxValue = Math.max(
    ...values,
    0.001
  );

  const xScale = (index: number) =>
    paddingLeft +
    (index /
      Math.max(data.length - 1, 1)) *
      chartWidth;

  const yScale = (value: number) =>
    paddingTop +
    chartHeight -
    (value / maxValue) *
      chartHeight;

  const makePath = (
    key: "FCFS" | "SRTF" | "RR"
  ) =>
    data
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${xScale(
            index
          )} ${yScale(point[key])}`
      )
      .join(" ");

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          {metricLabel} Scaling
        </h3>

        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Performance as workload size increases.
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[620px] w-full"
          role="img"
          aria-label={`${metricLabel} scaling chart`}
        >
          {[0, 0.25, 0.5, 0.75, 1].map(
            (step) => {
              const y =
                paddingTop +
                step * chartHeight;

              const value =
                maxValue *
                (1 - step);

              return (
                <g key={step}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={
                      width -
                      paddingRight
                    }
                    y2={y}
                    stroke="currentColor"
                    className="text-zinc-200 dark:text-zinc-800"
                    strokeWidth="1"
                  />

                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    className="fill-zinc-400"
                  >
                    {value.toFixed(
                      metricLabel ===
                        "CPU Utilization"
                        ? 0
                        : 1
                    )}
                  </text>
                </g>
              );
            }
          )}

          <path
            d={makePath("FCFS")}
            fill="none"
            stroke={COLORS.FCFS}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={makePath("SRTF")}
            fill="none"
            stroke={COLORS.SRTF}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={makePath("RR")}
            fill="none"
            stroke={COLORS.RR}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {(
            ["FCFS", "SRTF", "RR"] as const
          ).map((algorithm) =>
            data.map((point, index) => (
              <circle
                key={`${algorithm}-${index}`}
                cx={xScale(index)}
                cy={yScale(
                  point[algorithm]
                )}
                r="4"
                fill={COLORS[algorithm]}
              />
            ))
          )}

          {data.map(
            (point, index) => (
              <text
                key={point.processCount}
                x={xScale(index)}
                y={height - 15}
                textAnchor="middle"
                fontSize="10"
                className="fill-zinc-500"
              >
                {point.processCount}
              </text>
            )
          )}

          <text
            x={width / 2}
            y={height - 2}
            textAnchor="middle"
            fontSize="10"
            className="fill-zinc-400"
          >
            Number of Processes
          </text>

          <g
            transform={`translate(${paddingLeft}, 10)`}
          >
            {(
              [
                ["FCFS", COLORS.FCFS],
                ["SRTF", COLORS.SRTF],
                ["RR", COLORS.RR],
              ] as const
            ).map(
              ([algorithm, color], index) => (
                <g
                  key={algorithm}
                  transform={`translate(${
                    index * 75
                  }, 0)`}
                >
                  <circle
                    cx="5"
                    cy="5"
                    r="5"
                    fill={color}
                  />

                  <text
                    x="14"
                    y="9"
                    fontSize="10"
                    className="fill-zinc-500"
                  >
                    {algorithm}
                  </text>
                </g>
              )
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}