# Zero or Valuable — конфиг бота
# BOT_TOKEN, GAME_URL, API_URL — без изменений
import os

RAILWAY_URL = "https://zovbot-production.up.railway.app"
BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
GAME_URL = os.environ.get("GAME_URL", RAILWAY_URL).rstrip("/")
API_URL = os.environ.get("API_URL", RAILWAY_URL).rstrip("/")
