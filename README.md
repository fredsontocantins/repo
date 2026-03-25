# 🌱 Voluntários SaaS v4 — Plataforma Completa

Sistema SaaS completo para gestão de voluntários, campanhas, eventos, finances e portal público.

---

## 🚀 Demo rápido (Docker)

1. Bote tudo no ar: `docker compose up --build` (as imagens já usam `node_modules` e `prisma` gerados).
2. Aguarde ~2‑3 minutos; os containers expõem:
   | Serviço | URL |
   |--------|-----|
   | 🌐 Portal Público | http://localhost:3000/portal/voluntarios-unidos |
   | 🔐 Admin / Dashboard | http://localhost:3000/dashboard |
   | 📡 API | http://localhost:3001/api/v1 |
   | 📚 Swagger | http://localhost:3001/api/docs |
   | ✅ Certificados | http://localhost:3000/portal/certificate |

Credenciais de demonstração:
- Admin: `admin@voluntariosunidos.org.br` / `admin123`
- Coord: `coord@voluntariosunidos.org.br` / `coord123`

---

## 🧭 Desenvolvimento local (sem Docker)

O projeto está dividido em `backend/` (NestJS) e `frontend/` (Next.js). Abra duas abas de terminal.

### Backend

```bash
cd backend
npm install
cp .env.example .env      # configure DATABASE_URL, JWT_SECRET, FRONTEND_URL
npx prisma generate
npm run db:push
npm run db:seed
npm run start:dev          # API em http://localhost:3001
```

> Use `npm run build && npm run start:prod` para rodar em modo de produção.

### Frontend

```bash
cd ../frontend
npm install
cat <<'EOF' > .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
BACKEND_URL=http://localhost:3001
