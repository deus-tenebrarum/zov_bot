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


MENU_KEYBOARD = ReplyKeyboardMarkup(
    [
        [KeyboardButton("▶️ Играть"), KeyboardButton("🎁 Собрать")],
        [KeyboardButton("🔄 Заново")],
    ],
    resize_keyboard=True,
    is_persistent=True,
)


def get_game_inline_keyboard_with_ref(referrer_id: str | None = None, daily: bool = False):
    """Кнопка «Играть» — с ref/daily в URL если нужно."""
    url = GAME_URL_FULL
    if referrer_id:
        url = url + ("&" if "?" in url else "?") + "ref=" + str(referrer_id)
    if daily:
        url = url + ("&" if "?" in url else "?") + "daily=1"
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("▶️ Открыть игру", web_app=WebAppInfo(url=url))],
    ])


def get_game_inline_keyboard():
    return get_game_inline_keyboard_with_ref(None)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /start — приветствие, меню и кнопка «Играть». Поддержка ref_XXX в deep link."""
    user = update.effective_user
    referrer_id = None
    if update.message and update.message.text:
        parts = update.message.text.split(maxsplit=1)
        if len(parts) >= 2 and parts[1].startswith("ref_"):
            referrer_id = parts[1][4:].strip()
            context.user_data["referrer_id"] = referrer_id
    referrer_id = referrer_id or context.user_data.get("referrer_id")
    name = (user.first_name or "Игрок").strip()
    text = (
        f"Привет, {name}!\n\n"
        "🎮 Zero or Valuable — тапай по монете, открывай боксы и собирай карточки "
        "городов и сёл со всего мира.\n\n"
        "Используй кнопки меню внизу или нажми «Играть» ниже."
    )
    await update.message.reply_text(
        text,
        reply_markup=MENU_KEYBOARD,
    )
    await update.message.reply_text(
        "Нажми, чтобы открыть игру:",
        reply_markup=get_game_inline_keyboard_with_ref(referrer_id),
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


async def daily_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /daily — собрать ежедневный бонус."""
    referrer_id = context.user_data.get("referrer_id")
    await update.message.reply_text(
        "🎁 Бонус за ежедневный вход! Нажми кнопку ниже:",
        reply_markup=get_game_inline_keyboard_with_ref(referrer_id, daily=True),
    )


async def menu_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработка нажатий кнопок меню."""
    text = (update.message.text or "").strip()
    referrer_id = context.user_data.get("referrer_id")
    if text == "▶️ Играть":
        await update.message.reply_text(
            "Нажми кнопку ниже:",
            reply_markup=get_game_inline_keyboard_with_ref(referrer_id),
        )
    elif text == "🔄 Заново":
        await update.message.reply_text(
            "🔄 Открыть игру заново:",
            reply_markup=get_game_inline_keyboard_with_ref(referrer_id),
        )
    elif text == "🎁 Собрать":
        await update.message.reply_text(
            "🎁 Бонус за ежедневный вход! Нажми кнопку ниже, откроется игра — награда зачислится автоматически:",
            reply_markup=get_game_inline_keyboard_with_ref(referrer_id, daily=True),
        )


def main() -> None:
    if not BOT_TOKEN:
        print("Задай BOT_TOKEN в config.py или в переменной окружения BOT_TOKEN")
        return

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("game", game))
    app.add_handler(CommandHandler("restart", restart))
    app.add_handler(CommandHandler("daily", daily_cmd))
    app.add_handler(MessageHandler(filters.Regex("^(▶️ Играть|🔄 Заново|🎁 Собрать)$"), menu_button))

    logger.info("Бот запущен")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
