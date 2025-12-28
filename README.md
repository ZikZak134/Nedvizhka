# EstateAnalytics Platform

Platform for analyzing luxury real estate market in Sochi.

## 🏗 Architecture
- **Backend**: FastAPI (Python 3.12)
- **Frontend**: Next.js 15 (TypeScript)
- **Database**: PostgreSQL 16 + TimescaleDB
- **Cache**: Redis

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3.12+
- Node.js 20+

### Quick Start (Local)

1. **Clone & Config**
   ```bash
   cp apps/api/.env.example apps/api/.env
   # Edit .env if needed
   ```

2. **Start Infrastructure (DB + Redis)**
   ```bash
   make db-up
   ```

3. **Run Backend**
   ```bash
   # Install dependencies
   cd apps/api
   pip install -e ".[test]"
   
   # Run
   cd ../..
   make api-dev
   ```

4. **Run Frontend**
   ```bash
   # Install dependencies
   cd apps/web
   npm install
   
   # Run
   cd ../..
   make web-dev
   ```

## ✅ Verification
- Backend Health: http://localhost:8000/healthz
- Frontend: http://localhost:3000

## 📂 Project Structure
- `apps/api`: Backend application
- `apps/web`: Frontend application
- `.agent/rules`: Project standards and rules
- `.agent/workflows`: Automated agent workflows
