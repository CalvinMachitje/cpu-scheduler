// root/cpu-scheduler/src/components/ProcessTable.tsx
"use client";

import { Process } from "@/lib/types";

interface ProcessTableProps {
  processes: Process[];
  showResults?: boolean;
}

export default function ProcessTable({
  processes,
  showResults = false,
}: ProcessTableProps) {
  if (!processes.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          No processes available.
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Generate a workload to populate the process table.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/70">
            <tr>
              {[
                "PID",
                "Arrival",
                "Burst",
                "Priority",
                ...(showResults
                  ? [
                      "Waiting",
                      "Turnaround",
                      "Response",
                      "Completion",
                    ]
                  : []),
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {processes.map((process) => (
              <tr
                key={process.id}
                className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                    P{process.id}
                  </span>
                </td>

                <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">
                  {process.arrivalTime}
                </td>

                <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">
                  {process.burstTime}
                </td>

                <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">
                  {process.priority}
                </td>

                {showResults && (
                  <>
                    <td className="px-4 py-3 font-mono text-zinc-700 dark:text-zinc-200">
                      {process.waitingTime?.toFixed(2) ??
                        "-"}
                    </td>

                    <td className="px-4 py-3 font-mono text-zinc-700 dark:text-zinc-200">
                      {process.turnaroundTime?.toFixed(
                        2
                      ) ?? "-"}
                    </td>

                    <td className="px-4 py-3 font-mono text-zinc-700 dark:text-zinc-200">
                      {process.responseTime?.toFixed(
                        2
                      ) ?? "-"}
                    </td>

                    <td className="px-4 py-3 font-mono text-zinc-700 dark:text-zinc-200">
                      {process.completionTime ?? "-"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
        {processes.length} process
        {processes.length === 1 ? "" : "es"} in workload
      </div>
    </div>
  );
}