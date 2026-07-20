@echo off
cd /d %~dp0
if not exist node_modules (
  echo Dang cai thu vien...
  call npm install
)
call npm run build
set NODE_ENV=production
set SERVE_WEB=true
call npm start
pause
