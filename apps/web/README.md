# 🎨 Mini Trello - Frontend React

> Interface moderne construite avec React 19, TypeScript, TailwindCSS v4 et @dnd-kit pour une expérience utilisateur fluide.

## 🏗️ Architecture Frontend

### Structure Modulaire
```
src/
├── components/           # Composants UI réutilisables
│   ├── DraggableCard.tsx     # Carte avec drag & drop
│   ├── DraggableColumn.tsx   # Colonne avec drag & drop
│   ├── CardModal.tsx         # Modal édition carte
│   ├── InviteModal.tsx       # Modal invitation
│   ├── RequireAuth.tsx       # Protection routes
│   └── ui/                   # Composants base
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
│
├── pages/               # Pages principales
│   ├── Dashboard.tsx        # Liste des boards
│   ├── Board.tsx           # Vue board avec Kanban
│   ├── Login.tsx           # Authentification
│   └── Signup.tsx          # Inscription
│
├── hooks/               # Hooks personnalisés
│   ├── useAuth.ts          # Gestion authentification
│   ├── useBoard.ts         # État et actions board
│   ├── useBoardActions.ts  # Actions CRUD
│   └── useDragAndDrop.ts   # Logique drag & drop
│
├── lib/                # Utilitaires
│   ├── trpc.ts            # Client tRPC
│   └── utils.ts           # Helpers
│
└── types/              # Types TypeScript
    └── api.ts             # Types API
```

## ✨ Fonctionnalités

### 📋 Interface Kanban
- **Drag & Drop** fluide avec @dnd-kit
- **Colonnes redimensionnables** automatiquement
- **Cartes interactives** avec modal d'édition
- **Indicateurs de défilement** pour grandes boards

### 👥 Collaboration
- **Système de rôles** visuel (owner/editor/reader)
- **Invitations en temps réel** avec modal dédiée
- **Gestion des membres** pour owners
- **Permissions strictes** côté interface

### 🎨 Design Moderne
- **TailwindCSS v4** avec utility-first
- **Interface responsive** mobile-first
- **Animations fluides** avec transitions CSS
- **États de chargement** sans clignotement

## 🔧 Hooks Personnalisés

### `useAuth`
Gestion de l'authentification :
```typescript
const { user, signIn, signOut, loading } = useAuth();
```

### `useBoard`
État et gestion du board :
```typescript
const {
  board,
  members,
  userRole,
  loading,
  updateBoard,
  updateColumn,
  updateCard
} = useBoard(boardId);
```

### `useBoardActions`
Actions CRUD avec permissions :
```typescript
const {
  createColumn,
  updateColumn,
  deleteColumn,
  createCard,
  updateCard,
  deleteCard
} = useBoardActions({ boardId, userRole, onUpdate });
```

### `useDragAndDrop`
Logique drag & drop optimisée :
```typescript
const {
  activeCard,
  activeColumn,
  handleDragStart,
  handleDragOver,
  handleDragEnd
} = useDragAndDrop({
  board,
  userRole,
  onBoardUpdate,
  onMoveCard,
  onMoveColumn
});
```

## 🎯 Composants Principaux

### `DraggableCard`
Carte avec fonctionnalités complètes :
- Drag & drop avec @dnd-kit
- Labels colorés et dates d'échéance
- Modal d'édition (si permissions)
- Bouton suppression (hover)

```typescript
<DraggableCard
  id={card.id}
  title={card.title}
  description={card.description}
  labels={card.labels}
  dueDate={card.dueDate}
  onClick={() => handleCardClick(card)}
  onDelete={() => deleteCard(card.id)}
  isReadOnly={userRole === 'reader'}
/>
```

### `DraggableColumn`
Colonne avec gestion complète :
- Drag handle pour réorganisation
- Édition titre inline
- Liste cartes avec drag & drop
- Actions (si permissions)

### `CardModal`
Modal d'édition riche :
- Édition titre et description
- Gestion labels avec couleurs
- Sélecteur date d'échéance
- Validation côté client

