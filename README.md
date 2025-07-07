# 🚀 Mini Trello

> Une application Kanban moderne et collaborative inspirée de Trello, construite avec les dernières technologies web.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## ✨ Fonctionnalités

- 📋 **Tableaux Kanban** - Créez et organisez vos projets avec des colonnes personnalisables
- 🎯 **Cartes de tâches** - Drag & drop intuitif pour réorganiser les tâches
- 👥 **Collaboration temps réel** - Voyez qui travaille sur quoi en direct
- 🔐 **Authentification sécurisée** - Inscription/connexion avec Auth.js
- 📱 **Design responsive** - Interface moderne avec TailwindCSS v4
- ⚡ **Performance optimisée** - API tRPC type-safe et cache Redis

## 🏗️ Architecture

### Stack Technique

**Frontend**
- **React 19** - Framework UI avec les dernières fonctionnalités
- **TypeScript** - Typage statique pour un code robuste
- **Vite** - Build tool ultra-rapide
- **TailwindCSS v4** - Framework CSS utility-first
- **@dnd-kit** - Drag & drop accessible et performant
- **tRPC** - API type-safe de bout en bout
- **Zustand** - Gestion d'état légère et simple

**Backend**
- **Node.js** + **Express 5** - Serveur web moderne
- **tRPC** - API typée avec React Query
- **Prisma** - ORM moderne pour PostgreSQL
- **Auth.js** - Authentification flexible et sécurisée
- **Socket.io** - WebSocket pour les fonctionnalités temps réel
- **Redis** - Cache et sessions

**Infrastructure**
- **PostgreSQL** - Base de données relationnelle robuste
- **Docker** - Containerisation pour le déploiement
- **Turbo** - Monorepo build system
- **pnpm** - Gestionnaire de paquets performant

### Structure du Projet

```
mini-trello/
├── apps/
│   ├── api/                 # Backend Express + tRPC
│   │   ├── src/
│   │   │   ├── routers/     # Routes tRPC
│   │   │   ├── middleware/  # Auth, erreurs, etc.
│   │   │   ├── realtime/    # WebSocket handlers
│   │   │   └── auth.ts      # Configuration Auth.js
│   │   └── prisma/          # Schéma et migrations DB
│   └── web/                 # Frontend React
│       ├── src/
│       │   ├── components/  # Composants réutilisables
│       │   ├── features/    # Fonctionnalités métier
│       │   ├── pages/       # Pages de l'application
│       │   └── providers/   # Contextes React
├── packages/
│   ├── ui/                  # Composants UI partagés
│   ├── db/                  # Client Prisma partagé
│   └── config/              # Configurations partagées
└── docker/                  # Configuration Docker
```

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** >= 20
- **pnpm** >= 8
- **Docker** (optionnel, pour la base de données)

### Installation

```bash
# Cloner le repository
git clone <votre-repo-url>
cd mini-trello

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

### Configuration

Créez un fichier `.env` à la racine :

```env
# Base de données
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mini_trello

# Authentification (générer une clé secrète de 32 caractères)
AUTH_SECRET=your-32-character-secret-key-here

# Frontend
CLIENT_ORIGIN=http://localhost:5173
```

### Démarrage en Développement

```bash
# 1. Démarrer les services (PostgreSQL + Redis)
docker compose -f docker-compose.dev.yml up -d

# 2. Appliquer les migrations de base de données
pnpm db migrate dev

# 3. (Optionnel) Alimenter la base avec des données de test
pnpm db seed

