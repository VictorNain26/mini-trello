# 🚀 Mini Trello

> Application Kanban collaborative et moderne avec système de rôles avancé, construite avec React, Node.js et PostgreSQL.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=for-the-badge&logo=trpc&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

## 🌐 Application Déployée

**🔗 [Demo Live](https://web-production-b1e9.up.railway.app)**

- **Frontend :** https://web-production-b1e9.up.railway.app
- **API :** https://api-production-e29c.up.railway.app

## ✨ Fonctionnalités

### 📋 Gestion de Projets
- **Tableaux Kanban** - Créez et organisez vos projets avec des colonnes personnalisables
- **Drag & Drop** - Interface intuitive avec @dnd-kit pour réorganiser cartes et colonnes
- **Colonnes flexibles** - Taille automatique selon le contenu avec indicateurs de défilement
- **Cartes détaillées** - Modal d'édition avec support markdown

### 👥 Collaboration Avancée
- **Système de rôles granulaire** :
  - **Propriétaire** - Contrôle total du tableau
  - **Éditeur** - Peut modifier colonnes et cartes
  - **Lecteur** - Accès en lecture seule
- **Invitations utilisateur** - Invitez par email avec rôle spécifique
- **Protection anti-auto-invitation** - Sécurité renforcée
- **Temps réel** - Collaboration live avec Socket.io *(à venir)*

### 🔐 Authentification & Sécurité
- **Auth.js** - Système d'authentification robuste
- **Sessions sécurisées** - Gestion d'état avec cookies httpOnly
- **Protection CSRF** - Tokens anti-forgery
- **Permissions strictes** - Vérifications côté frontend et backend

### 📱 Interface Moderne
- **Design responsive** - Mobile-first avec TailwindCSS v4
- **UX optimisée** - Pages login/signup horizontales sur desktop
- **Indicateurs visuels** - États de chargement sans clignotement
- **Accessibilité** - Navigation clavier et ARIA

## 🏗️ Architecture Technique

### Stack Frontend
- **React 19** - Dernières fonctionnalités React
- **TypeScript** - Typage statique strict
- **Vite** - Build tool ultra-rapide
- **TailwindCSS v4** - Framework CSS moderne
- **tRPC** - API type-safe de bout en bout
- **@dnd-kit** - Drag & drop accessible
- **Zustand** - Gestion d'état simple

### Stack Backend
- **Node.js + Express** - Serveur web avec middleware custom
- **tRPC** - API typée avec validation Zod
- **Prisma ORM** - Base de données avec migrations
- **Auth.js** - Authentification multi-providers
- **PostgreSQL** - Base de données relationnelle
- **Redis** - Cache et sessions *(prévu)*

### Infrastructure
- **Railway** - Plateforme de déploiement
- **Monorepo** - Architecture avec Turbo
- **pnpm** - Gestionnaire de paquets performant
- **Docker** - Containerisation pour développement

## 🚀 Installation Rapide

### Prérequis
- Node.js >= 20
- pnpm >= 8
- Docker (optionnel)

### Démarrage Local

```bash
# 1. Cloner et installer
git clone <votre-repo>
cd mini-trello
pnpm install

# 2. Configuration environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Base de données
pnpm docker:up          # Lance PostgreSQL + Redis
pnpm db migrate dev     # Applique migrations
pnpm db seed           # Données de test (optionnel)

# 4. Démarrage
pnpm dev               # API + Web en parallèle
```

**🎉 Application disponible sur :**
- Frontend : http://localhost:5173
- API : http://localhost:4000

## 📋 Scripts Disponibles

### Développement
```bash
pnpm dev              # Démarre API + Web
pnpm build            # Build production
pnpm check            # Vérifications TypeScript
pnpm lint             # ESLint + Prettier
pnpm format           # Formatage automatique
```

### Base de Données
```bash
pnpm db generate      # Génère client Prisma
pnpm db migrate dev   # Migration développement
pnpm db studio        # Interface admin
pnpm db seed          # Données de test
```

### Docker
```bash
pnpm docker:up        # Services de développement
pnpm docker:down      # Arrêt des services
```

## 🗂️ Structure du Projet

```
mini-trello/
├── apps/
│   ├── api/                    # Backend Express + tRPC
│   │   ├── src/
│   │   │   ├── routers/        # Routes tRPC (board, card, etc.)
│   │   │   ├── middleware/     # Auth et gestion erreurs
│   │   │   ├── config/         # Configuration Auth.js
│   │   │   └── index.ts        # Serveur principal
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Modèle de données
│   │   │   ├── migrations/     # Migrations DB
│   │   │   └── seed.ts         # Données de test
│   │   └── railway.json        # Config déploiement
│   │
│   └── web/                    # Frontend React
│       ├── src/
│       │   ├── components/     # Composants UI
│       │   │   ├── DraggableColumn.tsx
│       │   │   ├── DraggableCard.tsx
│       │   │   ├── InviteModal.tsx
│       │   │   └── RequireAuth.tsx
│       │   ├── pages/          # Pages applicatives
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Board.tsx
│       │   │   ├── Login.tsx
│       │   │   └── Signup.tsx
│       │   ├── hooks/          # Hooks custom
│       │   │   └── useAuth.ts
│       │   └── lib/            # Utilitaires
│       │       └── trpc.ts
│       └── railway.json
│
├── docker/                     # Configuration Docker
├── DEPLOYMENT.md              # Guide de déploiement
├── CLAUDE.md                  # Instructions développement
└── railway-vars.sh           # Script config Railway
```

## 🎯 Fonctionnalités Principales

### Gestion des Tableaux
- **Création/édition** de tableaux Kanban
- **Colonnes dynamiques** avec ordre personnalisable
- **Cartes avec métadonnées** et modal d'édition
- **Drag & drop** fluide et accessible

### Système de Permissions
```typescript
// Rôles disponibles
type Role = 'owner' | 'editor' | 'reader'

// Permissions par rôle
owner   -> Tout (suppression tableau, gestion membres)
editor  -> Modification contenu (colonnes, cartes)
reader  -> Lecture seule (visualisation uniquement)
```

### Sécurité Renforcée
- ✅ **Auto-invitation bloquée** - Impossible de s'inviter soi-même
- ✅ **Permissions strictes** - Vérifications frontend + backend
- ✅ **API sécurisée** - Tous endpoints protégés par rôles
- ✅ **Validation données** - Zod côté serveur

## 🔄 API tRPC

### Endpoints Principaux

```typescript
// Boards
board.getAll()                    // Liste tableaux utilisateur
board.getById(id)                 // Détails tableau + membres
board.create(data)                // Nouveau tableau
board.inviteUser(boardId, email, role)  // Invitation membre

// Columns
column.create(boardId, title)     // Nouvelle colonne
column.update(id, title)          // Modification colonne
column.delete(id)                 // Suppression (owner/editor)

// Cards
card.create(columnId, title)      // Nouvelle carte
card.update(id, data)             // Modification carte
card.delete(id)                   // Suppression (owner/editor)
card.move(id, columnId, order)    // Déplacement drag&drop
```

## 🚀 Déploiement Production

### Railway (Recommandé)
L'application est configurée pour Railway avec :
- **Auto-deployment** depuis GitHub
- **Services séparés** API + Web
- **Base de données** PostgreSQL managed
- **Variables d'environnement** sécurisées

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour le guide complet.

### Variables d'Environnement

```env
# Production (Railway)
NODE_ENV=production
DATABASE_URL=postgresql://...
AUTH_SECRET=your-32-character-secret-key
CLIENT_ORIGIN=https://web-production-b1e9.up.railway.app

# Développement local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mini_trello
AUTH_SECRET=your-32-character-secret-key
CLIENT_ORIGIN=http://localhost:5173
```

## 🧪 Tests et Qualité

### Standards Appliqués
- ✅ **TypeScript strict** - Zero any, typage complet
- ✅ **ESLint configuré** - Règles strictes
- ✅ **Prettier** - Formatage automatique
- ✅ **Import organization** - Imports triés automatiquement

### Commandes Qualité
```bash
pnpm check            # Vérification TypeScript
pnpm lint             # ESLint tous fichiers
pnpm format           # Prettier format
```

## 📚 Documentation

- **[Guide Déploiement](DEPLOYMENT.md)** - Railway setup complet
- **[Instructions Claude](CLAUDE.md)** - Guide développement IA
- **[Architecture API](apps/api/README.md)** - Documentation backend
- **[Frontend Guide](apps/web/README.md)** - Documentation React

## 🛠️ Contribution

### Standards de Code
1. **TypeScript strict** obligatoire
2. **Pas de `any`** - Typage explicite
3. **ESLint zero warnings** - Qualité code
4. **Tests unitaires** pour nouvelles fonctionnalités
5. **Documentation** mise à jour

### Process de Contribution
```bash
# 1. Fork du projet
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développement
pnpm check     # Vérifications TypeScript
pnpm lint      # Qualité code

# 3. Commit et PR
git commit -m "feat: description"
git push origin feature/nouvelle-fonctionnalite
```

## 🔮 Roadmap

### Version Actuelle (v1.0)
- ✅ Système de rôles complet
- ✅ Interface responsive
- ✅ Déploiement Railway
- ✅ Sécurité renforcée

### Prochaines Versions
- 🔄 **Socket.io temps réel** - Collaboration live
- 📊 **Analytics** - Métriques utilisation
- 🎨 **Thèmes** - Mode sombre et customisation
- 🔍 **Recherche** - Filtrage avancé tableaux/cartes
- 📎 **Attachements** - Upload fichiers cartes
- 🔔 **Notifications** - Alertes temps réel

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour détails

## 🤝 Crédits

- **Inspiration :** [Trello](https://trello.com) pour l'UX Kanban
- **Stack :** [T3 Stack](https://create.t3.gg/) pour l'architecture
- **Design :** [TailwindUI](https://tailwindui.com/) pour les composants

---

<div align="center">

**[🌐 Demo Live](https://web-production-b1e9.up.railway.app)** • **[📖 Déploiement](DEPLOYMENT.md)** • **[🐛 Issues](https://github.com/VictorNain26/mini-trello/issues)**

*Développé avec ❤️ et optimisé pour Claude Code*

</div>