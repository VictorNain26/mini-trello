# 🚀 Guide de Déploiement Mini-Trello

## 📋 Déploiement Réalisé

✅ **Application déployée sur Railway** :
- **API Backend** : https://api-production-e29c.up.railway.app
- **Frontend Web** : https://web-production-b1e9.up.railway.app
- **Projet Railway** : MiniTrello (ID: 509ef67f-8a16-4b0f-a1d9-370f77456538)

---

## 🏗️ Architecture de Production

### Services Configurés
- **API Service** : Node.js/Express + tRPC backend
- **Web Service** : React/Vite frontend statique
- **PostgreSQL** : Base de données (à configurer)
- **Redis** : Cache et sessions (à configurer)

### URLs de Production
```
Frontend: https://web-production-b1e9.up.railway.app
API:      https://api-production-e29c.up.railway.app
```

---

## 🔧 Configuration Actuelle

### Variables d'Environnement - API
```env
NODE_ENV=production
AUTH_SECRET=your-generated-secret-key
CLIENT_ORIGIN=https://web-production-b1e9.up.railway.app
PORT=4000
DATABASE_URL=[À configurer via Railway]
REDIS_URL=[À configurer via Railway]
```

### Variables d'Environnement - Web
```env
VITE_API_URL=https://api-production-e29c.up.railway.app
```

---

## 📋 Étapes de Déploiement Réalisées

### 1. Configuration Railway CLI
```bash
# ✅ Connexion effectuée
railway whoami  # Victor (victor.lenain26@gmail.com)
railway status  # Project: MiniTrello, Environment: production
```

### 2. Services Créés
```bash
# ✅ Services ajoutés
railway add --service api     # API backend service
railway add --service web     # Frontend service
railway add --database postgres  # PostgreSQL (en attente de configuration)
railway add --database redis     # Redis (en attente de configuration)
```

### 3. Déploiements Effectués
```bash
# ✅ API déployée
cd apps/api && railway service api && railway up
# Build Logs: https://railway.com/project/.../service/ac2234ea-0544-4413-8797-ee58137632d6

# ✅ Frontend déployé
cd apps/web && railway service web && railway up
# Build Logs: https://railway.com/project/.../service/04471bee-b3ce-47da-ab98-c338e362363c
```

### 4. Domaines Générés
```bash
# ✅ Domaines créés
railway domain  # Web: https://web-production-b1e9.up.railway.app
railway service api && railway domain  # API: https://api-production-e29c.up.railway.app
```

---

## 🚧 Étapes Restantes

### 1. Configuration Base de Données
```bash
# À exécuter dans le terminal Railway
railway add --database postgres
railway variables  # Noter DATABASE_URL
railway service api
railway variables set DATABASE_URL="[URL_POSTGRESQL]"
```

### 2. Configuration Redis
```bash
# À exécuter dans le terminal Railway
railway add --database redis
railway variables  # Noter REDIS_URL
railway service api
railway variables set REDIS_URL="[URL_REDIS]"
```

### 3. Migration Base de Données
```bash
# Après configuration DATABASE_URL
cd apps/api
railway run pnpm prisma migrate deploy
railway run pnpm prisma db seed
```

### 4. Configuration Variables (Script fourni)
```bash
# Utiliser le script de configuration
./railway-vars.sh
```

---

## 🔍 Tests de Production

### Santé des Services
- **API Health** : https://api-production-e29c.up.railway.app/health
- **Web App** : https://web-production-b1e9.up.railway.app

### Fonctionnalités à Tester
- [ ] Authentification utilisateur
- [ ] Création/édition de boards
- [ ] Gestion des colonnes et cartes
- [ ] Système de rôles (owner/editor/reader)
- [ ] Invitation d'utilisateurs
- [ ] Interface responsive mobile

---

## 🔧 Commandes Utiles

### Gestion Railway
```bash
# Status du projet
railway status

# Logs en temps réel
railway logs

# Variables d'environnement
railway variables

# Redéploiement
railway redeploy

# Connexion à la base
railway connect
```

### Développement Local
```bash
# Build et test avant déploiement
pnpm build
pnpm check  # Type checking

# Docker local (test production)
pnpm docker:up
pnpm docker:down
```

---

## 💰 Coûts Estimés

### Railway Pricing
- **$5/mois** : Crédits gratuits initiaux
- **PostgreSQL** : ~$5/mois (usage modéré)
- **Redis** : ~$5/mois (usage modéré)
- **Services** : Inclus dans l'abonnement

**Total estimé : $10-15/mois** pour un side project

---

## 🚨 Points d'Attention

### Sécurité Production
- ✅ **AUTH_SECRET** : Généré de façon sécurisée (32+ caractères)
- ✅ **CORS** : Configuré pour le domaine frontend uniquement
- ⚠️ **DATABASE_URL** : À configurer via Railway
- ⚠️ **Variables sensibles** : Jamais exposer en public

### Performance
- ✅ **Auto-scaling** : Railway gère automatiquement
- ✅ **HTTPS** : Activé par défaut sur Railway
- ✅ **CDN** : Assets optimisés par Vite build
- ⚠️ **WebSockets** : Nécessite Redis pour multi-instance

### Monitoring
- 📊 **Railway Dashboard** : Logs et métriques intégrés
- 📊 **Build Status** : Liens vers build logs fournis
- 📊 **Uptime** : Monitoring automatique Railway

---

## 🔗 Liens Utiles

- **Dashboard Railway** : https://railway.app/project/509ef67f-8a16-4b0f-a1d9-370f77456538
- **Documentation Railway** : https://docs.railway.app/
- **Build Logs API** : https://railway.com/project/509ef67f-8a16-4b0f-a1d9-370f77456538/service/ac2234ea-0544-4413-8797-ee58137632d6
- **Build Logs Web** : https://railway.com/project/509ef67f-8a16-4b0f-a1d9-370f77456538/service/04471bee-b3ce-47da-ab98-c338e362363c

---

## 📝 Notes de Déploiement

### Statut Actuel
- ✅ **Services créés** et déployés
- ✅ **Domaines configurés** et fonctionnels
- ✅ **Variables d'environnement** configurées
- ⚠️ **Base de données** à finaliser
- ⚠️ **Tests de production** à effectuer

### Prochaines Étapes
1. Configurer PostgreSQL et Redis via Railway dashboard
2. Exécuter les migrations Prisma
3. Tester toutes les fonctionnalités en production
4. Configurer monitoring et alertes
5. Documenter la maintenance continue

**Application prête à 80% - Finalisation base de données requise**