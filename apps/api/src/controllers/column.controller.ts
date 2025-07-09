import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../utils/auth.js';
import { requireBoardPermission } from '../utils/permissions.js';
import {
  CreateColumnSchema,
  MoveColumnSchema,
  UpdateColumnSchema,
  validateRequest,
} from '../utils/validation.js';

export class ColumnController {
  /**
   * Create new column
   */
  static async createColumn(req: Request, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      if (!boardId) {
        res.status(400).json({ error: 'Board ID is required' });
        return;
      }
      const data = validateRequest(CreateColumnSchema, req.body);
      const userId = await requireAuth(req);

      await requireBoardPermission(boardId, userId, 'canEdit');

      // Get next order
      const lastColumn = await prisma.column.findFirst({
        where: { boardId },
        orderBy: { order: 'desc' },
      });

      const column = await prisma.column.create({
        data: {
          title: data.title,
          boardId,
          order: (lastColumn?.order || 0) + 1,
        },
      });

      res.json(column);
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
      console.error('Create column error:', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
  }

  /**
   * Update column
   */
  static async updateColumn(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Column ID is required' });
        return;
      }
      const data = validateRequest(UpdateColumnSchema, req.body);
      const userId = await requireAuth(req);

      // Get column with board info to check permissions
      const column = await prisma.column.findUnique({
        where: { id },
        include: { board: true },
      });

      if (!column) {
        res.status(404).json({ error: 'Column not found' });
        return;
      }

      await requireBoardPermission(column.boardId, userId, 'canEdit');

      await prisma.column.update({
        where: { id },
        data: { title: data.title },
      });

      res.json({ success: true });
      return;
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
      console.error('Update column error:', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
  }

  /**
   * Delete column
   */
  static async deleteColumn(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Column ID is required' });
        return;
      }
      const userId = await requireAuth(req);

      // Get column with board info to check permissions
      const column = await prisma.column.findUnique({
        where: { id },
        include: { board: true },
      });

      if (!column) {
        res.status(404).json({ error: 'Column not found' });
        return;
      }

      await requireBoardPermission(column.boardId, userId, 'canEdit');

      await prisma.column.delete({ where: { id } });
      res.json({ success: true });
      return;
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
      }
      console.error('Delete column error:', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
  }

  /**
   * Move column
   */
  static async moveColumn(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Column ID is required' });
        return;
      }
      const data = validateRequest(MoveColumnSchema, req.body);
      const userId = await requireAuth(req);

      // Get column with board info to check permissions
      const column = await prisma.column.findUnique({
        where: { id },
        include: { board: true },
      });

      if (!column) {
        res.status(404).json({ error: 'Column not found' });
        return;
      }

      await requireBoardPermission(column.boardId, userId, 'canEdit');

      await prisma.column.update({
        where: { id },
        data: { order: data.order },
      });

      res.json({ success: true });
      return;
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
      }
      console.error('Move column error:', error);
      res.status(500).json({ error: 'Server error' });
      return;
    }
  }
}
