#!/bin/bash
set -e

echo "========================================"
echo "  Voluntarios App - Setup"
echo "========================================"

# [1/8] Instala ferramentas auxiliares
echo ""
echo "[1/8] Instalando utilitarios (postgresql-client)..."
sudo apt-get update -qq && sudo apt-get install -y -qq postgresql-client 2>/dev/null
echo "  OK. Utilitarios prontos!"

# [2/8] Instala Docker CLI (sem Docker Engine — o daemon roda no host)
echo ""
echo "[2/8] Instalando Docker CLI..."
sudo apt-get update -qq && sudo apt-get install -y -qq ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -qq && sudo apt-get install -y -qq docker-ce-cli
# Ajusta GID do grupo docker para bater com o socket montado do host
DOCKER_GID=$(stat -c '%g' /var/run/docker.sock 2>/dev/null || echo 999)
if getent group docker > /dev/null 2>&1; then
  sudo groupmod -g "$DOCKER_GID" docker
else
  sudo groupadd -g "$DOCKER_GID" docker
fi
sudo usermod -aG docker node
echo "  OK. Docker CLI pronto!"

# [3/8] Cria .env na raiz se nao existir
echo ""
echo "[3/8] Verificando .env na raiz do projeto..."
if [ ! -f /workspace/.env ]; then
  if [ -f /workspace/.env.example ]; then
    cp /workspace/.env.example /workspace/.env
    echo "  OK. .env criado a partir de .env.example"
  else
    echo "  WARN: .env.example nao encontrado. Crie .env manualmente."
  fi
else
  echo "  OK. .env ja existe"
fi

# [4/8] Aguarda PostgreSQL ficar pronto
echo ""
echo "[4/8] Aguardando PostgreSQL..."
for i in $(seq 1 30); do
  if pg_isready -h postgres -U postgres > /dev/null 2>&1; then
    echo "  OK. PostgreSQL pronto!"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "  ERRO: PostgreSQL nao respondeu apos 30s"
    exit 1
  fi
  sleep 1
done

# [5/8] Backend
echo ""
echo "[5/8] Instalando dependencias do backend..."
cd /workspace/backend
npm install --legacy-peer-deps

# [6/8] Configurando banco de dados
echo ""
echo "[6/8] Configurando banco de dados..."
cp -n .env.example .env 2>/dev/null || true
npx prisma generate
npx prisma db push --accept-data-loss 2>/dev/null || npx prisma db push

# [7/8] Populando banco (seed)
echo ""
echo "[7/8] Populando banco (seed)..."
npx ts-node --compiler-options '{"module":"commonjs","skipLibCheck":true}' prisma/seed.ts 2>/dev/null || echo "  INFO: Seed ja aplicado ou tabelas ja populadas"

# [8/8] Frontend
echo ""
echo "[8/8] Instalando dependencias do frontend..."
cd /workspace/frontend
npm install --legacy-peer-deps

echo ""
echo "========================================"
echo "  OK. Setup concluido!"
echo ""
echo "  Para iniciar o backend:"
echo "    cd /workspace/backend && npm run start:dev"
echo ""
echo "  Para iniciar o frontend:"
echo "    cd /workspace/frontend && npm run dev"
echo ""
echo "  Acessos:"
echo "    Frontend => http://localhost:3000"
echo "    API      => http://localhost:3001"
echo "    Swagger  => http://localhost:3001/api"
echo "========================================"
