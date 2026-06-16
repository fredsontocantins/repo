#!/bin/sh
set -e

echo "[1/3] Aplicando schema no banco..."
npx prisma db push --skip-generate

echo "[2/3] Rodando seed..."
./node_modules/.bin/ts-node \
  --compiler-options '{"module":"commonjs","skipLibCheck":true}' \
  prisma/seed.ts || echo "  [SKIP] Seed pulado (dados ja existem)"

echo "[3/3] Iniciando API na porta 3001..."
# nest build com sourceRoot=src coloca arquivos em dist/src/
exec node dist/src/main.js
