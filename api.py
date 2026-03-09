#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zero or Valuable — API + игра (всё на PythonAnywhere).
Запуск: python api.py  (или через gunicorn)
Переменные: BOT_TOKEN, GAME_URL, API_URL.
"""

import hashlib
import hmac
import json
import logging
import os
import urllib.parse
from collections import OrderedDict
from pathlib import Path

from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from config import BOT_TOKEN, API_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = Path(os.environ.get("RAILWAY_VOLUME_MOUNT_PATH", "")) or (BASE_DIR / "data")
LEADERBOARD_FILE = DATA_DIR / "leaderboard.json"
STORAGE_FILE = DATA_DIR / "storage.json"

app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="")
CORS(app)

STORAGE = {}


def _load_storage():
    if STORAGE_FILE.exists():
        try:
            with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data
        except Exception as e:
            logger.warning("Failed to load storage: %s", e)
    return {}


def _save_storage():
    try:
        STORAGE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(STORAGE, f, ensure_ascii=False, indent=0)
    except Exception as e:
        logger.warning("Failed to save storage: %s", e)


STORAGE.update(_load_storage())


LEADERBOARD = {}


def _load_leaderboard():
    if LEADERBOARD_FILE.exists():
        try:
            with open(LEADERBOARD_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data
        except Exception as e:
            logger.warning("Failed to load leaderboard: %s", e)
    return {}


def _save_leaderboard():
    try:
        LEADERBOARD_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(LEADERBOARD_FILE, "w", encoding="utf-8") as f:
            json.dump(LEADERBOARD, f, ensure_ascii=False, indent=0)
    except Exception as e:
        logger.warning("Failed to save leaderboard: %s", e)


LEADERBOARD.update(_load_leaderboard())


def validate_init_data(init_data: str) -> dict | None:
    """Проверка initData от Telegram Web App. Возвращает dict с user или None."""
    if not init_data or not BOT_TOKEN:
        return None
    try:
        parsed = urllib.parse.parse_qs(init_data, keep_blank_values=True)
        hash_val = (parsed.get("hash") or [None])[0]
        if not hash_val:
            return None
        data_check_parts = []
        for key in sorted(parsed.keys()):
            if key == "hash":
                continue
            val = (parsed[key] or [""])[0]
            data_check_parts.append(f"{key}={val}")
        data_check_string = "\n".join(data_check_parts)
        secret_key = hmac.new(
            b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256
        ).digest()
        computed = hmac.new(
            secret_key, data_check_string.encode(), hashlib.sha256
        ).hexdigest()
        if computed != hash_val:
            return None
        user_str = (parsed.get("user") or [None])[0]
        if not user_str:
            return None
        return json.loads(user_str)
    except Exception as e:
        logger.warning("initData validation failed: %s", e)
        return None


def _get_user_id():
    """user_id из initData (проверка) или из запроса (fallback для TG WebView)."""
    init_data = request.args.get("initData") or request.headers.get("X-Init-Data")
    try:
        data = request.get_json(silent=True) or {}
        init_data = init_data or data.get("initData")
    except Exception:
        data = {}
    user = validate_init_data(init_data)
    if user:
        return str(user.get("id"))
    uid = data.get("user_id") or request.args.get("user_id")
    return str(uid) if uid else None


@app.route("/api/load", methods=["GET", "POST"])
def api_load():
    """Загрузка сохранения по user_id (Telegram). Один аккаунт на всех устройствах."""
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"ok": False, "state": None})
    state = STORAGE.get(user_id)
    return jsonify({"ok": True, "state": state})


@app.route("/api/save", methods=["POST"])
def api_save():
    """Сохранение состояния по user_id. Body: { "initData" или "user_id", "state" }."""
    data = request.get_json() or {}
    init_data = data.get("initData") or request.headers.get("X-Init-Data")
    user = validate_init_data(init_data)
    user_id = str(user.get("id")) if user else str(data.get("user_id") or "")
    if not user_id:
        return jsonify({"ok": False})
    state = data.get("state")
    if state is not None:
        STORAGE[user_id] = state
        _save_storage()
    return jsonify({"ok": True})


@app.route("/api/leaderboard", methods=["GET", "POST"])
def api_leaderboard():
    if request.method == "GET":
        items = list(LEADERBOARD.values())
        items.sort(key=lambda x: -(x.get("cardsCount") or 0))
        return jsonify(items[:50])
    data = request.get_json() or {}
    user_id = str(data.get("user_id") or "")
    username = (data.get("username") or "").strip() or "Игрок"
    cards_count = int(data.get("cardsCount") or 0)
    if not user_id:
        return jsonify({"ok": False})
    LEADERBOARD[user_id] = {"user_id": user_id, "username": username, "cardsCount": cards_count}
    _save_leaderboard()
    return jsonify({"ok": True})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/")
def index():
    """Главная — игра (Mini App). Инжектим API URL для лидерборда."""
    html_path = STATIC_DIR / "index.html"
    html = html_path.read_text(encoding="utf-8")
    api_base = API_URL or request.url_root.rstrip("/")
    html = html.replace("__ZOV_API_BASE__", api_base)
    return Response(html, mimetype="text/html")


def main():
    port = int(os.environ.get("PORT", 5000))
    logger.info("API starting on port %s", port)
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")


if __name__ == "__main__":
    main()
