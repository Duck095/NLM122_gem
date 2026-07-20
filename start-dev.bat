@echo off
cd /d %~dp0
if not exist node_modules (
  echo Dang cai thu vien...
  call npm install
)
call npm run dev
pause
