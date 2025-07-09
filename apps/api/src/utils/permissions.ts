import { prisma } from '../db.js';

export type UserRole = 'owner' | 'editor' | 'reader';

export interface BoardPermissions {
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageMembers: boolean;
}

/**
 * Get user role on a board
 */
export async function getUserBoardRole(boardId: string, userId: string): Promise<UserRole | null> {
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

  // Check if user is owner
  if (board.ownerId === userId) return 'owner';

  // Check if user is member
  const member = board.members[0];
  return (member?.role as UserRole) || null;
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
 * Check if user has permission to perform action on board
 */
export async function checkBoardPermission(
  boardId: string,
  userId: string,
  action: keyof BoardPermissions
): Promise<boolean> {
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
