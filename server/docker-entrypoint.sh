#!/bin/sh
set -e

if [ "$AUTO_SEED" = "true" ]; then
  node src/scripts/seed.js
fi

exec "$@"
