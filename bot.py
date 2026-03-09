#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zero or Valuable — Telegram-бот.
Команды: /start, /game. Отправляет ссылку на мини-приложение.
"""

import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

from config import BOT_TOKEN, GAME_URL, API_URL

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /start — приветствие и кнопка «Играть» (Mini App)."""
    user = update.effective_user
    text = (
        f"Привет, {user.first_name}!\n\n"
        "🎮 **Zero or Valuable** — тапай по монете, открывай боксы и собирай карточки "
        "городов и сёл со всего мира.\n\n"
        "Нажми кнопку ниже, чтобы открыть игру."
    )
    game_url = GAME_URL + ("?api=" + API_URL if API_URL else "")
    keyboard = [
        [
            InlineKeyboardButton(
                "▶️ Играть",
                web_app=WebAppInfo(url=game_url),
            ),
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        text,
        reply_markup=reply_markup,
        parse_mode="Markdown",
    )


async def game(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /game — сразу открыть игру."""
    game_url = GAME_URL + ("?api=" + API_URL if API_URL else "")
    keyboard = [
        [
            InlineKeyboardButton(
                "▶️ Открыть Zero or Valuable",
                web_app=WebAppInfo(url=game_url),
            ),
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Нажми кнопку, чтобы открыть игру:",
        reply_markup=reply_markup,
    )


def main() -> None:
    if not BOT_TOKEN:
        print("Задай BOT_TOKEN в config.py или в переменной окружения BOT_TOKEN")
        return

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("game", game))

    logger.info("Бот запущен (@ZeroOrValuable_bot)")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
