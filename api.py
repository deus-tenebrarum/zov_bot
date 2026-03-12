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

from config import BOT_TOKEN, API_URL, GAME_URL

BOT_USERNAME = os.environ.get("BOT_USERNAME", "ZeroOrValuable_bot").lstrip("@")
REFERRAL_COINS = 1500
REFERRAL_BOXES = 1

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = Path(os.environ.get("RAILWAY_VOLUME_MOUNT_PATH", "")) or (BASE_DIR / "data")
LEADERBOARD_FILE = DATA_DIR / "leaderboard.json"
STORAGE_FILE = DATA_DIR / "storage.json"
REFERRALS_FILE = DATA_DIR / "referrals.json"

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

REFERRALS = {}


def _load_referrals():
    if REFERRALS_FILE.exists():
        try:
            with open(REFERRALS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data
        except Exception as e:
            logger.warning("Failed to load referrals: %s", e)
    return {"credited": {}, "by_referrer": {}}


def _save_referrals():
    try:
        REFERRALS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(REFERRALS_FILE, "w", encoding="utf-8") as f:
            json.dump(REFERRALS, f, ensure_ascii=False, indent=0)
    except Exception as e:
        logger.warning("Failed to save referrals: %s", e)


REFERRALS.update(_load_referrals())

DAILY_FILE = DATA_DIR / "daily.json"
DAILY = {}


def _load_daily():
    if DAILY_FILE.exists():
        try:
            with open(DAILY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, dict) else {}
        except Exception as e:
            logger.warning("Failed to load daily: %s", e)
    return {}


def _save_daily():
    try:
        DAILY_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(DAILY_FILE, "w", encoding="utf-8") as f:
            json.dump(DAILY, f, ensure_ascii=False, indent=0)
    except Exception as e:
        logger.warning("Failed to save daily: %s", e)


DAILY.update(_load_daily())

DAILY_REWARDS = [
    {"type": "coins", "amount": 50, "label": "50 монет"},
    {"type": "coins", "amount": 100, "label": "100 монет"},
    {"type": "coins", "amount": 150, "label": "150 монет"},
    {"type": "coins", "amount": 200, "label": "200 монет"},
    {"type": "coins", "amount": 300, "label": "300 монет"},
    {"type": "coins", "amount": 500, "label": "500 монет"},
    {"type": "secretBoxKeys", "amount": 1, "label": "1 секретный бокс"},
    {"type": "coins", "amount": 80, "label": "80 монет"},
    {"type": "coins", "amount": 250, "label": "250 монет"},
    {"type": "secretBoxKeys", "amount": 1, "label": "1 секретный бокс"},
]


def _get_daily_reward(user_id: str) -> dict:
    """Случайная награда на день — одинаково для юзера в один день."""
    from datetime import date
    today = date.today().isoformat()
    seed = hash(f"{user_id}_{today}") % (2**32)
    idx = seed % len(DAILY_REWARDS)
    return dict(DAILY_REWARDS[idx])


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
    xp = int(data.get("xp") or 0)
    level = int(data.get("level") or 1)
    if not user_id:
        return jsonify({"ok": False})
    LEADERBOARD[user_id] = {"user_id": user_id, "username": username, "cardsCount": cards_count, "xp": xp, "level": level}
    _save_leaderboard()
    return jsonify({"ok": True})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/referral/register", methods=["POST"])
def api_referral_register():
    """Регистрация реферала: текущий юзер пришёл по ссылке referrer_id. Начисляем награду пригласившему."""
    data = request.get_json() or {}
    init_data = data.get("initData") or request.headers.get("X-Init-Data")
    user = validate_init_data(init_data)
    referred_id = str(user.get("id")) if user else str(data.get("user_id") or "")
    referrer_id = str(data.get("referrer_id") or "").strip()
    if not referred_id or not referrer_id:
        return jsonify({"ok": False})
    if referrer_id == referred_id:
        return jsonify({"ok": False})
    credited = REFERRALS.get("credited", {})
    if credited.get(referred_id):
        return jsonify({"ok": True, "credited": False})
    ref_state = STORAGE.get(referrer_id) or {}
    if isinstance(ref_state, dict):
        state = ref_state
    else:
        state = {}
    coins_val = int(state.get("coins", 0)) + REFERRAL_COINS
    keys_val = int(state.get("secretBoxKeys", 0)) + REFERRAL_BOXES
    state["coins"] = coins_val
    state["secretBoxKeys"] = keys_val
    STORAGE[referrer_id] = state
    _save_storage()
    REFERRALS.setdefault("credited", {})[referred_id] = True
    REFERRALS.setdefault("by_referrer", {}).setdefault(referrer_id, []).append(referred_id)
    _save_referrals()
    return jsonify({"ok": True, "credited": True})


@app.route("/api/referral/stats", methods=["GET", "POST"])
def api_referral_stats():
    """Статистика рефералов: сколько пригласил, сколько монет и боксов получено."""
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"ok": False, "invitedCount": 0, "coinsEarned": 0, "boxesEarned": 0})
    by_ref = REFERRALS.get("by_referrer", {}).get(user_id, [])
    count = len(by_ref)
    coins = count * REFERRAL_COINS
    boxes = count * REFERRAL_BOXES
    return jsonify({
        "ok": True,
        "invitedCount": count,
        "coinsEarned": coins,
        "boxesEarned": boxes,
    })


