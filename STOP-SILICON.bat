@echo off
echo Stopping Silicon Trading PERN Stack services...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8090" ^| findstr "LISTENING"') do (
  echo Terminating process %%a on port 8090...
  taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
  echo Terminating process %%a on port 5000...
  taskkill /f /pid %%a >nul 2>&1
)

echo Services stopped.
