#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zero or Valuable — точка входа для Railway.
Запускает API (игра) + бота в одном процессе.
"""
import os
import threading

def run_bot():
    from bot import main as bot_main
    bot_main()

def run_web():
    from api import app
    port = int(os.environ.get("PORT", 5000))
    from waitress import serve
    serve(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    t = threading.Thread(target=run_bot, daemon=True)
    t.start()
    run_web()
