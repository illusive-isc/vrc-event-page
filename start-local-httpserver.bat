@echo off
set PORT=8001
set DIR=C:\Users\amane\Desktop\vrc-event-page\.claude\worktrees\flamboyant-dirac
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"

where npx >nul 2>&1
if %errorlevel% == 0 (
    start "" cmd /k "cd /d %DIR% && npx serve . --listen %PORT%"
    goto OPEN
)

where python >nul 2>&1
if %errorlevel% == 0 (
    start "" cmd /k "cd /d %DIR% && python -m http.server %PORT%"
    goto OPEN
)

echo ERROR: Neither npx nor python was found on this system.
echo Please install one of the following:
echo   - Node.js (includes npx): https://nodejs.org/
echo   - Python: https://www.python.org/
pause
exit /b 1

:OPEN
timeout /t 3 /nobreak > nul
start "" %CHROME% "http://localhost:%PORT%"
