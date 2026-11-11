#!/bin/bash
# ========================================================
# Script de Inicialização Automatizada via Docker Compose
# OdontoCheck • Sistema Full Stack de Gestão Odontológica
# ========================================================

set -e

echo ""
echo "🦷 ========================================================"
echo "🦷 INICIANDO ODONTOCHECK VIA DOCKER COMPOSE"
echo "✨ Subindo MongoDB, Backend Express API e Frontend Nginx..."
echo "🦷 ========================================================"
echo ""

# Verifica se o comando docker está disponível
if ! command -v docker &> /dev/null; then
    echo "❌ Erro: O comando 'docker' não foi encontrado."
    echo "💡 Por favor, instale o Docker Desktop ou Docker Engine: https://www.docker.com/"
    exit 1
fi

# Detecta se usa 'docker compose' (v2) ou 'docker-compose' (v1)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌ Erro: Docker Compose não foi encontrado."
    echo "💡 Instale o plugin Compose ou Docker Desktop: https://docs.docker.com/compose/"
    exit 1
fi

# Verifica se o usuário atual tem permissão no docker.sock ou precisa de sudo
if ! docker ps &> /dev/null; then
    echo "🔒 Permissão necessária para acessar o Docker Daemon. Usando sudo..."
    COMPOSE_CMD="sudo $COMPOSE_CMD"
fi

echo "📦 Compilando imagens e inicializando os contêineres..."
$COMPOSE_CMD up --build -d

echo ""
echo "============================================================"
echo "✅ ODONTOCHECK INICIADO COM SUCESSO!"
echo "============================================================"
echo "💻 Portal do Paciente / Web: http://localhost:3000"
echo "📡 Backend API RESTful:      http://localhost:5000/api"
echo "💾 Banco de Dados MongoDB:   localhost:27017"
echo "============================================================"
echo "👥 Perfis Demo 1-Click pré-carregados:"
echo "   👑 Diretor Clínico: admin@odontochess.com (senha: admin123)"
echo "   🦷 Dentista:         dentista@odontochess.com (senha: dentista123)"
echo "   📋 Recepção:         recepcao@odontochess.com (senha: recepcao123)"
echo "   👤 Paciente:         paciente@odontochess.com (senha: paciente123)"
echo "============================================================"
echo "📋 Comandos Úteis:"
echo "   Ver logs ao vivo: $COMPOSE_CMD logs -f"
echo "   Parar contêineres: $COMPOSE_CMD down"
echo "   Reiniciar dados:  $COMPOSE_CMD exec server npm run seed"
echo "============================================================"
echo ""
