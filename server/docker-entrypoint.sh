#!/bin/sh
set -e

echo "🦷 [OdontoCheck Docker] Aguardando conexão com o MongoDB..."
node -e '
const mongoose = require("mongoose");
const uri = process.env.MONGO_URI || "mongodb://mongodb:27017/odontochess";

async function waitForMongo() {
  for (let i = 1; i <= 30; i++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log("✅ [OdontoCheck Docker] Conectado ao MongoDB com sucesso!");
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.log(`⏳ [OdontoCheck Docker] Tentativa ${i}/30 - Aguardando MongoDB iniciar...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  console.error("❌ [OdontoCheck Docker] Tempo esgotado para conectar ao MongoDB.");
  process.exit(1);
}

waitForMongo();
'

# Auto-seed opcional na inicialização (garante dados iniciais em bancos limpos)
if [ "$AUTO_SEED" = "true" ]; then
  echo "🌱 [OdontoCheck Docker] Verificando dados iniciais e executando seed..."
  node src/scripts/seed.js || echo "⚠️ [OdontoCheck Docker] Aviso: Seed já executado ou falhou suavemente."
fi

echo "🚀 [OdontoCheck Docker] Iniciando servidor Express API..."
exec "$@"
