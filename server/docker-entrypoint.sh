#!/bin/sh
set -e

echo "Aguardando MongoDB e executando seed..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if node src/scripts/seed.js; then
    break
  fi
  echo "Tentativa $i/10: aguardando banco de dados..."
  sleep 2
done

exec "$@"
