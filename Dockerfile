# Dockerfile multi-stage pour API + Web

# ── 1) Etape de build ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

# Compile l'API (filter "api") et le front (filter "web")
RUN pnpm --filter api build
RUN pnpm --filter @mini-trello/web build

# ── 2) Image finale pour l’API ────────────────────────────────────
FROM node:20-alpine AS api
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]

# ── 3) Image finale pour le front ─────────────────────────────────
FROM nginx:alpine AS web
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
