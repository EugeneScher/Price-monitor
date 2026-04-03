# PriceMonitor - Сервис анализа цен конкурентов

Веб-сервис для мониторинга цен конкурентов в поисковой выдаче Яндекс с автоматическим сбором и сравнением ценовых данных.

## Возможности

- **Автоматический поиск конкурентов** - ввод поисковых запросов и получение списка конкурентов из выдачи Яндекс
- **Ручной ввод конкурентов** - указание конкретных сайтов для анализа
- **Парсинг цен** - сбор цен с сайтов конкурентов по CSS-селекторам
- **Сравнительный отчёт** - анализ разницы цен с вашими товарами
- **Экспорт данных** - выгрузка в Excel и CSV форматы
- **История анализов** - сохранение и просмотр всех проведённых анализов

## Технологии

### Backend
- Python 3.10+
- Flask
- SQLAlchemy (SQLite/PostgreSQL)
- Flask-JWT-Extended
- BeautifulSoup4
- Requests

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart.js
- Lucide Icons

## Установка и запуск

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Сервер запустится на http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно на http://localhost:3000

## Структура проекта

```
price-monitor/
├── backend/
│   ├── app/
│   │   ├── models/      # Модели базы данных
│   │   ├── routes/      # API маршруты
│   │   ├── services/    # Бизнес-логика
│   │   └── utils/       # Утилиты (парсеры)
│   ├── config/          # Конфигурация
│   ├── main.py          # Точка входа
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы приложения
│   │   ├── context/     # React Context
│   │   ├── utils/       # Утилиты
│   │   └── styles/      # CSS стили
│   ├── index.html
│   └── package.json
└── README.md
```

## API Endpoints

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена
- `GET /api/auth/me` - Текущий пользователь

### Анализы
- `GET /api/analysis` - Список анализов
- `POST /api/analysis` - Создание анализа
- `GET /api/analysis/{id}` - Детали анализа
- `DELETE /api/analysis/{id}` - Удаление анализа
- `POST /api/analysis/link` - Связывание товаров

## Конфигурация

Переменные окружения для backend:

```
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///pricemonitor.db
```

## Дипломный проект

Разработано в рамках дипломного проекта.
