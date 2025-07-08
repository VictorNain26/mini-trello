# 🚀 Mini Trello

> Application Kanban moderne avec système de rôles granulaire, construite avec React 19, Node.js et PostgreSQL.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

## 🌐 Demo Live

**🔗 [Application déployée](https://web-production-b1e9.up.railway.app)**

## ✨ Fonctionnalités

### 📋 Gestion Kanban
- **Tableaux dynamiques** avec colonnes personnalisables
- **Drag & Drop** fluide pour cartes et colonnes  
- **Cartes détaillées** avec description, labels et dates d'échéance
- **Interface responsive** optimisée mobile et desktop

### 👥 Système de Rôles
- **Owner** : Contrôle total (suppression, invitations, gestion membres)
- **Editor** : Modification contenu (colonnes, cartes)
- **Reader** : Accès lecture seule

### 🔐 Sécurité
- Authentification Auth.js avec sessions sécurisées
- Permissions strictes front + backend
- Protection anti-auto-invitation
- Validation Zod côté serveur

## 🚀 Installation Rapide

### Prérequis
- Node.js >= 20
- pnpm >= 8  
- Docker (optionnel)

### Démarrage
```bash
# 1. Installation
git clone <repo-url>
cd mini-trello
pnpm install

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Base de données
pnpm docker:up       # Lance PostgreSQL
pnpm db migrate dev  # Applique migrations  
pnpm db seed         # Données de test

# 4. Lancement
pnpm dev            # API + Web en parallèle
```

**🎉 Application disponible :**
- Frontend : http://localhost:5173
- API : http://localhost:4000

## 📋 Scripts Utiles

```bash
# Développement
pnpm dev              # Démarre tout
pnpm build            # Build production
pnpm check            # Vérifications TypeScript
pnpm lint             # ESLint + Prettier

# Base de données  
pnpm db generate      # Client Prisma
pnpm db studio        # Interface admin
pnpm db seed          # Données de test

# Docker
pnpm docker:up        # Services dev
pnpm docker:down      # Arrêt services
```

## 🏗️ Architecture

### Stack Technique
- **Frontend**: React 19, TypeScript, TailwindCSS v4, @dnd-kit
- **Backend**: Node.js, Express, tRPC, Prisma ORM  
- **Base de données**: PostgreSQL avec Redis (sessions)
- **Déploiement**: Railway avec auto-deployment GitHub

### Structure du Projet
```
mini-trello/
├── apps/
│   ├── api/               # Backend Express + tRPC
│   │   ├── src/
│   │   │   ├── controllers/   # Logique métier
│   │   │   ├── routes/        # Organisation endpoints
│   │   │   ├── utils/         # Auth, permissions, validation
│   │   │   └── index.ts       # Serveur principal
│   │   └── prisma/
│   │       ├── schema.prisma  # Modèle données
│   │       └── migrations/    # Migrations DB
│   │
│   └── web/               # Frontend React
│       ├── src/
│       │   ├── components/    # Composants UI
│       │   ├── pages/         # Pages applicatives  
│       │   ├── hooks/         # Hooks personnalisés
│       │   └── lib/           # Utilitaires
│       └── railway.json
│
├── docker/               # Configuration Docker
└── CLAUDE.md            # Instructions développement
```

## 🔄 API Endpoints

### Boards
```typescript
GET    /api/boards                    // Liste des tableaux
POST   /api/boards                    // Créer tableau
GET    /api/boards/:id                // Détails tableau  
PUT    /api/boards/:id                // Modifier tableau
DELETE /api/boards/:id                // Supprimer tableau (owner only)

POST   /api/boards/:id/invite         // Inviter utilisateur (owner only)
GET    /api/boards/:id/members        // Liste membres
DELETE /api/boards/:id/members/:uid   // Retirer membre (owner only)
```

### Columns & Cards
```typescript
POST   /api/boards/:id/columns        // Créer colonne
PUT    /api/columns/:id               // Modifier colonne
DELETE /api/columns/:id               // Supprimer colonne
PUT    /api/columns/:id/move          // Déplacer colonne

POST   /api/columns/:id/cards         // Créer carte
PUT    /api/cards/:id                 // Modifier carte  
DELETE /api/cards/:id                 // Supprimer carte
PUT    /api/cards/:id/move            // Déplacer carte
```

## 🚀 Déploiement Railway

L'application est optimisée pour Railway :
- Auto-deployment depuis GitHub
- Services séparés (API + Web)
- PostgreSQL managed
- Variables d'environnement sécurisées

### Variables Requises
```env
# Production
DATABASE_URL=postgresql://...
AUTH_SECRET=your-32-character-secret
CLIENT_ORIGIN=https://your-web-domain.railway.app

# Développement  
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mini_trello
AUTH_SECRET=your-dev-secret
CLIENT_ORIGIN=http://localhost:5173
```

## 🧪 Qualité Code

### Standards
- ✅ TypeScript strict (zero `any`)
- ✅ ESLint zero warnings  
- ✅ Prettier formatage automatique
- ✅ Validation Zod serveur
- ✅ Architecture modulaire

### Commandes Qualité
```bash
pnpm check    # TypeScript
pnpm lint     # ESLint
pnpm format   # Prettier
```

## 🔮 Roadmap

### v1.0 (Actuel)
- ✅ Système de rôles complet
- ✅ Interface responsive
- ✅ Déploiement Railway
- ✅ Sécurité renforcée

### v2.0 (Prochaines)  
- 🔄 Collaboration temps réel (Socket.io)
- 🎨 Mode sombre et thèmes
- 📊 Analytics et métriques
- 🔍 Recherche avancée
- 📎 Attachements fichiers

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Instructions développement Claude Code
- **[API](apps/api/README.md)** - Documentation backend
- **[Frontend](apps/web/README.md)** - Documentation React

## 📄 Licence

MIT License

---

<div align="center">

**[🌐 Demo](https://web-production-b1e9.up.railway.app)** • **[🐛 Issues](https://github.com/VictorNain26/mini-trello/issues)**

*Code optimisé pour Claude Code - Architecture senior-level*

</div>