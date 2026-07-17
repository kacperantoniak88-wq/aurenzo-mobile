@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "Aurenzo Mobile" /min py -m http.server 8080
) else (
  where python >nul 2>nul
  if not %errorlevel%==0 goto no_python
  start "Aurenzo Mobile" /min python -m http.server 8080
)
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080/index.html"
exit

:no_python
echo Do uruchomienia strony potrzebny jest Python 3.
echo Mozesz tez wyslac caly folder na hosting.
pause
