import { prisma } from '../db.js';
import { cache } from '../lib/cache.js';

export type UserRole = 'owner' | 'editor' | 'reader';

export interface BoardPermissions {
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageMembers: boolean;
}

interface CachedPermissions {
  role: UserRole | null;
  permissions: BoardPermissions;
}

/**
 * Get user role on a board (with caching)
 */
export async function getUserBoardRole(boardId: string, userId: string): Promise<UserRole | null> {
  // Check cache first
  const cached = await cache.getUserPermissions(userId, boardId);
  if (cached && typeof cached === 'object' && 'role' in cached) {
    return (cached as CachedPermissions).role;
  }

  // Get from database
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!board) return null;

  let role: UserRole | null = null;

  // Check if user is owner
  if (board.ownerId === userId) {
    role = 'owner';
  } else {
    // Check if user is member
    const member = board.members[0];
    role = (member?.role as UserRole) || null;
  }

  // Cache the result
  const permissions = getPermissionsForRole(role);
  await cache.setUserPermissions(userId, boardId, { role, permissions });

  return role;
}

/**
 * Get permissions for a user on a board
 */
export function getPermissionsForRole(role: UserRole | null): BoardPermissions {
  if (!role) {
    return {
      canRead: false,
      canEdit: false,
      canDelete: false,
      canInvite: false,
      canManageMembers: false,
    };
  }

  switch (role) {
    case 'owner':
      return {
        canRead: true,
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canManageMembers: true,
      };
    case 'editor':
      return {
        canRead: true,
        canEdit: true,
        canDelete: true,
        canInvite: false,
        canManageMembers: false,
      };
    case 'reader':
      return {
        canRead: true,
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManageMembers: false,
      };
    default:
      return {
        canRead: false,
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManageMembers: false,
      };
  }
}

/**
 * Check if user has permission to perform action on board (with caching)
 */
export async function checkBoardPermission(
  boardId: string,
  userId: string,
  action: keyof BoardPermissions
): Promise<boolean> {
  // Check cache first
  const cached = await cache.getUserPermissions(userId, boardId);
  if (cached && typeof cached === 'object' && 'permissions' in cached) {
    return (cached as CachedPermissions).permissions[action];
  }

  // Get from database and cache
  const role = await getUserBoardRole(boardId, userId);
  const permissions = getPermissionsForRole(role);
  return permissions[action];
}

/**
 * Require specific permission on board (throw if not allowed)
 */
export async function requireBoardPermission(
  boardId: string,
  userId: string,
  action: keyof BoardPermissions
): Promise<void> {
  const hasPermission = await checkBoardPermission(boardId, userId, action);
  if (!hasPermission) {
    throw new Error(`Insufficient permissions to ${action} on this board`);
  }
}
