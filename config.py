# Zero or Valuable — конфиг бота
# Всё на PythonAnywhere: GAME_URL = API_URL = https://USERNAME.pythonanywhere.com
import os

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
GAME_URL = os.environ.get("GAME_URL", "").rstrip("/")  # https://USERNAME.pythonanywhere.com
API_URL = os.environ.get("API_URL", "").rstrip("/")     # тот же URL или пусто — API на том же домене
