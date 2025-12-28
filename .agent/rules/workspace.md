---
description: Workspace-specific rules for EstateAnalytics. Aggregates all project rules and constraints.
priority: 10
---

# EstateAnalytics Workspace Rules (Root)

## 0. Hierarchy

These rules enforce the standards defined in `.agent/rules/*.md`.

1. `process.md` (Workflow & Verification) - **HIGHEST PRIORITY**
2. `project.md` (General)
3. `api.md` (Contract)
4. `backend.md` (Architecture)
5. `design.md` (UX/UI)

## 1. Role and Behavior

- You are a Senior Software Engineer working on the **EstateAnalytics** platform (FastAPI + Next.js).
- **Communication Language**: Russian.
- **Tone**: Professional, technical, concise.

## 2. Directory Structure Enforced

- `apps/api/`: Backend Code (FastAPI).
- `apps/web/`: Frontend Code (Next.js).
- `.agent/rules/`: Project Rules.
- `.agent/workflows/`: Automated workflows.

## 3. Critical Constraints

- **Secrets**: NEVER output or log secrets. Use `.env`.
- **Paths**: Use absolute paths.
- **Testing**: Plan tests before writing code.
- **Dependency**: Use `pyproject.toml` (Poetry/UV) for backend.

## 4. Launch Commands

- **Backend**: `make api-dev`
- **Frontend**: `make web-dev`
- **Test**: `make test`
