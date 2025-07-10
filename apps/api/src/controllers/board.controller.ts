import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db.js';
import { cache } from '../lib/cache.js';
import { getAuthenticatedUser, requireAuth } from '../utils/auth.js';
import { requireBoardPermission } from '../utils/permissions.js';
import { CreateBoardSchema, UpdateBoardSchema, validateRequest } from '../utils/validation.js';

export class BoardController {
  /**
   * Get all boards for authenticated user (with caching)
   */
  static async getBoards(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getAuthenticatedUser(req);

      if (!userId) {
        res.json([]);
        return;
      }

      // Skip cache for now - always get fresh data
      // const cachedBoards = await cache.getUserBoards(userId);
      // if (cachedBoards) {
      //   res.json(cachedBoards);
      //   return;
      // }

      // Single optimized query with union
      const boards = await prisma.board.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: { userId: userId },
              },
            },
          ],
        },
        include: {
          _count: {
            select: { columns: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const ownedBoards = boards.filter((board: any) => board.ownerId === userId);
      const sharedBoards = boards.filter((board: any) => board.ownerId !== userId);
      
      const result = {
        owned: ownedBoards.map((board: any) => ({ ...board, isOwner: true })),
        shared: sharedBoards.map((board: any) => ({ ...board, isOwner: false })),
      };

      // Skip caching for now
      // await cache.setUserBoards(userId, result);

      res.json(result);
    } catch (error) {
      console.error('Get boards error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Create new board
   */
  static async createBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateRequest(CreateBoardSchema, req.body);
      const userId = await getAuthenticatedUser(req);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const board = await prisma.board.create({
        data: {
          title: data.title,
          ownerId: userId,
        },
      });

      // Invalidate user boards cache
      await cache.delUserBoards(userId);

      res.json(board);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error('Create board error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Get board by ID with columns and cards (with caching)
   */
  static async getBoardById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Board ID is required' });
        return;
      }

      const userId = await getAuthenticatedUser(req);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Skip cache for now - always get fresh data from database
      // TODO: Implement proper cache invalidation strategy

      const board = await prisma.board.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              members: {
                some: { userId: userId },
              },
            },
          ],
        },
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: {
              cards: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }

      // Skip caching for now to avoid stale data
      // await cache.setBoard(id, board);

      res.json(board);
    } catch (error) {
      console.error('Get board error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Update board
   */
  static async updateBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Board ID is required' });
        return;
      }

      const data = validateRequest(UpdateBoardSchema, req.body);
      const userId = await requireAuth(req);

      await requireBoardPermission(id, userId, 'canEdit');

      await prisma.board.update({
        where: { id },
        data: { title: data.title },
      });

      // Invalidate caches
      await cache.invalidateBoardCaches(id);

      res.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
        if (error.message.includes('Insufficient permissions')) {
          res.status(403).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error('Update board error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Delete board
   */
  static async deleteBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Board ID is required' });
        return;
      }

      const userId = await requireAuth(req);

      // Only owner can delete board
      const board = await prisma.board.findUnique({
        where: { id },
      });

      if (!board) {
        res.status(404).json({ error: 'Board not found' });
        return;
      }

      if (board.ownerId !== userId) {
        res.status(403).json({ error: 'Only the owner can delete the board' });
        return;
      }

      await prisma.board.delete({ where: { id } });

      // Invalidate all related caches
      await cache.invalidateBoardCaches(id);

      res.json({ success: true });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      console.error('Delete board error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}
