# UI Context

## Theme

Light-first academic tool with optional dark mode via `prefers-color-scheme`. Clean technical workspace: white/zinc surfaces, blue primary actions, emerald for scaling/success accents. Process identity uses a fixed colour palette by PID for Gantt and chips.

## Colors

Components currently use Tailwind utility classes. Prefer consistency with these roles:

| Role              | Tailwind / usage                                      |
| ----------------- | ----------------------------------------------------- |
| Page background   | `from-zinc-50 via-white to-blue-50` (dark: zinc-950)  |
| Surface / cards   | `bg-white` + `border-zinc-200` (dark: zinc-900/700)   |
| Primary text      | `text-zinc-900` / `text-zinc-50`                      |
| Muted text        | `text-zinc-500`                                       |
| Primary action    | `bg-blue-600` hover `bg-blue-700`                     |
| Secondary action  | Border zinc buttons                                   |
| Scaling / success | `bg-emerald-600`                                      |
| Ready state       | Amber (`bg-amber-500`)                                |
| Running / CPU     | Blue (`bg-blue-600`)                                  |
| Blocked           | Slate (`bg-slate-500`)                                |
| Terminated        | Emerald (`bg-emerald-600`)                            |
| Process palette   | Fixed hex array in Gantt / CpuSchedulerView by PID    |

## Typography

| Role      | Font                         | Notes                |
| --------- | ---------------------------- | -------------------- |
| UI text   | Geist Sans (layout) / system | Tailwind `font-sans` |
| Code/mono | Geist Mono                   | Time labels, IDs     |

## Border Radius

| Context        | Class                          |
| -------------- | ------------------------------ |
| Chips / small  | `rounded-full` / `rounded-sm`  |
| Cards / panels | `rounded-xl` / `rounded-2xl`   |
| Buttons        | `rounded-lg`                   |

## Component Library

No shadcn/ui. Custom components under `src/components/`:

- `CpuSchedulerView` — live CPU + Ready/Blocked/Terminated + playback
- `GanttChart` — timeline + process lanes + legend
- `ExecutionTrace` — burst log + mini process cards
- `ProcessTable` — workload / results table
- `MetricsCard` — per-algorithm metric grid
- `ComparisonChart` / `ScalingChart` — bar and line charts (SVG / CSS)

## Layout Patterns

- Single-page app: header → controls → workload table → tabs (Gantt / Compare / Scaling)
- Gantt tab stacks: CpuSchedulerView → GanttChart → ExecutionTrace → ProcessTable per algorithm
- Cards in responsive grids (`md:grid-cols-3`, `xl:grid-cols-4` for state columns)

## Icons

Emoji used for controls (▶ ⏸ 🔄 📊) to avoid extra icon dependency. Lucide optional if reintroduced.
