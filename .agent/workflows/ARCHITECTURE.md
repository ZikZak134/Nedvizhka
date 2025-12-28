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
| `/api/v1/heatmap` | GET | GeoJSON для карты |
| `/api/v1/complexes` | GET | Список ЖК |
| `/api/v1/complexes/{name}` | GET | Детали ЖК |
| `/api/v1/seed` | POST | Создать демо-данные |
| `/api/v1/parse/avito` | POST | Запустить парсер Avito |

---

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

```
DATABASE_URL=sqlite:///./estate_analytics.db
DGIS_API_KEY=your_2gis_key
```

### Frontend (`apps/web/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

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
