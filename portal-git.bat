@echo off
setlocal EnableExtensions EnableDelayedExpansion
title SC Portal Deploy
cd /d "%~dp0" || exit /b 1

for %%I in ("%~dp0.") do set "TRADEVIZ_DIR=%%~fI"
if not defined WEB_DIR set "WEB_DIR=%~dp0..\web"
if not defined MOCKSP_DIR set "MOCKSP_DIR=%~dp0..\mocksp"
for %%I in ("%WEB_DIR%") do set "WEB_DIR=%%~fI"
for %%I in ("%MOCKSP_DIR%") do set "MOCKSP_DIR=%%~fI"
if not exist "%WEB_DIR%\package.json" if exist "%~dp0..\Web\package.json" for %%I in ("%~dp0..\Web") do set "WEB_DIR=%%~fI"

if not defined PORTAL_PORT set "PORTAL_PORT=3000"
if not defined PORTAL_USE_SCHEDULER_TASK set "PORTAL_USE_SCHEDULER_TASK=1"
if /i "%PORTAL_USE_SCHEDULER_TASK%"=="0" (set "PORTAL_SCHEDULER_TASK=") else (if not defined PORTAL_SCHEDULER_TASK set "PORTAL_SCHEDULER_TASK=SCPortal Next.js")

if not defined MOCKSP_PORT set "MOCKSP_PORT=3001"
if not defined MOCKSP_BASE_PATH set "MOCKSP_BASE_PATH=/mocksp"
if not defined MOCKSP_USE_SCHEDULER_TASK set "MOCKSP_USE_SCHEDULER_TASK=1"
if /i "%MOCKSP_USE_SCHEDULER_TASK%"=="0" (set "MOCKSP_SCHEDULER_TASK=") else (if not defined MOCKSP_SCHEDULER_TASK set "MOCKSP_SCHEDULER_TASK=Mock SharePoint")

if not defined TRADEVIZ_PORT set "TRADEVIZ_PORT=3002"
if not defined TRADEVIZ_BASE_PATH set "TRADEVIZ_BASE_PATH=/TradeViz"
if not defined TRADEVIZ_USE_SCHEDULER_TASK set "TRADEVIZ_USE_SCHEDULER_TASK=1"
if /i "%TRADEVIZ_USE_SCHEDULER_TASK%"=="0" (set "TRADEVIZ_SCHEDULER_TASK=") else (if not defined TRADEVIZ_SCHEDULER_TASK set "TRADEVIZ_SCHEDULER_TASK=Mock TradeViz")

if not exist "%TRADEVIZ_DIR%\package.json" (
  echo [ERROR] TradeViz package.json not found in %TRADEVIZ_DIR%
  pause
  exit /b 1
)

if /i "%~1"=="portal-deploy" goto RUN_PORTAL_DEPLOY
if /i "%~1"=="mocksp-deploy" goto RUN_MOCKSP_DEPLOY
if /i "%~1"=="tradeviz-deploy" goto RUN_TRADEVIZ_DEPLOY
if /i "%~1"=="help" goto CLI_HELP
if /i "%~1"=="-h" goto CLI_HELP
if /i "%~1"=="/?" goto CLI_HELP

:MENU
cls
echo.
echo  ============================================================
echo   SC Portal Deploy
echo  ============================================================
echo.
echo   Portal    %WEB_DIR%
echo   Mocksp    %MOCKSP_DIR%
echo   TradeViz  %TRADEVIZ_DIR%
echo.
echo   SC Portal        port %PORTAL_PORT%
echo     1  Deploy
echo.
echo   Mock SharePoint  port %MOCKSP_PORT%  %MOCKSP_BASE_PATH%
echo     2  Deploy
echo.
echo   TradeViz         port %TRADEVIZ_PORT%  %TRADEVIZ_BASE_PATH%
echo     3  Deploy
echo.
echo     0  Exit
echo.
choice /c 1230 /n /m "  Choose: "
set "PICK=!ERRORLEVEL!"
if "!PICK!"=="4" goto DONE
if "!PICK!"=="3" goto DO_TRADEVIZ_DEPLOY
if "!PICK!"=="2" goto DO_MOCKSP_DEPLOY
goto DO_PORTAL_DEPLOY

