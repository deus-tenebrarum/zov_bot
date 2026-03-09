# Zero or Valuable — Telegram-бот

Бот для игры **Zero or Valuable**: приветствие и кнопка для открытия мини-приложения.

## Установка

```bash
pip install -r requirements-bot.txt
```

## Запуск

```bash
python bot.py
```

Токен и URL игры заданы в `config.py`. Для продакшена лучше использовать переменные окружения:

```bash
set BOT_TOKEN=8713145658:AAH...
set GAME_URL=https://deus-tenebrarum.github.io/zov_bot/
python bot.py
```

## Команды

- ** /start** — приветствие и кнопка «Играть» (открывает игру как Web App).
- **/game** — кнопка для открытия игры.

Кнопка открывает твой хост с игрой (`GAME_URL`) в режиме Mini App внутри Telegram.

## Синхронизация и лидерборд (API)

Чтобы прогресс сохранялся по аккаунту Telegram и работал лидерборд:

1. Запусти API (отдельно от бота):
   ```bash
   python api.py
   ```
   API слушает порт 5000. Для продакшена разверни его (например, на Railway/Heroku) и получи URL.

2. В `config.py` задай URL API и передавай его в игру через ссылку:
   - Либо в коде бота подставь в `GAME_URL` параметр:  
     `GAME_URL = "https://твой-хост-игры/?api=https://твой-api.com"`
   - Либо в HTML игры задай `window.ZOV_API_BASE = 'https://твой-api.com'` до загрузки `app.js`.

3. При открытии игры из Telegram (с переданным `?api=...`) прогресс загружается с сервера и при изменениях сохраняется; счёт карточек отправляется в лидерборд.
