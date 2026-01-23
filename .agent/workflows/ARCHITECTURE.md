---
description: Architecture
---

# Architecture: EstateAnalytics (Nedvizhka)

## Корень проекта: `c:\Users\grama\OneDrive\Документы\Nedvizhka\`

```
Nedvizhka/
├── .agent/                      # AI Agent конфигурация
│   ├── rules/                   # Правила для ИИ-ассистента
│   │   ├── project.md           # Общие принципы проекта
│   │   ├── api.md               # Стандарты API
│   │   ├── backend.md           # Бэкенд-конвенции
│   │   ├── design.md            # Дизайн-система
│   │   ├── process.md           # Процесс разработки
│   │   ├── workspace.md         # Настройка рабочего пространства
│   │   └── architecture.md      # <-- ЭТОТ ФАЙЛ
│   └── workflows/               # Автоматизированные сценарии
│       └── generate-unit-tests.md
├── apps/
│   ├── api/                     # FastAPI Backend
│   └── web/                     # Next.js Frontend
├── docker-compose.yml           # Docker Compose для локальной разработки
├── Makefile                     # Команды сборки и запуска
├── manage.ps1                   # PowerShell-скрипт для Windows
├── MEMORY.md                    # Контекст для ИИ между сессиями
└── checklist.md                 # Мастер-чеклист проекта
```

---

## Backend: `apps/api/`

**Технологии**: Python 3.12, FastAPI, SQLAlchemy, Alembic, SQLite (dev) / PostgreSQL (prod)

```
apps/api/
├── app/
│   ├── main.py                  # Точка входа FastAPI
│   ├── api/v1/
│   │   ├── router.py            # Агрегатор роутов API v1
│   │   ├── properties.py        # CRUD операции с объектами
│   │   ├── complexes.py         # ЖК (комплексы) API
│   │   ├── heatmap.py           # GeoJSON данные для карты
│   │   ├── seed.py              # Генерация демо-данных
│   │   ├── parse.py             # Запуск парсеров (Avito, CIAN)
│   │   ├── ingest.py            # Прием данных от парсеров
│   │   └── stats.py             # Статистика
│   ├── core/
│   │   ├── config.py            # Настройки приложения
│   │   └── deps.py              # Зависимости (DB session)
│   ├── models/
│   │   └── property.py          # SQLAlchemy модели
│   ├── schemas/
│   │   └── property.py          # Pydantic схемы
│   ├── services/
│   │   ├── property_service.py  # Бизнес-логика объектов
│   │   └── parser_service.py    # Сервис парсинга
│   └── parsers/
│       └── avito_parser.py      # Парсер Avito
├── alembic/                     # Миграции БД
├── tests/                       # Тесты
├── pyproject.toml               # Зависимости Python
└── estate_analytics.db          # SQLite файл (dev)
```

### Ключевые API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/v1/properties` | GET | Список объектов недвижимости |
| `/api/v1/properties/{id}` | GET | Детали объекта |
| `/api/v1/properties/bulk` | POST | 🆕 Массовое создание квартир |
| `/api/v1/heatmap` | GET | GeoJSON для карты |
| `/api/v1/complexes` | GET | Список ЖК |
| `/api/v1/complexes/{id}/apartments` | GET | 🆕 Квартиры в ЖК |
| `/api/v1/seed` | POST | Создать демо-данные |

---

## 🏗️ Developer Properties (Новостройки) — PLANNED

### Новые поля в модели Property

| Поле | Тип | Описание |
|------|-----|----------|
| `layout_type` | String | Свободная / Фиксированная / Студия / Евро |
| `finishing_type` | String | Черновая / Предчистовая / Чистовая / Дизайнерская |
| `completion_date` | String | "4 кв. 2025" или "Сдан" |
| `property_type` | String | apartment / newbuild / cottage / commercial |
| `is_from_developer` | Boolean | Флаг "От застройщика" |
| `developer_name` | String | Название застройщика |
| `developer_comment` | String | Комментарий застройщика (вместо owner_quote) |
| `custom_fields` | JSON | Поля свободной формы |
| `complex_id` | FK → Complex | Связь с ЖК |

### Архитектура компонентов

```
apps/web/app/
├── properties/
│   └── [id]/
│       └── page.tsx          # Условный рендер: квартира vs новостройка
├── admin/
│   └── properties/
│       ├── page.tsx          # Основная форма (обновить)
│       └── bulk-create/
│           └── page.tsx      # 🆕 Массовое создание
└── components/
    ├── PropertyCard.tsx      # Обновить: бейджи застройщика
    ├── NewbuildLanding.tsx   # 🆕 Лендинг новостройки
    └── ApartmentGrid.tsx     # 🆕 Сетка квартир в ЖК
```

### Задачи (JSON)

Полный список задач: `.agent/tasks/developer-properties.json`


## Frontend: `apps/web/`

**Технологии**: Next.js 15 (App Router), TypeScript, TailwindCSS, Leaflet, 2GIS Maps API

