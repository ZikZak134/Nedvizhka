.PHONY: help api-dev web-dev db-up test lint format

help:
	@echo "Available commands:"
	@echo "  make api-dev   - Run Backend (FastAPI)"
	@echo "  make web-dev   - Run Frontend (Next.js)"
	@echo "  make db-up     - Start Database (Docker)"
	@echo "  make test      - Run tests"
	@echo "  make lint      - Run linters"

api-dev:
	cd apps/api && uvicorn app.main:app --reload

web-dev:
	cd apps/web && npm run dev

db-up:
	docker-compose up -d db redis

test:
	cd apps/api && pytest

lint:
	cd apps/api && ruff check .
	cd apps/web && npm run lint

format:
	cd apps/api && ruff format .
