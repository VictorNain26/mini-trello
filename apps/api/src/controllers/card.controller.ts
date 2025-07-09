import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../utils/auth.js';
import { requireBoardPermission } from '../utils/permissions.js';
import {
  CreateCardSchema,
  MoveCardSchema,
  UpdateCardSchema,
  validateRequest,
} from '../utils/validation.js';

export class CardController {
  /**
   * Create new card
   */
  static async createCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { columnId } = req.params;
      if (!columnId) {
        res.status(400).json({ error: 'Column ID is required' });
        return;
      }
      const data = validateRequest(CreateCardSchema, req.body);
      const userId = await requireAuth(req);

      // Get column with board info to check permissions
      const column = await prisma.column.findUnique({
        where: { id: columnId },
        include: { board: true },
      });

      if (!column) {
        res.status(404).json({ error: 'Column not found' });
        return;
      }

      await requireBoardPermission(column.boardId, userId, 'canEdit');

      // Get next order
      const lastCard = await prisma.card.findFirst({
        where: { columnId },
        orderBy: { order: 'desc' },
      });

      const card = await prisma.card.create({
        data: {
          title: data.title,
          columnId,
          order: (lastCard?.order || 0) + 1,
        },
      });

      res.json(card);
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
      console.error('Create card error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Update card
   */
  static async updateCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Card ID is required' });
        return;
      }
      const data = validateRequest(UpdateCardSchema, req.body);
      const userId = await requireAuth(req);

      // Get card with board info to check permissions
      const card = await prisma.card.findUnique({
        where: { id },
        include: {
          column: {
            include: { board: true },
          },
        },
      });

      if (!card) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }

      await requireBoardPermission(card.column.boardId, userId, 'canEdit');

      // Prepare update data
      const updateData: Partial<{
        title: string;
        description: string;
        labels: string[];
        dueDate: Date | null;
      }> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.labels !== undefined) updateData.labels = data.labels;
      if (data.dueDate !== undefined)
        updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

      await prisma.card.update({
        where: { id },
        data: updateData,
      });

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
      console.error('Update card error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Delete card
   */
  static async deleteCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Card ID is required' });
        return;
      }
      const userId = await requireAuth(req);

      // Get card with board info to check permissions
      const card = await prisma.card.findUnique({
        where: { id },
        include: {
          column: {
            include: { board: true },
          },
        },
      });

      if (!card) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }

      await requireBoardPermission(card.column.boardId, userId, 'canEdit');

      await prisma.card.delete({ where: { id } });
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
      }
      console.error('Delete card error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Move card
   */
  static async moveCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Card ID is required' });
        return;
      }
      const data = validateRequest(MoveCardSchema, req.body);
      const userId = await requireAuth(req);

      // Get card with board info to check permissions
      const card = await prisma.card.findUnique({
        where: { id },
        include: {
          column: {
            include: { board: true },
          },
        },
      });

      if (!card) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }

      await requireBoardPermission(card.column.boardId, userId, 'canEdit');

      await prisma.card.update({
        where: { id },
        data: {
          columnId: data.columnId,
          order: data.order,
        },
      });

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
      }
      console.error('Move card error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}
