@echo off
rem Aula Excel: compila la web (si hace falta) y arranca el servidor en http://localhost:3010
cd /d "%~dp0web"
if not exist dist\index.html call npm run build
cd /d "%~dp0server"
echo Aula Excel en http://localhost:3010   (Ctrl+C para detener)
node index.js
