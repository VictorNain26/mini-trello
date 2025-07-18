# =' Mini Trello - Backend API

> API REST + tRPC avec architecture modulaire, authentification Auth.js et syst�me de permissions granulaire.

## <� Architecture

### Structure Modulaire
```
src/
   controllers/       # Logique m�tier par domaine
      board.controller.ts    # CRUD boards
      card.controller.ts     # CRUD cards  
      column.controller.ts   # CRUD columns
      member.controller.ts   # Gestion membres

   routes/           # Organisation des endpoints
      boards.ts     # Routes boards
      cards.ts      # Routes cards
      columns.ts    # Routes columns
      members.ts    # Routes membres

   utils/            # Utilitaires r�utilisables
      auth.ts       # Authentification
      permissions.ts # Syst�me de r�les
      validation.ts  # Validation Zod

   middleware/       # Middlewares Express
      error.middleware.ts

   index.ts         # Point d'entr�e principal
```

## = Syst�me de Permissions

### R�les Disponibles
```typescript
type UserRole = 'owner' | 'editor' | 'reader';

interface BoardPermissions {
  canRead: boolean;           // Voir le contenu
  canEdit: boolean;           // Modifier contenu  
  canDelete: boolean;         // Supprimer �l�ments
  canInvite: boolean;         // Inviter utilisateurs
  canManageMembers: boolean;  // G�rer membres
}
```

### Permissions par R�le
- **Owner**: Toutes permissions (seul peut supprimer board et inviter)
- **Editor**: Peut modifier contenu (colonnes, cartes)
- **Reader**: Lecture seule uniquement

### V�rification Permissions
```typescript
// Utilitaires disponibles
await requireBoardPermission(boardId, userId, 'canEdit');
await checkBoardPermission(boardId, userId, 'canDelete');
const role = await getUserBoardRole(boardId, userId);
```

## =� API Endpoints

### Authentication
```
POST /api/auth/signin      # Connexion
POST /api/auth/signout     # D�connexion  
GET  /api/auth/session     # Session actuelle
POST /api/signup           # Inscription
```

### Boards
```
GET    /api/boards                    # Liste boards utilisateur
POST   /api/boards                    # Cr�er board
GET    /api/boards/:id                # D�tails + colonnes + cartes
PUT    /api/boards/:id                # Modifier board (owner/editor)
DELETE /api/boards/:id                # Supprimer board (owner only)
```

### Members  
```
POST   /api/boards/:id/invite         # Inviter utilisateur (owner only)
GET    /api/boards/:id/members        # Liste membres
DELETE /api/boards/:id/members/:uid   # Retirer membre (owner only)
```

### Columns
```
POST   /api/boards/:id/columns        # Cr�er colonne (owner/editor)
PUT    /api/columns/:id               # Modifier colonne (owner/editor)
DELETE /api/columns/:id               # Supprimer colonne (owner/editor)
PUT    /api/columns/:id/move          # D�placer colonne (owner/editor)
```

### Cards
```
POST   /api/columns/:id/cards         # Cr�er carte (owner/editor)
PUT    /api/cards/:id                 # Modifier carte (owner/editor)
DELETE /api/cards/:id                 # Supprimer carte (owner/editor)  
PUT    /api/cards/:id/move            # D�placer carte (owner/editor)
```

## =� Validation & S�curit�

### Validation Zod
Tous les endpoints utilisent des schemas Zod :
```typescript
const CreateBoardSchema = z.object({
  title: z.string().min(1).trim()
});

const UpdateCardSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional().nullable()
});
```

### S�curit�
-  Authentification requise sur tous endpoints
-  V�rification permissions par r�le
-  Validation stricte des entr�es  
-  Protection CSRF
-  Rate limiting configur�

## =� Base de Donn�es

### Mod�le Prisma
```prisma
model Board {
  id        String   @id @default(uuid())
  title     String
  ownerId   String
  createdAt DateTime @default(now())
  
  owner     User           @relation(fields: [ownerId], references: [id])
  columns   Column[]
  members   BoardMember[]
}

model BoardMember {
  boardId   String
  userId    String  
  role      Role    @default(READER)
  joinedAt  DateTime @default(now())
  
  board     Board @relation(fields: [boardId], references: [id])
  user      User  @relation(fields: [userId], references: [id])
  
  @@id([boardId, userId])
}
```

## =� D�veloppement

### Scripts Disponibles
```bash
# D�veloppement
pnpm dev         # Serveur avec hot reload
pnpm build       # Build TypeScript
pnpm start       # Start production

# Base de donn�es
pnpm db generate    # G�n�re client Prisma
pnpm db migrate dev # Migration d�veloppement
pnpm db studio      # Interface admin
pnpm db seed        # Donn�es de test

# Qualit�
pnpm lint        # ESLint
pnpm check       # TypeScript
```

### Variables d'Environnement
```env
# Base de donn�es
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mini_trello

# Authentication
AUTH_SECRET=your-32-character-secret-key

# CORS
CLIENT_ORIGIN=http://localhost:5173

# Optionnel
NODE_ENV=development
PORT=4000
```

### Configuration Auth.js
```typescript
// config/auth.simple.ts
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        // Logique authentification custom
      }
    })
  ],
  session: { strategy: "database" },
  secret: process.env.AUTH_SECRET
};
```

## =' Architecture Technique

### Patterns Utilis�s
- **Controller Pattern**: S�paration logique m�tier
- **Repository Pattern**: Acc�s donn�es via Prisma
- **Middleware Pattern**: Authentification et erreurs
- **Strategy Pattern**: Permissions par r�le

### Gestion d'Erreurs
```typescript
// Gestion centralis�e
try {
  await someOperation();
} catch (error) {
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Server error' });
}
```

### Performance
-  Requ�tes optimis�es avec `include`
-  Indexes sur colonnes critiques
-  Rate limiting par endpoint
-  Validation c�t� serveur uniquement

## =� Monitoring

### Logs Disponibles
- Requ�tes HTTP (Morgan)
- Erreurs serveur avec stack trace
- Tentatives authentification
- Violations permissions

### M�triques
- Temps de r�ponse par endpoint
- Taux d'erreur par route
- Utilisation base de donn�es

## =� D�ploiement

### Railway Configuration
```json
// railway.json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/index.js"
  }
}
```

### Production Checklist
-  Variables d'environnement configur�es
-  Migrations appliqu�es  
-  Auth secret s�curis�
-  CORS configur� pour domaine production
-  Rate limiting activ�

---

*API optimis�e pour performance et s�curit� - Architecture senior-level*