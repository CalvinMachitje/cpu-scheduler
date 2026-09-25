"use client";

import { Process } from "@/lib/types";

interface ProcessTableProps {
  processes: Process[];
  showResults?: boolean;
}

export default function ProcessTable({ processes, showResults = false }: ProcessTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200">PID</th>
            <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200">Arrival</th>
            <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200">Burst</th>
            <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200">Priority</th>
            {showResults && (
              <>
                <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200">Waiting</th>
                <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200">Turnaround</th>
                <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200">Response</th>
                <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200">Completion</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {processes.map((p) => (
            <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="px-3 py-1.5 font-medium text-zinc-900 dark:text-zinc-100">P{p.id}</td>
              <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">{p.arrivalTime}</td>
              <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">{p.burstTime}</td>
              <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">{p.priority}</td>
              {showResults && (
                <>
                  <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">{p.waitingTime?.toFixed(1) ?? "-"}</td>
                  <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">{p.turnaroundTime?.toFixed(1) ?? "-"}</td>
                  <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">{p.responseTime?.toFixed(1) ?? "-"}</td>
                  <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">{p.completionTime ?? "-"}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
