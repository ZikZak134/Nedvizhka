# EstateAnalytics Project Rules

## 1. General Principles
- **Language**: All communication, comments, and documentation should be in **Russian** (per user preference), except for standard code constructs (variable names in English).
- **Quality First**: Focus on "Premium" quality. Code should be clean, robust, and scalable.
- **Agentic Workflow**: Use `task.md` and `implementation_plan.md` for major changes.

## 2. Tech Stack & Standards

### Backend (Python/FastAPI)
- **Version**: Python 3.12+
- **Style Guide**: PEP 8.
- **Linter/Formatter**: `ruff` (preferred) or `black` + `isort`.
- **Typing**: Strict type hints (`typing` module) are required for all function signatures.
- **Async**: Use `async/await` for all I/O bound operations (DB, API calls).
- **Structure**: Feature-based folder structure (e.g., `app/api/v1/endpoints/properties.py`).

### Frontend (TypeScript/Next.js)
- **Version**: Next.js 15 (App Router).
- **Style Guide**: Airbnb JavaScript Style Guide (adapted for TS).
- **Linter**: ESLint + Prettier.
- **Strict Mode**: TypeScript `strict: true`.
- **Styling**: TailwindCSS. Use utility classes. Avoid inline styles.
- **Components**: Functional components only. Use `shadcn/ui` for base components.

### Database
- **PostgreSQL 16** with **TimescaleDB**.
- **Migration**: Use `alembic` for all schema changes.
- **Naming**: `snake_case` tables and columns.

## 3. Git Workflow
- **Branches**: `main` (prod), `dev` (development), `feature/name` (features).
- **Commit Messages**: Conventional Commits format.
    - `feat: add user authentication`
    - `fix: resolve db connection timeout`
    - `docs: update setup guide`
    - `chore: update dependencies`

## 4. Documentation
- **Docstrings**: Required for all public modules, classes, and functions (Google style).
- **API Docs**: FastAPI automatically generates OpenAPI docs at `/docs`. Ensure Pydantic models have `description` fields.
- **README**: Keep root `README.md` updated with setup steps.

## 5. Testing
- **Backend**: `pytest`. Goal: >80% coverage for core logic.
- **Frontend**: `jest` + `react-testing-library` (unit), `playwright` (e2e).

## 6. MCP Recommendations
- **FileSystem**: For accessing code.
- **PostgreSQL**: For direct database inspection.
