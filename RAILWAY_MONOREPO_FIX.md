# 🔧 Railway Monorepo Configuration - Fix

## ❌ Problème Initial

**Erreur :** `/apps/web/package.json": not found`
**Cause :** Railway essayait de copier des fichiers dans un contexte Docker inexistant

## ✅ Solution Appliquée

### 1. **Configuration Railway Simplifiée**

**API - `apps/api/railway.json`** :
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/index.js"
  }
}
```

**Web - `apps/web/railway.json`** :
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm preview"
  }
}
```

### 2. **Nixpacks pour Monorepo**

**Root - `nixpacks.toml`** (build global) :
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["pnpm build"]
```

**Web - `apps/web/nixpacks.toml`** (build spécifique) :
```toml
[phases.install]
cmds = ["cd ../.. && pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["cd ../.. && pnpm --filter @mini-trello/web build"]

[start]
cmd = "pnpm preview"
```

**API - `apps/api/nixpacks.toml`** (déjà configuré) :
```toml
[phases.install]
cmds = ["cd ../.. && pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["cd ../.. && pnpm --filter api build"]

[start]
cmd = "npx prisma migrate deploy && pnpm start"
```

## 🎯 Configuration Railway Recommandée

### Étape 1 : Source Repository
- **Repository** : `VictorNain26/mini-trello`
- **Branch** : `main`
- **Root Directory** : 
  - API Service : `apps/api`
  - Web Service : `apps/web`

### Étape 2 : Build Settings
- **Builder** : Nixpacks (auto-détecté)
- **Build Command** : Auto (détecté via nixpacks.toml)
- **Install Command** : Auto (détecté via nixpacks.toml)

### Étape 3 : Deploy Settings
- **Start Command** : Défini dans railway.json
- **Port** : Auto-détecté (4000 pour API, 3000 pour Web)

## 🔄 Ordre des Opérations

### Build Phase
1. **Setup** : Install Node.js 20 + pnpm
2. **Install** : `cd ../.. && pnpm install --frozen-lockfile`
3. **Build** : `cd ../.. && pnpm --filter [service] build`

### Deploy Phase
1. **API** : `npx prisma migrate deploy && node dist/index.js`
2. **Web** : `pnpm preview`

## 🚨 Points Critiques

### Configuration Monorepo
- ✅ Build depuis la racine (`cd ../..`)
- ✅ Utilisation des filtres pnpm (`--filter`)
- ✅ Installation des dépendances globales
- ✅ Nixpacks.toml spécifique par service

### Variables d'Environnement
```bash
# API Service
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
AUTH_SECRET=[généré]
CLIENT_ORIGIN=${{web.RAILWAY_PUBLIC_DOMAIN}}

# Web Service  
VITE_API_URL=${{api.RAILWAY_PUBLIC_DOMAIN}}
```

### Services Requis
1. **PostgreSQL Database**
2. **Redis Database** 
3. **API Service** (apps/api)
4. **Web Service** (apps/web)

## ✅ Test de Validation

### Build Local (doit passer)
```bash
# Simulation Railway build
cd /tmp && git clone [repo]
cd mini-trello
pnpm install --frozen-lockfile
pnpm --filter api build
pnpm --filter @mini-trello/web build
```

### Deploy Local (doit passer)
```bash
# API
cd apps/api
npx prisma migrate deploy  # avec DATABASE_URL
node dist/index.js

# Web  
cd apps/web
pnpm preview
```

## 🔧 Troubleshooting

### Si build échoue encore
1. **Vérifier logs Railway** : Builder phase
2. **Valider pnpm-workspace.yaml** 
3. **Tester build local** identique
4. **Vérifier variables d'env** au build

### Si deploy échoue
1. **Vérifier DATABASE_URL** disponible
2. **Valider migrations Prisma**
3. **Tester start command** en local
4. **Vérifier port binding**

---

**✅ Configuration Optimisée pour Monorepo Railway**