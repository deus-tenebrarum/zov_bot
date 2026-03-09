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

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from config import BOT_TOKEN

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="")
CORS(app)

# In-memory хранилище (для продакшена лучше Redis/DB)
STORAGE = {}
LEADERBOARD = {}


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


@app.route("/api/load", methods=["GET"])
def api_load():
    """Загрузка сохранения по initData (query: initData)."""
    init_data = request.args.get("initData") or request.headers.get("X-Init-Data")
    user = validate_init_data(init_data)
    if not user:
        return jsonify({"ok": False, "state": None})
    user_id = str(user.get("id"))
    state = STORAGE.get(user_id)
    return jsonify({"ok": True, "state": state})


@app.route("/api/save", methods=["POST"])
def api_save():
    """Сохранение состояния. Body: { "initData": "...", "state": { ... } }."""
    data = request.get_json() or {}
    init_data = data.get("initData") or request.headers.get("X-Init-Data")
    user = validate_init_data(init_data)
    if not user:
        return jsonify({"ok": False})
    user_id = str(user.get("id"))
    state = data.get("state")
    if state is not None:
        STORAGE[user_id] = state
    return jsonify({"ok": True})


@app.route("/api/leaderboard", methods=["GET", "POST"])
def api_leaderboard():
    if request.method == "GET":
        items = list(LEADERBOARD.values())
        items.sort(key=lambda x: -(x.get("cardsCount") or 0))
        return jsonify(items[:50])
    data = request.get_json() or {}
    init_data = data.get("initData") or request.headers.get("X-Init-Data")
    user = validate_init_data(init_data)
    if not user:
        return jsonify({"ok": False})
    user_id = str(user.get("id"))
    username = data.get("username") or user.get("username") or user.get("first_name") or "Игрок"
    cards_count = int(data.get("cardsCount") or 0)
    LEADERBOARD[user_id] = {"user_id": user_id, "username": username, "cardsCount": cards_count}
    return jsonify({"ok": True})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/")
def index():
    """Главная — игра (Mini App)."""
    return send_from_directory(STATIC_DIR, "index.html")


def main():
    port = int(os.environ.get("PORT", 5000))
    logger.info("API starting on port %s", port)
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")


if __name__ == "__main__":
    main()
