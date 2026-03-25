# 🌱 Voluntários SaaS v4 — Plataforma Completa

Sistema SaaS completo para gestão de voluntariado com Portal Público, Controle Financeiro, Certificados e muito mais.

## 🚀 Quick start (Docker)

1. Extraia o conteúdo: `unzip voluntarios_saas_v4.zip`.
2. Entre na pasta raiz: `cd saas_v4`.
3. Suba tudo com Docker: `docker compose up --build`.

Aguarde ~3 minutos na primeira vez. Os serviços ficam disponíveis em:

| Serviço | URL |
|---------|-----|
| 🌐 Portal Público | http://localhost:3000/portal/voluntarios-unidos |
| 🔐 Portal Admin | http://localhost:3000/dashboard |
| 📡 API | http://localhost:3001/api/v1 |
| 📚 Swagger | http://localhost:3001/api/docs |
| ✅ Certificados | http://localhost:3000/portal/certificate |

### Credenciais
- **Admin:** admin@voluntariosunidos.org.br / admin123
- **Coord:** coord@voluntariosunidos.org.br / coord123

---

## 🧭 Desenvolvimento local (Node + PostgreSQL)

Caso queira rodar os serviços fora de containers Docker, siga os passos abaixo. A pasta `saas_v4` contém o frontend e backend separados; mantenha duas abas/terminais abertas para cada camada.

### Pré-requisitos
- Node.js 20+ e npm 10+ (ou similar).
- PostgreSQL 15+ escutando em `localhost:5432` (ex.: `docker run -d --name voluntarios_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=voluntarios -p 5432:5432 postgres:15-alpine`).
- `npx prisma` e `ts-node` (já instalados pelo `npm install` no backend).

### Backend (API)

```bash
cd backend
npm install
cp .env.example .env
```

Edite `.env` se precisar apontar para outro host. O arquivo mínimo fica assim:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voluntarios
JWT_SECRET=voluntarios-super-secret-jwt-2024
FRONTEND_URL=http://localhost:3000
```

```bash
npx prisma generate
npm run db:push      # cria as tabelas conforme schema.prisma
npm run db:seed      # carrega seed completo para demo
npm run start:dev    # API em http://localhost:3001
```

> Para um deploy mais próximo do Docker use `npm run build` e `npm run start:prod`. Se quiser recomeçar do zero, rode `npx prisma migrate reset --force` antes do seed.

### Frontend (Portal + Admin)

```bash
cd ../frontend
npm install
cat <<'EOF' > .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
BACKEND_URL=http://localhost:3001
EOF
npm run dev          # app em http://localhost:3000
```

> O `NEXT_PUBLIC_API_URL` é usado no cliente; `BACKEND_URL` garante que as requisições SSR/edge alcancem o backend local.

### Verificação

- Portal público: `http://localhost:3000/portal/voluntarios-unidos`.
- Dashboard/admin: `http://localhost:3000/dashboard` (use as credenciais acima).
- API: `http://localhost:3001/api/v1`.
- Swagger: `http://localhost:3001/api/docs`.
- Validação de certificado: `http://localhost:3000/portal/certificate`.

---

## 🌱 Seed demonstrativo

O `backend/prisma/seed.ts` carrega um dataset completo para demonstração, incluindo:

- Organização "Voluntários Unidos" com portal ativado.
- Usuários Admin e Coordenadora (`admin123` / `coord123`).
- Equipe interna (diretora, gerente, analistas, estagiários).
- Badges (primeiro passo, herói da comunidade, mestre voluntário etc.).
- 14 voluntários ativos com pontos, horas e bios + 2 pendentes.
- Campanhas ativas e concluídas com associações de voluntários.
- Doações (monetárias, alimentos, medicamentos e equipamentos).
- Eventos agendados e realizados com inscrições e check-ins.
- Certificados com códigos `VOL-YYYY-XXXXXX` conectados a campanhas.
- Contas a pagar/receber exemplares para o fluxo financeiro.

Ao final do seed são exibidos os acessos e URLs para o front/back. Para recarregar o demo, repita `npm run db:seed` (após reset).

---

## 🗺️ Mapa do Sistema

### Portal Público (`/portal/:slug`)
Sem autenticação — design alegre e colorido
- **Landing** — stats ao vivo, campanhas em destaque, eventos, top voluntários
- **Campanhas** — todas as campanhas públicas com progresso de arrecadação
- **Ranking** — hall da fama público dos voluntários
- **Verificar Certificado** — valida certificados por código `VOL-YYYY-XXXXXX`

