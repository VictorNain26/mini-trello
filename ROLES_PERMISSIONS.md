# 🔐 Système de Rôles et Permissions

## Définition des Rôles

### 👑 Owner (Propriétaire)
**Pouvoir absolu sur le tableau**
- ✅ Toutes les permissions Editor
- ✅ **Supprimer le tableau**
- ✅ **Gérer les membres** (inviter, modifier rôles, expulser)
- ✅ **Transférer la propriété**

### ✏️ Editor (Éditeur) 
**Modification complète du contenu**
- ✅ **Créer/modifier/supprimer colonnes**
- ✅ **Créer/modifier/supprimer cartes**
- ✅ **Réorganiser** (drag & drop)
- ✅ **Inviter nouveaux membres** (rôle reader/editor uniquement)
- ❌ Supprimer le tableau
- ❌ Modifier les permissions d'autres membres

### 👁️ Reader (Lecteur)
**Lecture seule**
- ✅ **Visualiser** le tableau et son contenu
- ✅ **Voir les membres** du tableau
- ❌ Modifier quoi que ce soit
- ❌ Créer/supprimer colonnes ou cartes
- ❌ Réorganiser les éléments
- ❌ Inviter des membres

## Matrice des Permissions

| Action | Owner | Editor | Reader |
|--------|-------|---------|--------|
| **Tableaux** |
| Voir le tableau | ✅ | ✅ | ✅ |
| Modifier le titre | ✅ | ✅ | ❌ |
| Supprimer le tableau | ✅ | ❌ | ❌ |
| **Colonnes** |
| Voir les colonnes | ✅ | ✅ | ✅ |
| Créer une colonne | ✅ | ✅ | ❌ |
| Modifier une colonne | ✅ | ✅ | ❌ |
| Supprimer une colonne | ✅ | ✅ | ❌ |
| Réorganiser colonnes | ✅ | ✅ | ❌ |
| **Cartes** |
| Voir les cartes | ✅ | ✅ | ✅ |
| Créer une carte | ✅ | ✅ | ❌ |
| Modifier une carte | ✅ | ✅ | ❌ |
| Supprimer une carte | ✅ | ✅ | ❌ |
| Déplacer une carte | ✅ | ✅ | ❌ |
| **Membres** |
| Voir les membres | ✅ | ✅ | ✅ |
| Inviter reader/editor | ✅ | ✅ | ❌ |
| Inviter owner | ✅ | ❌ | ❌ |
| Modifier rôles | ✅ | ❌ | ❌ |
| Expulser membres | ✅ | ❌ | ❌ |

## Implémentation Technique

### Backend (API)
```typescript
// Vérification des permissions
const isOwner = board.ownerId === currentUserId;
const memberRole = board.members[0]?.role; // 'owner' | 'editor' | 'reader'

// Permissions par action
const canCreate = isOwner || memberRole === 'editor';
const canDelete = isOwner || memberRole === 'editor'; 
const canInvite = isOwner || memberRole === 'editor';
const canManageMembers = isOwner; // Seul owner peut modifier/expulser
```

### Frontend (React)
```typescript
// Hook de permissions
const userRole = getUserRole(boardId, userId);
const isReadOnly = userRole === 'reader';

// Interface conditionnelle
{!isReadOnly && (
  <button onClick={deleteColumn}>Supprimer</button>
)}

// Props des composants
<DraggableColumn isReadOnly={isReadOnly} />
<InviteModal canInviteOwner={userRole === 'owner'} />
```

## Hiérarchie des Rôles

```
Owner (Propriétaire)
  ↓ Peut tout faire
Editor (Éditeur)  
  ↓ Peut modifier le contenu
Reader (Lecteur)
  ↓ Lecture seule
```

## Règles Métier

### Attribution des Rôles
1. **Créateur du tableau** → automatiquement **Owner**
2. **Invitation par Owner** → peut attribuer n'importe quel rôle
3. **Invitation par Editor** → peut inviter **Reader** ou **Editor** uniquement
4. **Auto-invitation** → **INTERDITE** (protection sécurité)

### Changement de Rôles
1. Seul l'**Owner** peut modifier les rôles
2. Un **Owner** peut promouvoir quelqu'un en **Owner** (transfert)
3. Il doit toujours y avoir au moins un **Owner** par tableau

### Sécurité
- Vérifications **double** : Frontend (UX) + Backend (sécurité)
- Validation côté serveur **obligatoire**
- Sessions sécurisées avec **Auth.js**
- Protection **CSRF** sur toutes les mutations

## Codes d'Erreur

| Code | Message | Cause |
|------|---------|-------|
| 401 | Unauthorized | Session invalide |
| 403 | Insufficient permissions | Rôle insuffisant |
| 404 | Board/Resource not found | Ressource inexistante |
| 400 | Cannot invite yourself | Tentative auto-invitation |
| 400 | User already member | Membre déjà présent |