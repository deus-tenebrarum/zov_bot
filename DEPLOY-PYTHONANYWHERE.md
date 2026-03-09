# Деплой на PythonAnywhere

Всё (API + игра) работает на одном домене.

## 1. Загрузка

Через **Files** залей в `~/zov/`:
- `api.py`, `bot.py`, `config.py`, `wsgi.py`
- `requirements-bot.txt`
- папку `static/` с файлами: `index.html`, `app.js`, `data.js`, `styles.css`

## 2. Зависимости

В **Consoles** → Bash:
```bash
cd ~/zov
pip install -r requirements-bot.txt
```

## 3. Web app

**Web** → **Add a new web app** → Flask → путь: `/home/USERNAME/zov`

В **Code** → **WSGI configuration file** замени содержимое на:
```python
import sys
import os
path = '/home/USERNAME/zov'  # твой username
if path not in sys.path:
    sys.path.insert(0, path)
from api import app as application
```

## 4. Переменные окружения

**Web** → **Environment variables**:
- `BOT_TOKEN` — токен бота
- `GAME_URL` — `https://USERNAME.pythonanywhere.com`
- `API_URL` — `https://USERNAME.pythonanywhere.com` (или пусто)

## 5. Бот (платный план)

**Tasks** → **Always-on task** → команда:
```bash
python ~/zov/bot.py
```

## Роуты

- `/` — игра (Mini App)
- `/api/load`, `/api/save`, `/api/leaderboard` — API
- `/styles.css`, `/app.js`, `/data.js` — статика
