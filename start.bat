@echo off
cd /d "%~dp0"
echo Starting server...
start http://localhost:3333
python -m http.server 3333
pause

