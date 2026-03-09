#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zero or Valuable — Telegram-бот.
Команды: /start, /game, /restart. Меню с кнопками.
"""

import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

from config import BOT_TOKEN, GAME_URL, API_URL

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

GAME_URL_FULL = GAME_URL + ("?api=" + API_URL if API_URL else "")

# Меню — кнопки внизу экрана (постоянные)
MENU_KEYBOARD = ReplyKeyboardMarkup(
    [
        [KeyboardButton("▶️ Играть")],
        [KeyboardButton("🔄 Заново")],
    ],
    resize_keyboard=True,
    is_persistent=True,
)


def get_game_inline_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("▶️ Открыть игру", web_app=WebAppInfo(url=GAME_URL_FULL))],
    ])


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /start — приветствие, меню и кнопка «Играть»."""
    user = update.effective_user
    text = (
        f"Привет, {user.first_name}!\n\n"
        "🎮 **Zero or Valuable** — тапай по монете, открывай боксы и собирай карточки "
        "городов и сёл со всего мира.\n\n"
        "Используй кнопки меню внизу или нажми «Играть» ниже."
    )
    await update.message.reply_text(
        text,
        reply_markup=MENU_KEYBOARD,
        parse_mode="Markdown",
    )
    await update.message.reply_text(
        "Нажми, чтобы открыть игру:",
        reply_markup=get_game_inline_keyboard(),
    )


async def game(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /game — открыть игру."""
    await update.message.reply_text(
        "Нажми кнопку:",
        reply_markup=get_game_inline_keyboard(),
    )


async def restart(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /restart — перезапустить игру."""
    await update.message.reply_text(
        "🔄 Открыть игру заново:",
        reply_markup=get_game_inline_keyboard(),
    )


async def menu_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработка нажатий кнопок меню."""
    text = (update.message.text or "").strip()
    if text == "▶️ Играть" or text == "🔄 Заново":
        await update.message.reply_text(
            "Нажми кнопку ниже:" if text == "▶️ Играть" else "🔄 Открыть игру заново:",
            reply_markup=get_game_inline_keyboard(),
        )


def main() -> None:
    if not BOT_TOKEN:
        print("Задай BOT_TOKEN в config.py или в переменной окружения BOT_TOKEN")
        return

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("game", game))
    app.add_handler(CommandHandler("restart", restart))
    app.add_handler(MessageHandler(filters.Regex("^(▶️ Играть|🔄 Заново)$"), menu_button))

    logger.info("Бот запущен")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
