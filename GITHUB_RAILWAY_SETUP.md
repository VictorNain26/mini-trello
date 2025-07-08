# 🔗 Configuration GitHub → Railway

## ✅ Étapes Réalisées

1. **✅ Code pushé vers GitHub**
   - Repository : https://github.com/VictorNain26/mini-trello
   - Commit : `49b93c2` - Complete role-based permission system
   - Toutes les nouvelles fonctionnalités intégrées

2. **✅ Railway CLI configuré**
   - Projet : MiniTrello (ID: 509ef67f-8a16-4b0f-a1d9-370f77456538)
   - Services : API + Web déployés
   - Domaines : api-production-e29c.up.railway.app + web-production-b1e9.up.railway.app

## 🚧 Configuration GitHub Integration (Manuel)

### Étape 1 : Accéder au Dashboard Railway
```
https://railway.app/project/509ef67f-8a16-4b0f-a1d9-370f77456538
```

### Étape 2 : Connecter GitHub Repository

**Pour le service API :**
1. Aller dans le service `api`
2. Settings → Source
3. Connect GitHub Repository
4. Sélectionner : `VictorNain26/mini-trello`
5. Root Directory : `apps/api`
6. Branch : `main`

**Pour le service Web :**
1. Aller dans le service `web`
2. Settings → Source
3. Connect GitHub Repository  
4. Sélectionner : `VictorNain26/mini-trello`
5. Root Directory : `apps/web`
6. Branch : `main`

### Étape 3 : Configurer Auto-Deploy
1. Dans chaque service : Settings → Deploys
2. Activer : "Auto-deploy on push to main"
3. Build Command sera automatiquement détecté via `railway.json`

### Étape 4 : Variables d'Environnement

**API Service :**
```bash
# Via Railway Dashboard ou CLI
NODE_ENV=production
AUTH_SECRET=[générer avec: openssl rand -base64 32]
CLIENT_ORIGIN=https://web-production-b1e9.up.railway.app
DATABASE_URL=[Railway PostgreSQL URL]
REDIS_URL=[Railway Redis URL]
PORT=4000
```

**Web Service :**
```bash
VITE_API_URL=https://api-production-e29c.up.railway.app
```

### Étape 5 : Ajouter Bases de Données

**PostgreSQL :**
1. Dashboard → Add Service → Database → PostgreSQL
2. Copier DATABASE_URL vers API service

**Redis :**
1. Dashboard → Add Service → Database → Redis
2. Copier REDIS_URL vers API service

## 🔧 Scripts de Configuration

### Script automatique (déjà créé)
```bash
./railway-vars.sh
```

### Verification des services
```bash
railway service api && railway variables
railway service web && railway variables
```

## 📋 Checklist Final

- [x] Code pushé vers GitHub
- [ ] GitHub repository connecté à Railway
- [ ] Auto-deploy configuré
- [ ] PostgreSQL ajouté et configuré
- [ ] Redis ajouté et configuré
- [ ] Variables d'environnement définies
- [ ] Test de déploiement automatique
- [ ] Migration base de données en production

## 🌐 URLs Finales

Une fois configuré :
- **App Live** : https://web-production-b1e9.up.railway.app
- **API** : https://api-production-e29c.up.railway.app
- **Dashboard** : https://railway.app/project/509ef67f-8a16-4b0f-a1d9-370f77456538

## 🚀 Test Auto-Deploy

Après configuration, tester avec :
```bash
# Faire un petit changement
echo "// Auto-deploy test" >> apps/web/src/App.tsx
git add . && git commit -m "test: auto-deploy verification"
git push origin main

# Vérifier dans Railway Dashboard que le déploiement se lance
```