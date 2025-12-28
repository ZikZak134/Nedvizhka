# Process Rules (Autopilot Mode)

## 1. Core Loop (MANDATORY)

For EVERY task, strictly follow this loop. Do not skip steps.

1. **Audit**: Check current state, read files, understand context.
2. **Plan**: Update `task.md`, define steps, creation plan.
3. **Execute**: Write code, config, or documentation.
4. **Verify**: Run `.\manage.ps1 verify`. Check `evidence.md`.
5. **Update**: Mark task as done in `task.md`.
6. **Report**: User notification with finding/results.

## 2. Non-Destructive Policy

- **NEVER** delete or rewrite functional code without a specific reason documented in `task.md`.
- **Refactoring**: Must be a separate task.
- **Migration**: If breaking changes are needed, provide a migration path.

## 3. Verification Gates (Must Pass)

Failing a gate = STOP. Create a "Fix" task in `task.md`, fix it, then proceed.

### A. Static Analysis

- **Lint**: `ruff check .` (Backend), `next lint` (Frontend).
- **Format**: `ruff format --check` (Backend).
- **Typecheck**: `mypy .` (Backend), `tsc --noEmit` (Frontend).

### B. Testing

- **Unit Tests**: `pytest`.
- **Integration Smoke**: Backend `/healthz` must return 200 via `curl` or script.

### C. UI Verification

- **UI Smoke**: Playwright or Manual.
  - Open Web App.
  - Check "Backend Status" badge.
  - Evidence: Screenshot or Console Log saved to `evidence.md`.

## 4. Evidence

- Log all verification runs in `evidence.md`.
- Include Command, Timestamp, Exit Code, and Summary.
