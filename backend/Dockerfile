FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl openssl-dev

FROM base AS deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN ./node_modules/.bin/nest build

FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
COPY package*.json ./
RUN chmod +x entrypoint.sh

EXPOSE 3001
CMD ["sh", "entrypoint.sh"]
