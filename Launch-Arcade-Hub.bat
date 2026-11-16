@echo off
setlocal
set "HUB_URL=file:///D:/Leytens%%20Game/index.html"
set "PROFILE_DIR=%TEMP%\LeytensArcadeHubProfile"

set "EDGE_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "CHROME_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"

if exist "%EDGE_EXE%" (
  start "" "%EDGE_EXE%" --kiosk "%HUB_URL%" --edge-kiosk-type=fullscreen --user-data-dir="%PROFILE_DIR%" --no-first-run --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required
  exit /b 0
)

if exist "%CHROME_EXE%" (
  start "" "%CHROME_EXE%" --kiosk "%HUB_URL%" --user-data-dir="%PROFILE_DIR%" --no-first-run --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required
  exit /b 0
)

start "" "D:\Leytens Game\index.html"
