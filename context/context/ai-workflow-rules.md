# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. Context files under `context/` define what to build, how to build it, and progress. Implement against these specs — do not invent product behaviour that contradicts project-overview or architecture.

## Scoping Rules

- Work on one feature unit at a time (e.g. “CPU state playback” or “scaling charts”, not both plus report export)
- Prefer small, verifiable increments over large speculative rewrites
- Do not mix unrelated boundaries in one step (e.g. change algorithm math and redesign the whole layout together)

## When to Split Work

Split an implementation step if it combines:

- Algorithm correctness changes and major UI redesign
- Multiple unrelated components with no shared contract change
- Behaviour not defined in context files (e.g. new algorithm, auth, backend)

If a change cannot be verified quickly in the browser (`npm run dev` + Simulate All), the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behaviour not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing

## Protected Files

Do not modify unless explicitly instructed:

- `node_modules/**`
- Generated `.next/**` output
- Third-party package internals

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → `architecture.md`
- Feature scope or goals → `project-overview.md`
- UI patterns or theme → `ui-context.md`
- Conventions → `code-standards.md`
- After each meaningful unit → `progress-tracker.md`

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. Prefer `npm run build` passing when environment allows
