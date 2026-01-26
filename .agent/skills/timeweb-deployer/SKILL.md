---
name: timeweb-deployer
description: Expert guidance for deploying to Timeweb Cloud VPS using custom scripts and Docker.
---

# Timeweb Deployer

Этот навык автоматизирует и стандартизирует процесс деплоя на **Timeweb Cloud VPS**. Проект использует Docker Compose и Nginx.

## 🚀 Deployment Workflow

Основной инструмент деплоя — скрипт `scripts/deploy_auto.py`.

### 1. Triggering Deploy

Для запуска деплоя используйте команду workflow (если настроен) или ручной запуск скрипта локально (требуется SSH доступ):

```bash
python scripts/deploy_auto.py
```

**Что делает скрипт:**

1. Подключается по SSH (User: `root`, Host: `IP`).
2. Синхронизирует файлы кода (исключая `.env` и большие директории).
3. Запускает `docker-compose up --build -d`.
4. Выполняет миграции БД (Alembic).
5. Чистит старые Docker образы (prune).

### 2. Project Structure on VPS

* **Root**: `/root/nedvizhka_app`
* **Logs**: `docker logs -f fast_api_app` или `fast_api_nginx`.
* **Database**: PostgreSQL в контейнере `db`. Данные в volume `postgres_data`.

## 🌐 Nginx & SSL Configuration

Nginx работает как Reverse Proxy перед FastAPI (Port 8000) и Next.js (Port 3000).

### Path Routing

* `/api/` -> `fast_api_app:8000`
* `/docs`, `/openapi.json` -> `fast_api_app:8000`
* `/admin` -> `fast_api_app:8000` (если админка на бэкенде) или Next.js (если Frontend).
* `/` -> `next_app:3000`

### SSL (Certbot)

Сертификаты обновляются через Certbot.
Команда для ручного обновления (если авто-обновление не сработало):

```bash
docker-compose run --rm certbot renew
```

## 🛡️ Troubleshooting

### "502 Bad Gateway"

1. Упал контейнер FastAPI или Next.js.
2. Смотри логи: `docker-compose logs --tail=100 app`.
3. Проверь здоровье: `curl http://localhost:8000/healthz`.

### "Database Connection Failed"

1. Проверь `.env` файл на сервере.
2. Убедись, что контейнер `db` запущен.
3. Проверь доступность порта 5432 внутри сети Docker.

### "Permission Denied" (SSH)

1. Проверь SSH ключи в `.agent/keys/vm_key`.
2. Попробуй подключиться вручную: `ssh -i .agent/keys/vm_key root@<IP>`.

## 📜 Checklist перед деплоем

* [ ] Все изменения закоммичены и запушены (Git).
* [ ] Локальные тесты проходят (`make test`).
* [ ] Переменные окружения обновлены (если нужно).
