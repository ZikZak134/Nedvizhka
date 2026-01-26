---
description: Автоматический деплой на Production (Timeweb)
---

Этот воркфлоу обновляет код на сервере `217.199.254.119` и перезапускает Docker контейнеры.

**Требования:**
- Локальный SSH ключ: `.agent/keys/vm_key`
- Доступ `root` к серверу.

**Шаги:**

1.  Подключиться к серверу и запустить обновление.

// turbo
```bash
ssh -i .agent/keys/vm_key -o StrictHostKeyChecking=no root@217.199.254.119 "cd ~/Nedvizhka && git fetch origin && git reset --hard origin/main && docker-compose -f docker-compose.prod.yml up -d --build --force-recreate"
```