```
apps/web/
├── app/
│   ├── layout.tsx               # Корневой layout
│   ├── page.tsx                 # Главная страница
│   ├── globals.css              # Глобальные стили
│   ├── components/
│   │   ├── PremiumMap.tsx       # ⭐ ГЛАВНАЯ КАРТА (110KB)
│   │   ├── PropertyMap.tsx      # Альтернативная карта
│   │   ├── LeafletMap.tsx       # OSM Leaflet карта
│   │   ├── TwoGisMap.tsx        # 2GIS карта
│   │   ├── Header.tsx           # Шапка сайта
│   │   ├── Footer.tsx           # Подвал
│   │   ├── HamburgerMenu.tsx    # Мобильное меню
│   │   ├── PropertyCard.tsx     # Карточка объекта
│   │   ├── PropertyFilters.tsx  # Фильтры поиска
│   │   ├── DistrictDetails.tsx  # Панель района
│   │   ├── NewsFeed.tsx         # Лента новостей
│   │   ├── SocialFeed.tsx       # Лента отзывов
│   │   ├── PriceChart.tsx       # График цен
│   │   ├── StatsCard.tsx        # Карточка статистики
│   │   ├── WelcomeModal.tsx     # Приветственный модал
│   │   └── ThemeToggle.tsx      # Переключатель темы
│   ├── hooks/
│   │   ├── useBreakpoint.ts     # Адаптивные брейкпоинты
│   │   └── useLocalStorage.ts   # Хранение в LS
│   ├── styles/
│   │   ├── design-tokens.css    # CSS переменные (цвета, шрифты)
│   │   ├── elite-theme.css      # Люксовая тема
│   │   ├── luxury-typography.css # Типографика
│   │   ├── components.css       # Стили компонентов
│   │   ├── layout.css           # Стили разметки
│   │   └── typography.css       # Текстовые стили
│   ├── utils/
│   │   └── mockLocations.ts     # Моковые адреса Сочи
│   ├── constants/
│   │   └── routes.ts            # Маршруты приложения
│   ├── providers/
│   │   └── ThemeProvider.tsx    # Провайдер темы
│   ├── about/page.tsx           # Страница "О нас"
│   ├── analytics/page.tsx       # Аналитика рынка
│   ├── map/page.tsx             # Страница карты
│   ├── properties/
│   │   ├── page.tsx             # Каталог объектов
│   │   └── [id]/page.tsx        # Детали объекта
│   └── complexes/
│       ├── page.tsx             # Список ЖК
│       └── [name]/page.tsx      # Детали ЖК
├── public/                      # Статические файлы
├── package.json                 # Зависимости Node.js
└── tsconfig.json                # TypeScript конфиг
```

### Ключевые страницы

| URL | Файл | Описание |
|-----|------|----------|
| `/` | `page.tsx` | Главная с hero-секцией |
| `/map` | `map/page.tsx` | Интерактивная карта |
| `/analytics` | `analytics/page.tsx` | Аналитика рынка |
| `/properties` | `properties/page.tsx` | Каталог объектов |
| `/properties/[id]` | `properties/[id]/page.tsx` | Детали объекта |
| `/complexes` | `complexes/page.tsx` | Список ЖК |
| `/complexes/[name]` | `complexes/[name]/page.tsx` | Детали ЖК |
| `/about` | `about/page.tsx` | О компании |

---

## Интеграции

### 2GIS API

- **Карты**: `TwoGisMap.tsx`, `PremiumMap.tsx` (опционально)
- **Геокодинг**: Планируется для автоматического определения координат

### Leaflet/OSM

- **Карты**: `LeafletMap.tsx`, `PremiumMap.tsx` (по умолчанию)

### Парсеры

- **Avito**: `parsers/avito_parser.py`
- **CIAN**: Планируется

---

## Environment Variables

### Backend (`apps/api/.env`)

```env
DATABASE_URL=postgresql://estate_analytics_db_user:[password]@dpg-d5n2lp0gjchc73935fdg-a.virginia-postgres.render.com/estate_analytics_db
DGIS_API_KEY=your_2gis_key
```

### Frontend (`apps/web/.env.local`)

```env
# Локально
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production (настроить в Vercel Dashboard)
NEXT_PUBLIC_API_URL=https://nedvizhkaestate-analytics-api.onrender.com
```

> [!IMPORTANT]
> Для production необходимо настроить `NEXT_PUBLIC_API_URL` в Vercel Dashboard:
> Settings → Environment Variables → Add `NEXT_PUBLIC_API_URL`

---

## Запуск проекта

```powershell
# Windows (PowerShell)
.\manage.ps1 dev       # Запустить оба сервера
.\manage.ps1 api       # Только API
.\manage.ps1 web       # Только Web
.\manage.ps1 seed      # Создать демо-данные
```

```bash
# Docker
docker-compose up -d
```

## Production URLs

- **Frontend**: https://web-zeta-blush-32.vercel.app
- **Backend API**: https://nedvizhkaestate-analytics-api.onrender.com
- **API Health**: https://nedvizhkaestate-analytics-api.onrender.com/healthz
- **Admin Panel**: https://web-zeta-blush-32.vercel.app/admin