:CLI_HELP
echo.
echo portal-git.bat
echo portal-git.bat portal-deploy
echo portal-git.bat mocksp-deploy
echo portal-git.bat tradeviz-deploy
echo.
goto DONE

:DO_PORTAL_DEPLOY
call :RUN_PORTAL_DEPLOY
pause
goto MENU

:DO_MOCKSP_DEPLOY
call :RUN_MOCKSP_DEPLOY
pause
goto MENU

:DO_TRADEVIZ_DEPLOY
call :RUN_TRADEVIZ_DEPLOY
pause
goto MENU

:RUN_PORTAL_DEPLOY
echo.
echo ===== SC Portal deploy =====
call :ENSURE_WEB_DIR || exit /b 1
pushd "%WEB_DIR%" || exit /b 1
git rev-parse --git-dir >nul 2>&1 || (echo [ERROR] Not a git repository. & popd & exit /b 1)
popd
call :RUN_PORTAL_PULL || exit /b 1
call :STOP_PORTAL
call :RUN_PORTAL_PROD
exit /b %ERRORLEVEL%

:RUN_MOCKSP_DEPLOY
echo.
echo ===== Mock SharePoint deploy =====
call :ENSURE_MOCKSP_DIR || exit /b 1
call :RUN_MOCKSP_PULL || exit /b 1
call :STOP_MOCKSP
call :RUN_MOCKSP_PROD
exit /b %ERRORLEVEL%

:RUN_TRADEVIZ_DEPLOY
echo.
echo ===== TradeViz deploy =====
call :ENSURE_TRADEVIZ_DIR || exit /b 1
call :RUN_TRADEVIZ_PULL || exit /b 1
call :STOP_TRADEVIZ
call :RUN_TRADEVIZ_PROD
exit /b %ERRORLEVEL%

:RUN_PORTAL_PULL
call :ENSURE_WEB_DIR || exit /b 1
pushd "%WEB_DIR%" || exit /b 1
echo --- git fetch origin main ---
git fetch origin main || (popd & exit /b 1)
echo --- git reset --hard origin/main ---
git reset --hard origin/main || (echo [ERROR] Portal pull failed. & popd & exit /b 1)
echo [OK] Portal at:
git log -1 --oneline
popd
exit /b 0

:RUN_MOCKSP_PULL
call :ENSURE_MOCKSP_DIR || exit /b 1
pushd "%MOCKSP_DIR%" || exit /b 1
git rev-parse --git-dir >nul 2>&1 || (echo [ERROR] Not a git repo: %MOCKSP_DIR% & popd & exit /b 1)
git fetch origin main || (popd & exit /b 1)
git reset --hard origin/main || (echo [ERROR] Mocksp pull failed. & popd & exit /b 1)
echo [OK] Mocksp at:
git log -1 --oneline
popd
exit /b 0

:RUN_TRADEVIZ_PULL
call :ENSURE_TRADEVIZ_DIR || exit /b 1
pushd "%TRADEVIZ_DIR%" || exit /b 1
git rev-parse --git-dir >nul 2>&1 || (echo [ERROR] Not a git repo: %TRADEVIZ_DIR% & popd & exit /b 1)
git fetch origin main || (popd & exit /b 1)
git reset --hard origin/main || (echo [ERROR] TradeViz pull failed. & popd & exit /b 1)
echo [OK] TradeViz at:
git log -1 --oneline
popd
exit /b 0

:STOP_PORTAL
call :STOP_PORTAL_SCHED
call :KILL_PORT %PORTAL_PORT%
exit /b 0

