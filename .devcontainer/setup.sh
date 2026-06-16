#!/bin/bash
set -e

echo "========================================"
echo "  Voluntários App — Setup"
echo "========================================"

# ── Instala ferramentas auxiliares ──
echo ""
echo "[1/6] Instalando utilitários (postgresql-client)..."
sudo apt-get update -qq && sudo apt-get install -y -qq postgresql-client 2>/dev/null
echo "  ✅ Utilitários prontos!"

# ── Aguarda PostgreSQL ficar pronto ──
echo ""
echo "[2/6] Aguardando PostgreSQL..."
for i in $(seq 1 30); do
  if pg_isready -h postgres -U postgres > /dev/null 2>&1; then
    echo "  ✅ PostgreSQL pronto!"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "  ❌ PostgreSQL não respondeu após 30s"
    exit 1
  fi
  sleep 1
done

# ── Backend ──
echo ""
echo "[3/6] Instalando dependências do backend..."
cd /workspace/backend
npm install --legacy-peer-deps

echo ""
echo "[4/6] Configurando banco de dados..."
cp -n .env.example .env 2>/dev/null || true
npx prisma generate
npx prisma db push --accept-data-loss 2>/dev/null || npx prisma db push

echo ""
echo "[5/6] Populando banco (seed)..."
npx ts-node --compiler-options '{"module":"commonjs","skipLibCheck":true}' prisma/seed.ts 2>/dev/null || echo "  ⚠️  Seed já aplicado ou tabelas já populadas"

# ── Frontend ──
echo ""
echo "[6/6] Instalando dependências do frontend..."
cd /workspace/frontend
npm install --legacy-peer-deps

echo ""
echo "========================================"
echo "  ✅ Setup concluído!"
echo ""
echo "  Para iniciar o backend:"
echo "    cd /workspace/backend && npm run start:dev"
echo ""
echo "  Para iniciar o frontend:"
echo "    cd /workspace/frontend && npm run dev"
echo ""
echo "  Acessos:"
echo "    Frontend → http://localhost:3000"
echo "    API      → http://localhost:3001"
echo "    Swagger  → http://localhost:3001/api"
echo "========================================"