### Portal Interno (requer login)
| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/dashboard` | Todos | Analytics e métricas gerais |
| `/volunteers` | Todos | Gestão de voluntários |
| `/campaigns` | Todos | Gestão de campanhas |
| `/donations` | Todos | Registro de doações |
| `/events` | Todos | Gestão de eventos |
| `/finance` | Coord+ | **Controle financeiro** |
| `/gamification` | Todos | Ranking e badges |
| `/reports` | Coord+ | Geração de relatórios |
| `/admin/members` | Admin | Equipe interna |
| `/admin/certificates` | Coord+ | Emissão de certificados |
| `/settings` | Admin | Configurações da org |

---

## 💰 Controle Financeiro

### Contas a Pagar — Status
| Status | Cor | Descrição |
|--------|-----|-----------|
| 🔵 A Pagar | Azul | Em aberto, dentro do prazo |
| 🟢 Pago | Verde | Liquidado com comprovante |
| 🔴 Vencido | Vermelho | Passou da data sem pagamento (atualizado automaticamente) |
| ⚫ Cancelado | Cinza | Cancelado sem efeito financeiro |
| 🟠 Estornado | Laranja | Foi pago mas foi revertido |

### Contas a Receber — Status
| Status | Cor | Descrição |
|--------|-----|-----------|
| 🟣 A Receber | Índigo | Em aberto, dentro do prazo |
| 🟢 Recebido | Verde | Liquidado com confirmação |
| 🔴 Vencido | Vermelho | Passou da data (auto) |
| ⚫ Cancelado | Cinza | Cancelado |
| 🟠 Estornado | Laranja | Foi recebido mas revertido |

**Cancelado e Estornado são excluídos dos totais do painel.**

### Fluxo de Status
```
A_PAGAR / A_RECEBER
  ├── Pagar/Receber → PAGO / RECEBIDO
  │     └── Estornar → ESTORNADO
  ├── Prazo vence → VENCIDO (automático)
  │     └── Pagar/Receber → PAGO / RECEBIDO
  └── Cancelar → CANCELADO
```

---

## 🗄️ Banco de Dados — 14 Modelos

| Modelo | Descrição |
|--------|-----------|
| Organization | Organização (multi-tenant) |
| User | Usuários com roles |
| Member | Equipe administrativa interna |
| Volunteer | Voluntários |
| Campaign | Campanhas |
| CampaignVolunteer | Associação voluntário-campanha |
| Donation | Doações em espécie e monetárias |
| Event | Eventos |
| EventRegistration | Inscrições em eventos |
| Badge | Definição de conquistas |
| VolunteerBadge | Conquistas dos voluntários |
| Certificate | Certificados com código único |
| Payable | Contas a pagar |
| Receivable | Contas a receber |
| Report | Relatórios gerados |

---

## 📡 API — Endpoints

```
# Auth
POST /auth/login
POST /auth/register
GET  /auth/me

# Financeiro
GET  /finance/dashboard
GET  /finance/payables          ?status=&categoria=&search=&page=
POST /finance/payables
PUT  /finance/payables/:id/liquidar
PUT  /finance/payables/:id/estornar
PUT  /finance/payables/:id/cancelar
GET  /finance/receivables       ?status=&categoria=&search=&page=
POST /finance/receivables
PUT  /finance/receivables/:id/liquidar
PUT  /finance/receivables/:id/estornar
PUT  /finance/receivables/:id/cancelar

# Certificados (público)
GET  /certificates/verify/:codigo

# Portal Público (sem auth)
GET  /public/org/:slug
GET  /public/org/:slug/stats
GET  /public/org/:slug/campaigns
GET  /public/org/:slug/events
GET  /public/org/:slug/leaderboard

# + Volunteers, Campaigns, Donations, Events, Gamification, Members, Reports, Organization
```

---

## 🔧 Variáveis de Ambiente

```env
# backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voluntarios
JWT_SECRET=voluntarios-super-secret-jwt-2024
FRONTEND_URL=http://localhost:3000

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
BACKEND_URL=http://localhost:3001
```

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS 10, TypeScript, Passport JWT |
| ORM | Prisma 5 + PostgreSQL 15 |
| Frontend | Next.js 14 App Router, TypeScript |
| UI | Tailwind CSS 3, Lucide React |
| Charts | Recharts |
| Estado | Zustand |
| Deploy | Docker + Docker Compose |
EOF
npm run dev          # app em http://localhost:3000
```

> O `NEXT_PUBLIC_API_URL` é usado no cliente; `BACKEND_URL` garante que as requisições SSR/edge alcancem o backend local.

### Verificação

- Portal público: `http://localhost:3000/portal/voluntarios-unidos`.
- Dashboard/admin: `http://localhost:3000/dashboard` (use as credenciais acima).
- API: `http://localhost:3001/api/v1`.
- Swagger: `http://localhost:3001/api/docs`.
- Validação de certificado: `http://localhost:3000/portal/certificate`.

---

## 🌱 Seed demonstrativo

O `backend/prisma/seed.ts` carrega um dataset completo para demonstração, incluindo:

- Organização "Voluntários Unidos" com portal ativado.
- Usuários Admin e Coordenadora (`admin123` / `coord123`).
- Equipe interna (diretora, gerente, analistas, estagiários).
- Badges (primeiro passo, herói da comunidade, mestre voluntário etc.).
- 14 voluntários ativos com pontos, horas e bios + 2 pendentes.
- Campanhas ativas e concluídas com associações de voluntários.
- Doações (monetárias, alimentos, medicamentos e equipamentos).
- Eventos agendados e realizados com inscrições e check-ins.
- Certificados com códigos `VOL-YYYY-XXXXXX` conectados a campanhas.
- Contas a pagar/receber exemplares para o fluxo financeiro.