:STOP_MOCKSP
call :STOP_MOCKSP_SCHED
call :KILL_PORT %MOCKSP_PORT%
exit /b 0

:STOP_TRADEVIZ
call :STOP_TRADEVIZ_SCHED
call :KILL_PORT %TRADEVIZ_PORT%
exit /b 0

:STOP_PORTAL_SCHED
if not defined PORTAL_SCHEDULER_TASK exit /b 0
schtasks /Query /TN "%PORTAL_SCHEDULER_TASK%" >nul 2>&1 || exit /b 0
schtasks /End /TN "%PORTAL_SCHEDULER_TASK%"
timeout /t 2 /nobreak >nul
exit /b 0

:STOP_MOCKSP_SCHED
if not defined MOCKSP_SCHEDULER_TASK exit /b 0
schtasks /Query /TN "%MOCKSP_SCHEDULER_TASK%" >nul 2>&1 || exit /b 0
schtasks /End /TN "%MOCKSP_SCHEDULER_TASK%"
timeout /t 2 /nobreak >nul
exit /b 0

:STOP_TRADEVIZ_SCHED
if not defined TRADEVIZ_SCHEDULER_TASK exit /b 0
schtasks /Query /TN "%TRADEVIZ_SCHEDULER_TASK%" >nul 2>&1 || exit /b 0
schtasks /End /TN "%TRADEVIZ_SCHEDULER_TASK%"
timeout /t 2 /nobreak >nul
exit /b 0

:START_PORTAL_SCHED
if defined PORTAL_SCHEDULER_TASK if /i not "%PORTAL_USE_SCHEDULER_TASK%"=="0" (
  schtasks /Query /TN "%PORTAL_SCHEDULER_TASK%" >nul 2>&1 || (echo [ERROR] Task not found: %PORTAL_SCHEDULER_TASK% & exit /b 1)
  schtasks /Run /TN "%PORTAL_SCHEDULER_TASK%" || exit /b 1
  echo [OK] Portal scheduler started.
  exit /b 0
)
echo [INFO] Run npm start in %WEB_DIR%
exit /b 0

:START_MOCKSP_SCHED
if defined MOCKSP_SCHEDULER_TASK if /i not "%MOCKSP_USE_SCHEDULER_TASK%"=="0" (
  schtasks /Query /TN "%MOCKSP_SCHEDULER_TASK%" >nul 2>&1 || (echo [ERROR] Task not found: %MOCKSP_SCHEDULER_TASK% & exit /b 1)
  schtasks /Run /TN "%MOCKSP_SCHEDULER_TASK%" || exit /b 1
  echo [OK] Mocksp scheduler started.
  exit /b 0
)
echo [INFO] Run npm start in %MOCKSP_DIR%
exit /b 0

:START_TRADEVIZ_SCHED
if defined TRADEVIZ_SCHEDULER_TASK if /i not "%TRADEVIZ_USE_SCHEDULER_TASK%"=="0" (
  schtasks /Query /TN "%TRADEVIZ_SCHEDULER_TASK%" >nul 2>&1 || (echo [ERROR] Task not found: %TRADEVIZ_SCHEDULER_TASK% & exit /b 1)
  schtasks /Run /TN "%TRADEVIZ_SCHEDULER_TASK%" || exit /b 1
  echo [OK] TradeViz scheduler started.
  exit /b 0
)
echo [INFO] Run npm start in %TRADEVIZ_DIR%
exit /b 0

:KILL_PORT
set "_KP=%~1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $p = @(Get-NetTCPConnection -LocalPort !_KP! -State Listen -EA SilentlyContinue | Select -Expand OwningProcess -Unique) } catch { $p = @() }; if ($p) { $p | %% { if ($_ -gt 0) { Stop-Process -Id $_ -Force -EA SilentlyContinue } } } else { Write-Host '[INFO] Nothing on port !_KP!.' }"
exit /b 0

