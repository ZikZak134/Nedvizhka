# Deployment & Operations: EstateAnalytics

This document details the production infrastructure and operational procedures for the project.

## Cloud Infrastructure (Target: Timeweb Cloud)

All components (Frontend, Backend, Database) are hosted on a single VPS server managed via Docker Compose.

### VPS Configuration
- **Provider**: Timeweb Cloud
- **OS**: Ubuntu 22.04 LTS
- **Resources**: 2 vCPU / 4 GB RAM / 50 GB NVMe
- **Location**: Moscow / Netherlands

### Backend (Docker)
- **Service**: `api`
- **Port**: 8000 (Internal)
- **Log path**: Docker logs

### Frontend (Docker)
- **Service**: `web`
- **Port**: 3000 (Internal)

### Database (Docker)
- **Image**: `postgis/postgis:16-3.4-alpine`
- **Port**: 5432 (Internal)
- **Volume**: `postgres_data_prod`

### Storage (Local)
- **Type**: Local Filesystem (Docker Volume)
- **Access**: Nginx static hosting via `/uploads`
- **Backup**: Essential to backup `/var/lib/docker/volumes/...` or the mounted host path.

---
## Legacy Infrastructure (For Reference)
*These services were used during MVP phase and are being migrated from.*
- **Backend**: Render.com
- **Frontend**: Vercel
- **Storage**: Yandex Object Storage (S3) [DELETED]

---

## Operational Procedures

### 1. Database Backups
Automated backups are handled via GitHub Actions in [.github/workflows/db_backup.yml](file:///c:/Users/grama/OneDrive/Docs/Nedvizhka/.github/workflows/db_backup.yml).
*Note: Pipeline needs update to target VPS instead of Render.*

### 2. Updating Application
To deploy new code:
1. `git push origin main`
2. SSH into VPS.
3. `cd /opt/estate-analytics`
4. `git pull`
5. `docker-compose -f docker-compose.prod.yml up -d --build`
