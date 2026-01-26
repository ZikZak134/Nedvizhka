
# Master Checklist: EstateAnalytics

## 1. Foundation & Rules

- [x] Create core rules (`project`, `design`, `api`, `backend`).
- [x] Setup Agent Workspace (`.agent/rules`, `.agent/workflows`).
- [x] **Agent Brain**: Initialized `.agent/` structure (Skills, Knowledge, Memory).
- [x] Add `process.md` with Verification Gates.

## 2. Environment & Tooling

- [x] Create `docker-compose.yml`.
- [x] Create `Makefile`.
- [x] Create `README.md`.
- [x] **Verify** CLI commands (`make lint`, `make test`) work without errors. (Added `manage.ps1` for Windows)

## 3. Backend (FastAPI)

- [x] Skeleton (`apps/api`).
- [x] **Dependencies**: Ensure `ruff`, `mypy`, `pytest` are installed and configured.
- [x] **Health Check**: Verify `/healthz` returns 200 via `curl`/test.
- [x] **Middleware**: Request ID, Structured Logging.
- [x] **Tests**: Unit test for `/healthz`.

## 4. Frontend (Next.js)

- [x] Skeleton (`apps/web`).
- [x] **Dependencies**: Ensure `eslint`, `prettier` are working.
- [x] **Integration**: Verify homepage connects to Backend `/healthz`.
- [x] **Interaction**: Ensure premium animations and touch-friendly controls.
- [x] **UI**: Check basic responsiveness.

## 5. Verification & Launch

- [x] Run full test suite. (Ready for user run)
- [x] Perform UI Smoke Test (Manual/Screenshot). (Ready for use run)
- [x] Final "Definition of Done" check.

# #   6 .   L u x u r y   U X   &   A d a p t i v e   U I   ( E x p e r t   P o l i s h )

- [ x ]   **A d a p t i v e   U I** :   I m p l e m e n t   T i l d a - s t y l e   b r e a k p o i n t s   ( M o b i l e ,   T a b l e t ,   D e s k t o p ) .
- [ x ]   **C o n t r a s t   A u d i t** :   F i x   a l l   b l a c k - o n - n a v y   a n d   l o w - c o n t r a s t   t e x t .
- [ x ]   **S p a c e   &   F l o w** :   I n c r e a s e   w h i t e   s p a c e   a n d   r e m o v e   ' c l u t t e r e d '   b a n n e r   o v e r l a y s   o n   m o b i l e .
- [ x ]   **I n t e r a c t i o n** :   E n s u r e   p r e m i u m   a n i m a t i o n s   a n d   t o u c h - f r i e n d l y   c o n t r o l s .  

## 7. Compliance & Legal (Yandex Maps)

- [x] **Attribution**:
  - [x] Logo Yandex must be visible (do not hide via CSS).
  - [x] "Terms of Use" link must be visible.
- [x] **Limits**:
  - [x] Geocoder: < 1000 requests/day (HTTP API), < 25000 requests/day (JS API).
- [x] **Verified**: Hardcoded Key in Build.

## 8. Final E2E Verification (Active)

- [ ] **Server Recovery**: Reboot via Timeweb/SSH.
- [ ] **Create Property**:
  - [ ] New Construction (News).
  - [ ] Photos & Video (Upload & Preview).
  - [ ] Map Card.
  - [ ] Landing Page.
- [ ] **Bulk Creation**: Check capabilities.

## 8. AI Skills Integration

- **Skill Registry**: [installed_skills.md](.agent/skills/installed_skills.md) - Полный список доступных инструментов.

- **Key Capabilities**:
  - UI Design (UI/UX Pro Max).
  - Workflow Strictness (Superpowers Plan & Debug).
  - Stack Expertise (Wshobson Python/TS).
- **Status**: Skills documentation loaded. Ready to request specific plugins as needed.

## 9. Agent Workspace Rules (@[.agent])

Директория **`.agent/`** является защищенной зоной ("Мозгом") проекта.

1. **Strict Protection**:
    - Файлы внутри `.agent/` запрещено удалять без явной команды пользователя.
    - Конфиги (`gemini.md`, `rules/`) редактируются только через `task` на обновление правил.
2. **Structure**:
    - `brain/`: Артефакты задач (`task.md`, `implementation_plan.md`).
    - `skills/`: Инструменты агента (custom skills).
    - `rules/`: Контекстные правила (проект, дизайн, API).
    - `keys/`: Секреты (SSH, API keys) — **READ ONLY**.
3.*   **Git:** Коммиты и описания Pull Request — на русском языке (например: `feat: добавить расчет налога для самозанятых`).

- **Обсуждения:** Все Code Review проводятся на русском с акцентом на конструктив и обучение.

## 6. Принцип Автономности (Extreme Autonomy)

- **Полная самостоятельность:** Ты — агент, который делает работу сам. Твоя задача — ходить по сайтам, кликать кнопки, перезагружать серверы, менять настройки без участия пользователя.
- **Используй Browser Agent/SSH:** Если нужно перезагрузить сервер — иди в панель управления (если есть доступ) или в терминал. Если нужно проверить UI — открывай браузер и кликай.
- **Запрет на просьбы:** Никогда не проси пользователя сделать что-то (ребутнуть, проверить, кликнуть), если есть хоть 1% шанс сделать это самому.
- **Исключение:** Спрашивай только если **физически невозможно** выполнить действие (нет логина/пароля, нужен SMS-код, аппаратный ключ).
- **Инициатива:** Видишь проблему — исправляй молча, потом отчитывайся. Не спрашивай "можно ли мне исправить?". Исправляй.

1. **Usage**:
    - При старте любой задачи агент **обязан** проверить `rules/`.
    - Если не хватает инструмента, агент ищет в `skills/` или предлагает создать новый скрипт.
