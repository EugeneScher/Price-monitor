# PriceMonitor — Сервис анализа цен конкурентов

Веб-сервис для мониторинга цен конкурентов в поисковой выдаче с автоматическим сбором и сравнением ценовых данных.

## Возможности

- **Автоматический поиск конкурентов** — поиск по DuckDuckGo (органическая + рекламная выдача) с учётом региона
- **Ручной ввод конкурентов** — указание конкретных сайтов для анализа
- **Парсинг цен** — сбор цен с сайтов конкурентов по CSS-селекторам через Selenium (с обходом попапов и lazy-контентом)
- **Сравнительный отчёт** — анализ разницы цен с вашими товарами
- **Визуализация** — графики Chart.js
- **Экспорт данных** — выгрузка в Excel и CSV
- **История анализов** — сохранение и просмотр всех анализов
- **Демо-режим** — ознакомление без регистрации
- **Адаптация под город** — регионы РФ (30 городов), подстановка города в поисковый запрос
- **Dark Mode** — тёмная тема

## Технологии

### Backend
- Python 3.11+
- Flask, Flask-JWT-Extended, Flask-CORS
- SQLAlchemy (SQLite)
- Selenium + ChromeDriver
- BeautifulSoup4, Requests, duckduckgo_search

### Frontend
- React 18, Vite, Tailwind CSS
- React Router, Axios
- Chart.js, Lucide Icons

## Установка и запуск

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 main.py 5001
```

Сервер запустится на http://localhost:5001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно на http://localhost:5173

Демо-доступ: `demo@demo.com` / `demo`

## Структура проекта

```
price-monitor/
├── backend/
│   ├── app/
│   │   ├── models/       # Модели БД (User, Analysis, Competitor, Product, ...)
│   │   ├── routes/       # API маршруты (auth, analysis)
│   │   ├── services/     # Бизнес-логика
│   │   └── utils/        # Парсеры (DuckDuckGo, Яндекс XML, SiteParser)
│   ├── config/           # Конфигурация, excluded_domains
│   ├── main.py           # Точка входа
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Layout, Charts
│   │   ├── pages/        # Home, Dashboard, AnalysisDetail, SelectorsSetup, ...
│   │   ├── context/      # AuthContext, ThemeContext, ToastContext
│   │   ├── utils/        # api, regions, export
│   │   └── styles/       # Tailwind + кастомные стили
│   └── package.json
└── README.md
```

## API Endpoints

### Авторизация
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `POST /api/auth/refresh` — обновление токена
- `GET /api/auth/me` — текущий пользователь
- `POST /api/auth/forgot-password` — восстановление пароля (JWT-токен)
- `POST /api/auth/reset-password` — смена пароля по токену

### Анализы
- `GET /api/analysis` — список анализов
- `POST /api/analysis` — создание анализа (auto/manual)
- `GET /api/analysis/{id}` — детали анализа с товарами и связями
- `DELETE /api/analysis/{id}` — удаление анализа
- `POST /api/analysis/{id}/select-competitors` — выбор конкурентов из найденных
- `POST /api/analysis/{id}/competitor` — добавление конкурента
- `GET /api/analysis/competitor/{id}` — данные конкурента
- `PUT /api/analysis/competitor/{id}` — обновление селекторов
- `DELETE /api/analysis/competitor/{id}` — удаление конкурента
- `POST /api/analysis/competitor/{id}/verify-selectors` — проверка селекторов
- `POST /api/analysis/competitor/{id}/parse` — парсинг товаров
- `POST /api/analysis/link` — связывание товаров
- `DELETE /api/analysis/link/{id}` — удаление связи
- `GET /api/analysis/{id}/report` — отчёт
- `POST /api/analysis/check-site` — проверка доступности сайта

## Поиск конкурентов

1. **DuckDuckGo (HTML)** — основной источник, органическая выдача
2. **Яндекс.XML** — опционально, рекламная выдача (требуется API-ключ)
3. **DuckDuckGo (Selenium)** — дополнительно, для рекламных результатов

Регионы автоматически адаптируются под DuckDuckGo (`ru-ru`).

## Дипломный проект 2026