@app.route("/api/wallet/connect", methods=["POST"])
def api_wallet_connect():
    """Сохранить адрес TON кошелька — привязка к профилю."""
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"ok": False})
    data = request.get_json() or {}
    address = (data.get("address") or "").strip()
    if not address or len(address) < 40:
        return jsonify({"ok": False})
    state = STORAGE.get(user_id)
    if isinstance(state, dict):
        state = dict(state)
    else:
        state = {}
    state["walletAddress"] = address
    STORAGE[user_id] = state
    _save_storage()
    return jsonify({"ok": True})


@app.route("/api/referral/link", methods=["GET", "POST"])
def api_referral_link():
    """Ссылка для приглашения друзей."""
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"ok": False, "link": ""})
    link = f"https://t.me/{BOT_USERNAME}?start=ref_{user_id}"
    return jsonify({"ok": True, "link": link})


@app.route("/api/daily/claim", methods=["POST"])
def api_daily_claim():
    """Ежедневная награда — раз в день, случайная."""
    from datetime import date
    data = request.get_json() or {}
    init_data = data.get("initData") or request.headers.get("X-Init-Data")
    user = validate_init_data(init_data)
    user_id = str(user.get("id")) if user else str(data.get("user_id") or "")
    if not user_id:
        return jsonify({"ok": False, "claimed": False})
    today = date.today().isoformat()
    last = DAILY.get(user_id)
    if last == today:
        return jsonify({"ok": True, "claimed": False, "already": True})
    reward = _get_daily_reward(user_id)
    state = STORAGE.get(user_id)
    if isinstance(state, dict):
        state = dict(state)
    else:
        state = {}
    if reward["type"] == "coins":
        state["coins"] = int(state.get("coins", 0)) + reward["amount"]
    elif reward["type"] == "secretBoxKeys":
        state["secretBoxKeys"] = int(state.get("secretBoxKeys", 0)) + reward["amount"]
    STORAGE[user_id] = state
    _save_storage()
    DAILY[user_id] = today
    _save_daily()
    return jsonify({
        "ok": True,
        "claimed": True,
        "reward": reward,
    })


@app.route("/tonconnect-manifest.json")
def tonconnect_manifest():
    """TON Connect manifest — обязателен для подключения кошелька."""
    base = (GAME_URL or request.url_root.rstrip("/")).rstrip("/")
    if not base.startswith("https://"):
        base = "https://" + base.split("://", 1)[-1].lstrip("/")
    resp = jsonify({
        "url": base,
        "name": "Zero or Valuable",
        "iconUrl": "https://ton.org/download/ton_symbol.png",
        "termsOfUseUrl": base + "/",
        "privacyPolicyUrl": base + "/",
    })
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Cache-Control"] = "public, max-age=300"
    return resp


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
