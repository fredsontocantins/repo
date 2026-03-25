#!/bin/sh
set -e

echo "⏳ Aplicando schema no banco..."
npx prisma db push --skip-generate

echo "🌱 Rodando seed..."
./node_modules/.bin/ts-node \
  --compiler-options '{"module":"commonjs","skipLibCheck":true}' \
  prisma/seed.ts || echo "⚠️  Seed pulado (dados já existem)"

echo "🚀 Iniciando API na porta 3001..."
# nest build com sourceRoot=src coloca arquivos em dist/src/
exec node dist/src/main.js
