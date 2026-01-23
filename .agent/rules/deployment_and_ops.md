# Deployment & Operations: EstateAnalytics

This document details the production infrastructure and operational procedures for the project.

## Cloud Infrastructure

### Backend (Render.com)
- **Web Service**: `estate-analytics-api`
- **URL**: [https://nedvizhkaestate-analytics-api.onrender.com](https://nedvizhkaestate-analytics-api.onrender.com)
- **Repo Root**: `apps/api`
- **Port**: Managed by Render ($PORT)

### Database (Render PostgreSQL)
- **PostGIS**: Enabled (v15+)
- **Connection**:
  - Internal: `postgresql://estate_analytics_db_user:[password]@dpg-d5n2lp0gjchc73935fdg-a/estate_analytics_db`
  - Internal: `postgresql://estate_analytics_db_user:[password]@dpg-d5n2lp0gjchc73935fdg-a/estate_analytics_db`
  - External: `postgresql://estate_analytics_db_user:[password]@dpg-d5n2lp0gjchc73935fdg-a.virginia-postgres.render.com/estate_analytics_db`

### Configuration Settings (Critical)
- **Build Command**: `pip install -r requirements.txt` (Default)
- **Pre-Deploy Command**: `alembic upgrade head` (Required for DB migrations)
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
- **URL**: [https://web-zeta-blush-32.vercel.app](https://web-zeta-blush-32.vercel.app)
- **Critical Env Vars**:
  - `NEXT_PUBLIC_API_URL`: `https://nedvizhkaestate-analytics-api.onrender.com`
  - ✅ **Verified**: Configured for all environments (Production, Preview, Development)
  - Last updated: 2026-01-20 ~09:00 (Tomsk time)

## Operational Procedures

### 1. Database Backups
Automated backups are handled via GitHub Actions in [.github/workflows/db_backup.yml](file:///c:/Users/grama/OneDrive/Docs/Nedvizhka/.github/workflows/db_backup.yml).
- **Schedule**: Every Sunday at 00:00 UTC.
- **Artifacts**: Stored in GitHub Actions tab for 90 days.
- **Required Secret**: `RENDER_BACKUP_DB_URL` (The External Database URL).

### 2. Restoring Data
To restore from a backup:
1. Download the `.sql` artifact from GitHub.
2. Ensure the target DB has PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis;`
3. Run: `psql "DATABASE_URL" < backup_file.sql`

### 3. Updating Dependencies
If you add a new Python library to `apps/api`:
1. Add it to `apps/api/requirements.txt`.
2. Push to GitHub.
3. Render will automatically rebuild.

> [!WARNING]
> Render Free instances spin down after 15 minutes of inactivity. The first request after a long pause may take 50+ seconds to respond.