Ao final do seed são exibidos os acessos e URLs para o front/back. Para recarregar o demo, repita `npm run db:seed` (após reset).

---

## 🗺️ Mapa do Sistema

### Portal Público (`/portal/:slug`)
Sem autenticação — design alegre e colorido
- **Landing** — stats ao vivo, campanhas em destaque, eventos, top voluntários
- **Campanhas** — todas as campanhas públicas com progresso de arrecadação
- **Ranking** — hall da fama público dos voluntários
- **Verificar Certificado** — valida certificados por código `VOL-YYYY-XXXXXX`

### Portal Interno (requer login)
| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/dashboard` | Todos | Analytics e métricas gerais |
| `/volunteers` | Todos | Gestão de voluntários |
| `/campaigns` | Todos | Gestão de campanhas |
| `/donations` | Todos | Registro de doações |
| `/events` | Todos | Gestão de eventos |
| `/finance` | Coord+ | **Controle financeiro** |
| `/gamification` | Todos | Ranking e badges |
| `/reports` | Coord+ | Geração de relatórios |
| `/admin/members` | Admin | Equipe interna |
| `/admin/certificates` | Coord+ | Emissão de certificados |
| `/settings` | Admin | Configurações da org |

---

## 💰 Controle Financeiro

### Contas a Pagar — Status
| Status | Cor | Descrição |
|--------|-----|-----------|
| 🔵 A Pagar | Azul | Em aberto, dentro do prazo |
| 🟢 Pago | Verde | Liquidado com comprovante |
| 🔴 Vencido | Vermelho | Passou da data sem pagamento (atualizado automaticamente) |
| ⚫ Cancelado | Cinza | Cancelado sem efeito financeiro |
| 🟠 Estornado | Laranja | Foi pago mas foi revertido |

### Contas a Receber — Status
| Status | Cor | Descrição |
|--------|-----|-----------|
| 🟣 A Receber | Índigo | Em aberto, dentro do prazo |
| 🟢 Recebido | Verde | Liquidado com confirmação |
| 🔴 Vencido | Vermelho | Passou da data (auto) |
| ⚫ Cancelado | Cinza | Cancelado |
| 🟠 Estornado | Laranja | Foi recebido mas revertido |

**Cancelado e Estornado são excluídos dos totais do painel.**

### Fluxo de Status
```
A_PAGAR / A_RECEBER
  ├── Pagar/Receber → PAGO / RECEBIDO
  │     └── Estornar → ESTORNADO
  ├── Prazo vence → VENCIDO (automático)
  │     └── Pagar/Receber → PAGO / RECEBIDO
  └── Cancelar → CANCELADO
```

---

## 🗄️ Banco de Dados — 14 Modelos

| Modelo | Descrição |
|--------|-----------|
| Organization | Organização (multi-tenant) |
| User | Usuários com roles |
| Member | Equipe administrativa interna |
| Volunteer | Voluntários |
| Campaign | Campanhas |
| CampaignVolunteer | Associação voluntário-campanha |
| Donation | Doações em espécie e monetárias |
| Event | Eventos |
| EventRegistration | Inscrições em eventos |
| Badge | Definição de conquistas |
| VolunteerBadge | Conquistas dos voluntários |
| Certificate | Certificados com código único |
| Payable | Contas a pagar |
| Receivable | Contas a receber |
| Report | Relatórios gerados |

---

## 📡 API — Endpoints

```
# Auth
POST /auth/login
POST /auth/register
GET  /auth/me

# Financeiro
GET  /finance/dashboard
GET  /finance/payables          ?status=&categoria=&search=&page=
POST /finance/payables
PUT  /finance/payables/:id/liquidar
PUT  /finance/payables/:id/estornar
PUT  /finance/payables/:id/cancelar
GET  /finance/receivables       ?status=&categoria=&search=&page=
POST /finance/receivables
PUT  /finance/receivables/:id/liquidar
PUT  /finance/receivables/:id/estornar
PUT  /finance/receivables/:id/cancelar

# Certificados (público)
GET  /certificates/verify/:codigo

# Portal Público (sem auth)
GET  /public/org/:slug
GET  /public/org/:slug/stats
GET  /public/org/:slug/campaigns
GET  /public/org/:slug/events
GET  /public/org/:slug/leaderboard

# + Volunteers, Campaigns, Donations, Events, Gamification, Members, Reports, Organization
```

---

## 🔧 Variáveis de Ambiente

```env
# backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voluntarios
JWT_SECRET=voluntarios-super-secret-jwt-2024
FRONTEND_URL=http://localhost:3000

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
BACKEND_URL=http://localhost:3001
```

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS 10, TypeScript, Passport JWT |
| ORM | Prisma 5 + PostgreSQL 15 |
| Frontend | Next.js 14 App Router, TypeScript |
| UI | Tailwind CSS 3, Lucide React |
| Charts | Recharts |
| Estado | Zustand |
| Deploy | Docker + Docker Compose |
