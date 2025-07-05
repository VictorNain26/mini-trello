# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./apps/web/
RUN pnpm install --frozen-lockfile --filter ./apps/web...
COPY apps/web ./apps/web
RUN pnpm --filter ./apps/web build

# ---- Runtime ----
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