### `InviteModal`
Système d'invitation :
- Sélection email utilisateur
- Choix du rôle (editor/reader)
- Validation et feedback

## 🎨 Système de Design

### TailwindCSS v4
Configuration optimisée :
```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(59 130 246)', // blue-500
        secondary: 'rgb(107 114 128)', // gray-500
      }
    }
  }
}
```

### Composants UI
Base de composants réutilisables :
- `Button` avec variants (default, destructive, outline, ghost)
- `Card` avec header et content
- `Input` avec validation visuelle
- `Label` avec styles cohérents

## 🔐 Sécurité & Permissions

### Protection des Routes
```typescript
// Wrapper pour pages protégées
<RequireAuth>
  <Dashboard />
</RequireAuth>
```

### Permissions Visuelles
Interface adapte selon le rôle :
```typescript
// Exemple dans Board.tsx
{userRole === 'owner' && (
  <Button onClick={() => setShowInviteModal(true)}>
    Inviter
  </Button>
)}

{userRole !== 'reader' && (
  <Button onClick={() => createColumn(title)}>
    Ajouter colonne
  </Button>
)}
```

### Validation Côté Client
```typescript
// Validation des dates
if (dueDate && new Date(dueDate) < new Date()) {
  toast.error('La date d\'échéance ne peut pas être dans le passé');
  return;
}
```

## 🚀 Performance

### Optimisations Appliquées
- **Drag & drop optimiste** : UI mise à jour immédiatement
- **Hooks personnalisés** : Logique réutilisable
- **Memoization** : Évite re-rendus inutiles
- **Bundle splitting** : Vite optimisation

### Gestion d'État
- **État local** avec useState pour UI
- **État global** avec hooks personnalisés
- **Cache API** avec React Query (via tRPC)
- **Optimistic updates** pour UX fluide

## 🧪 Développement

### Scripts Disponibles
```bash
# Développement
pnpm dev        # Serveur Vite avec HMR
pnpm build      # Build production
pnpm preview    # Preview build local

# Qualité
pnpm lint       # ESLint zero warnings
pnpm check      # TypeScript strict
```

### Configuration TypeScript
```json
// tsconfig.json - Configuration stricte
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ESLint Configuration
```typescript
// Configuration zero warnings
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'error',
      '@typescript-eslint/no-unused-vars': 'error'
    }
  }
];
```

## 🎯 UX/UI Guidelines

### Responsive Design
- **Mobile-first** : Design optimisé téléphone
- **Breakpoints** : sm, md, lg, xl avec TailwindCSS
- **Touch-friendly** : Boutons taille minimum 44px
- **Navigation** : Accessible clavier et screen readers

### Feedback Utilisateur
- **Toasts** : Notifications avec Sonner
- **Loading states** : Spinners et skeletons
- **Empty states** : Messages informatifs
- **Error states** : Messages d'erreur clairs

### Accessibilité
- **ARIA labels** : Descriptions pour screen readers
- **Focus management** : Navigation clavier
- **Color contrast** : Respect WCAG 2.1
- **Keyboard shortcuts** : Navigation rapide

## 🔄 Intégration API

### Client tRPC
```typescript
// Configuration client
export const trpc = createTRPCReact<AppRouter>();

// Utilisation dans composants
const { data: boards, isLoading } = trpc.board.getAll.useQuery();
```

### Gestion d'Erreurs
```typescript
// Pattern de gestion d'erreurs
try {
  await updateCard(cardId, data);
  toast.success('Carte mise à jour !');
} catch (error) {
  toast.error('Erreur lors de la mise à jour');
  console.error(error);
}
```

## 🚀 Build & Déploiement

### Configuration Vite
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@dnd-kit/core', '@dnd-kit/sortable']
        }
      }
    }
  }
});
```

### Railway Deployment
```json
// railway.json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": { "startCommand": "pnpm preview" }
}
```

---

*Interface moderne optimisée pour productivité et accessibilité*