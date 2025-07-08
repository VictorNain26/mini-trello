import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../utils/auth.js';
import { checkBoardPermission } from '../utils/permissions.js';
import { validateRequest, InviteUserSchema } from '../utils/validation.js';

export class MemberController {
  /**
   * Invite user to board
   */
  static async inviteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      const data = validateRequest(InviteUserSchema, req.body);
      const userId = await requireAuth(req);

      // Check if user is owner of the board (only owners can invite)
      const board = await prisma.board.findUnique({
        where: { 
          id: boardId,
          ownerId: userId
        }
      });

      if (!board) {
        res.status(403).json({ error: 'Only the board owner can invite users' });
        return;
      }

      // Find user by email
      const invitedUser = await prisma.user.findUnique({ 
        where: { email: data.email } 
      });
      
      if (!invitedUser) {
        res.status(404).json({ 
          error: 'User not found',
          requiresSignup: true,
          email: data.email
        });
        return;
      }

      // Prevent self-invitation
      if (invitedUser.id === userId) {
        res.status(400).json({ error: 'You cannot invite yourself to the board' });
        return;
      }

      // Check if user is already a member
      const existingMember = await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId: invitedUser.id
          }
        }
      });

      if (existingMember) {
        res.status(400).json({ error: 'User is already a member of this board' });
        return;
      }

      // Add user as member with the specified role
      await prisma.boardMember.create({
        data: {
          boardId,
          userId: invitedUser.id,
          role: data.role
        }
      });

      res.json({ 
        success: true, 
        message: `${invitedUser.name || invitedUser.email} has been added to the board` 
      });
      return;

    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error('Invite user error:', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
  }

  /**
   * Get board members
   */
  static async getBoardMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      const userId = await requireAuth(req);

      // Check if user has access to this board
      const hasAccess = await checkBoardPermission(boardId, userId, 'canRead');
      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Get all members including owner
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
          owner: {
            select: { id: true, name: true, email: true, color: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, color: true }
              }
            }
          }
        }
      });

      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }

      const members = [
        {
          ...board.owner,
          role: 'owner',
          joinedAt: board.createdAt
        },
        ...board.members.map((member: any) => ({
          ...member.user,
          role: member.role,
          joinedAt: member.joinedAt
        }))
      ];

      res.json(members);
      return;

    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      console.error('Get board members error:', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
  }

  /**
   * Remove member from board
   */
  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { boardId, userId: targetUserId } = req.params;
      const userId = await requireAuth(req);

      // Check if current user is the owner of the board
      const board = await prisma.board.findUnique({
        where: { id: boardId }
      });

      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }

      if (board.ownerId !== userId) {
        res.status(403).json({ error: 'Only the owner can remove members' });
        return;
      }

      // Cannot remove self
      if (targetUserId === userId) {
        res.status(400).json({ error: 'Cannot remove yourself from the board' });
        return;
      }

      // Remove the member
      await prisma.boardMember.delete({
        where: {
          boardId_userId: {
            boardId,
            userId: targetUserId
          }
        }
      });

      res.json({ success: true });
      return;
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      console.error('Remove member error:', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
  }
}