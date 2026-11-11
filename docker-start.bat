@echo off
REM ========================================================
REM Script de Inicialização Automatizada via Docker Compose
REM OdontoCheck • Sistema Full Stack de Gestão Odontológica
REM ========================================================

echo.
echo ========================================================
echo 🦷 INICIANDO ODONTOCHECK VIA DOCKER COMPOSE
echo ✨ Subindo MongoDB, Backend Express API e Frontend Nginx...
echo ========================================================
echo.

docker compose up --build -d

echo.
echo ========================================================
echo ✅ ODONTOCHECK INICIADO COM SUCESSO!
echo ========================================================
echo 💻 Portal do Paciente / Web: http://localhost:3000
echo 📡 Backend API RESTful:      http://localhost:5000/api
echo 💾 Banco de Dados MongoDB:   localhost:27017
echo ========================================================
echo.
echo Abra seu navegador em: http://localhost:3000
echo.
pause