# 4. Démarrer les serveurs de développement
pnpm dev
```

🎉 **L'application est maintenant disponible :**
- **Frontend :** http://localhost:5173
- **API :** http://localhost:4000
- **Base de données :** localhost:5432

## 📋 Scripts Disponibles

### Scripts Principaux

```bash
pnpm dev              # Démarre API + Web en mode développement
pnpm build            # Build toutes les applications
pnpm start            # Lance l'environnement Docker complet
pnpm lint             # Vérifie la qualité du code
pnpm check            # Vérification TypeScript
```

### Scripts Base de Données

```bash
pnpm db generate      # Génère le client Prisma
pnpm db migrate dev   # Crée et applique une migration
pnpm db migrate deploy # Applique les migrations (production)
pnpm db studio        # Interface admin Prisma
pnpm db seed          # Alimente avec des données de test
```

### Scripts Docker

```bash
pnpm docker:up        # Lance l'environnement complet
pnpm docker:down      # Arrête les conteneurs
```

## 🐳 Déploiement avec Docker

### Développement

```bash
# Services uniquement (recommandé pour le dev)
docker compose -f docker-compose.dev.yml up -d
```

### Production

```bash
# Application complète
docker compose -f docker/docker-compose.yml up --build -d
```

## 🗄️ Base de Données

### Schéma

- **User** - Utilisateurs avec authentification
- **Board** - Tableaux Kanban avec propriétaire
- **Column** - Colonnes ordonnées par tableau
- **Card** - Cartes de tâches ordonnées par colonne

### Migrations

```bash
# Créer une nouvelle migration
pnpm db migrate dev --name description-de-la-migration

# Appliquer en production
pnpm db migrate deploy
```

## 🔧 Fonctionnalités Temps Réel

L'application utilise **Socket.io** pour :

- 👥 **Présence utilisateur** - Voir qui est en ligne sur un tableau
- 🔄 **Synchronisation** - Mise à jour en temps réel des modifications
- 🎯 **Curseurs collaboratifs** - Position des autres utilisateurs

## 🎨 Interface Utilisateur

### Design System

- **TailwindCSS v4** - Styles utilitaires modernes
- **Responsive design** - Mobile-first
- **Dark mode ready** - Support thème sombre
- **Accessibilité** - Navigation clavier et lecteurs d'écran

### Animations

- **Framer Motion** - Animations fluides
- **@dnd-kit** - Drag & drop accessible
- **Micro-interactions** - Feedback utilisateur

## 🔒 Sécurité

- ✅ **Auth.js** - Authentification sécurisée
- ✅ **bcrypt** - Hashage des mots de passe
- ✅ **CORS** - Protection cross-origin
- ✅ **Rate limiting** - Protection anti-spam
- ✅ **Validation** - Zod pour la validation des données
- ✅ **Types safety** - TypeScript de bout en bout

## 🚀 Performance

- ⚡ **tRPC** - API typée sans surcharge
- ⚡ **React Query** - Cache intelligent côté client
- ⚡ **Redis** - Cache serveur et sessions
- ⚡ **Prisma** - ORM optimisé avec connexion pooling
- ⚡ **Vite** - Build ultra-rapide
- ⚡ **Code splitting** - Chargement à la demande

## 📚 Documentation

### Développement

- [Architecture détaillée](docs/architecture.md)
- [Guide de contribution](docs/contributing.md)
- [API Reference](docs/api.md)

### Déploiement

- [Guide de déploiement](docs/deployment.md)
- [Configuration production](docs/production.md)
- [Monitoring](docs/monitoring.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. **Commit** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Standards de Code

- ✅ **TypeScript strict** activé
- ✅ **ESLint** configuré
- ✅ **Prettier** pour le formatage
- ✅ **Tests** requis pour les nouvelles fonctionnalités
- ✅ **Documentation** mise à jour

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 👥 Équipe

- **Développeur Principal** - [Votre nom](https://github.com/votre-username)

## 🙏 Remerciements

- [Trello](https://trello.com) pour l'inspiration
- [Vercel](https://vercel.com) pour les outils de développement
- [Prisma](https://prisma.io) pour l'excellent ORM
- [Tailwind](https://tailwindcss.com) pour le framework CSS

---

<div align="center">

**[🌐 Demo Live](https://votre-demo-url.com)** • **[📖 Documentation](https://docs.votre-app.com)** • **[🐛 Signaler un Bug](https://github.com/votre-username/mini-trello/issues)**

Fait avec ❤️ et beaucoup de ☕

</div>