@echo off
rem CAR CASH - Public AI Edition
rem Double-click to play locally: starts a tiny local web server and opens the game in your browser.
setlocal
cd /d "%~dp0"
set PORT=8642
set URL=http://localhost:%PORT%/index.html

python -c "import sys" >nul 2>nul
if %errorlevel%==0 (
  start "CAR CASH server - close this window to stop" /min python -m http.server %PORT% --bind 127.0.0.1
  goto open
)
py -3 -c "import sys" >nul 2>nul
if %errorlevel%==0 (
  start "CAR CASH server - close this window to stop" /min py -3 -m http.server %PORT% --bind 127.0.0.1
  goto open
)
rem no Python: the game also runs straight from the file
start "" "%~dp0index.html"
goto :eof

:open
timeout /t 2 /nobreak >nul
start "" "%URL%"