:RUN_PORTAL_PROD
call :ENSURE_WEB_DIR || exit /b 1
pushd "%WEB_DIR%" || exit /b 1
set "_SAVED_NODE_ENV=%NODE_ENV%"
set NODE_ENV=
call npm ci --include=dev || (set "NODE_ENV=%_SAVED_NODE_ENV%" & popd & echo [ERROR] Portal npm ci failed. & exit /b 1)
set "NODE_ENV=%_SAVED_NODE_ENV%"
call npm run build || (popd & echo [ERROR] Portal build failed. & exit /b 1)
echo [OK] Portal build finished.
if defined PORTAL_SCHEDULER_TASK if /i not "%PORTAL_USE_SCHEDULER_TASK%"=="0" (popd & call :START_PORTAL_SCHED & exit /b %ERRORLEVEL%)
call npm run start
set "_RC=%ERRORLEVEL%"
popd
exit /b %_RC%

:RUN_MOCKSP_PROD
call :ENSURE_MOCKSP_DIR || exit /b 1
pushd "%MOCKSP_DIR%" || exit /b 1
set "_SAVED_NODE_ENV=%NODE_ENV%"
set NODE_ENV=
call npm ci --include=dev || (set "NODE_ENV=%_SAVED_NODE_ENV%" & popd & echo [ERROR] Mocksp npm ci failed. & exit /b 1)
set "NODE_ENV=%_SAVED_NODE_ENV%"
set "BASE_PATH=%MOCKSP_BASE_PATH%"
call npm run build || (popd & echo [ERROR] Mocksp build failed. & exit /b 1)
echo [OK] Mocksp build finished.
if defined MOCKSP_SCHEDULER_TASK if /i not "%MOCKSP_USE_SCHEDULER_TASK%"=="0" (popd & call :START_MOCKSP_SCHED & exit /b %ERRORLEVEL%)
call npm start
set "_RC=%ERRORLEVEL%"
popd
exit /b %_RC%

:RUN_TRADEVIZ_PROD
call :ENSURE_TRADEVIZ_DIR || exit /b 1
pushd "%TRADEVIZ_DIR%" || exit /b 1
set "_SAVED_NODE_ENV=%NODE_ENV%"
set NODE_ENV=
call npm ci --include=dev || (set "NODE_ENV=%_SAVED_NODE_ENV%" & popd & echo [ERROR] TradeViz npm ci failed. & exit /b 1)
set "NODE_ENV=%_SAVED_NODE_ENV%"
set "BASE_PATH=%TRADEVIZ_BASE_PATH%"
call npm run build || (popd & echo [ERROR] TradeViz build failed. & exit /b 1)
echo [OK] TradeViz build finished.
if defined TRADEVIZ_SCHEDULER_TASK if /i not "%TRADEVIZ_USE_SCHEDULER_TASK%"=="0" (popd & call :START_TRADEVIZ_SCHED & exit /b %ERRORLEVEL%)
call npm start
set "_RC=%ERRORLEVEL%"
popd
exit /b %_RC%

:ENSURE_WEB_DIR
if exist "%WEB_DIR%\package.json" exit /b 0
echo [ERROR] SC Portal Web not found: %WEB_DIR%
exit /b 1

:ENSURE_MOCKSP_DIR
if exist "%MOCKSP_DIR%\package.json" exit /b 0
echo [ERROR] Mock SharePoint not found: %MOCKSP_DIR%
echo git clone https://github.com/LTMNO/mock-sharepoint.git "%MOCKSP_DIR%"
exit /b 1

:ENSURE_TRADEVIZ_DIR
if exist "%TRADEVIZ_DIR%\package.json" exit /b 0
echo [ERROR] TradeViz not found: %TRADEVIZ_DIR%
echo git clone https://github.com/LTMNO/TradeViz.git "%TRADEVIZ_DIR%"
exit /b 1

:DONE
endlocal
exit /b 0