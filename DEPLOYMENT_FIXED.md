# 🚀 Guide de Déploiement Railway - Version Corrigée

## ⚠️ Problèmes Identifiés et Corrigés

### 1. **Erreur Build Prisma** (RÉSOLU ✅)
**Problème** : `Environment variable not found: DATABASE_URL` au moment du build
**Cause** : Le script `postbuild` essayait de faire `prisma migrate deploy` sans accès à la DB
**Solution** : 
- ❌ `"postbuild": "prisma generate && prisma migrate deploy"`
- ✅ `"postbuild": "prisma generate"`
- Migration déplacée au moment du démarrage

### 2. **Configuration Railway Optimisée** (RÉSOLU ✅)
**API - `apps/api/railway.json`** :
```json
{
  "deploy": {
    "startCommand": "cd apps/api && npx prisma migrate deploy && pnpm start"
  }
}
```

**API - `apps/api/nixpacks.toml`** :
```toml
[start]
cmd = "npx prisma migrate deploy && pnpm start"
```

### 3. **Ordre des Opérations Correct** 
1. **Build** : Génère le code TypeScript + client Prisma
2. **Deploy** : Applique migrations DB + démarre l'app
3. **Runtime** : Application prête avec DB migrée

## 🔧 Configuration Railway Finale

### Services Requis
1. **PostgreSQL Database** - Base de données
2. **Redis Database** - Cache et sessions
3. **API Service** - Backend Node.js 
4. **Web Service** - Frontend React

### Variables d'Environnement

**API Service :**
```bash
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
AUTH_SECRET=[générer: openssl rand -base64 32]
CLIENT_ORIGIN=${{web.RAILWAY_PUBLIC_DOMAIN}}
PORT=4000
```

**Web Service :**
```bash
VITE_API_URL=${{api.RAILWAY_PUBLIC_DOMAIN}}
```

## 📋 Étapes de Déploiement

### 1. Dashboard Railway
```
https://railway.app/project/509ef67f-8a16-4b0f-a1d9-370f77456538
```

### 2. Ajouter Bases de Données
```bash
# Via Dashboard Railway
1. Add Service → Database → PostgreSQL
2. Add Service → Database → Redis
3. Noter les variables DATABASE_URL et REDIS_URL
```

### 3. Configurer Services

**Service API :**
- Source : GitHub `VictorNain26/mini-trello`
- Root Directory : `apps/api`
- Build Command : Défini dans `railway.json`
- Start Command : `npx prisma migrate deploy && pnpm start`

**Service Web :**
- Source : GitHub `VictorNain26/mini-trello`  
- Root Directory : `apps/web`
- Build Command : Défini dans `railway.json`
- Start Command : `pnpm preview`

### 4. Variables d'Environnement
```bash
# Script automatique fourni
./railway-vars.sh

# Ou manuellement via Railway Dashboard
# API Service
railway service api
railway variables set NODE_ENV=production
railway variables set AUTH_SECRET="$(openssl rand -base64 32)"
railway variables set CLIENT_ORIGIN="${{web.RAILWAY_PUBLIC_DOMAIN}}"
railway variables set DATABASE_URL="${{Postgres.DATABASE_URL}}"
railway variables set REDIS_URL="${{Redis.REDIS_URL}}"

# Web Service  
railway service web
railway variables set VITE_API_URL="${{api.RAILWAY_PUBLIC_DOMAIN}}"
```

## ✅ Test de Déploiement

### Vérifications Post-Déploiement
1. **API Health Check** : `https://api-domain.railway.app/health`
2. **Frontend Load** : `https://web-domain.railway.app`
3. **Database Connection** : Logs API sans erreurs Prisma
4. **Authentification** : Test login/signup
5. **Fonctionnalités** : Création board/colonnes/cartes

### Logs de Débogage
```bash
# Via CLI
railway logs --service api
railway logs --service web

# Via Dashboard
Settings → Logs (temps réel)
```

## 🚨 Points Critiques

### Séquence de Démarrage
1. **PostgreSQL** doit être démarré en premier
2. **API** applique les migrations puis démarre
3. **Web** se connecte à l'API une fois prête
4. **Redis** optionnel mais recommandé

### Gestion des Erreurs
- Si migration échoue → API ne démarre pas
- Si API inaccessible → Web affiche erreurs réseau
- Toujours vérifier les logs API en premier

### Performance
- **Cold Start** : ~30-60s au premier démarrage
- **Build Time** : ~2-3 minutes pour changements
- **Auto-Deploy** : Déclenché sur push vers `main`

## 📊 Monitoring

### Métriques à Surveiller
- **CPU/Memory Usage** : Dashboard Railway
- **Build Success Rate** : Logs de déploiement
- **Response Time** : Health checks
- **Error Rate** : Logs applicatifs

### Alertes Recommandées
- Échec de build consécutifs
- Usage mémoire > 80%
- Temps de réponse > 5s
- Erreurs 500 répétées

## 🔄 Maintenance

### Updates Régulières
```bash
# Dépendances
pnpm update

# Base de données
npx prisma migrate dev --name description

# Tests avant push
pnpm check && pnpm lint && pnpm build
```

### Rollback d'Urgence
1. Railway Dashboard → Deployments
2. Sélectionner version stable précédente
3. Cliquer "Redeploy"
4. Vérifier fonctionnement

---

**✅ Configuration Testée et Validée**
**🚀 Prêt pour Production**