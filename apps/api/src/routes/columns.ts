import { type RequestHandler, Router } from 'express';
import { CardController } from '../controllers/card.controller.js';
import { ColumnController } from '../controllers/column.controller.js';

const router: Router = Router();

// Column routes
router.put('/:id', ColumnController.updateColumn as RequestHandler);
router.delete('/:id', ColumnController.deleteColumn as RequestHandler);
router.put('/:id/move', ColumnController.moveColumn as RequestHandler);

// Card routes
router.post('/:columnId/cards', CardController.createCard as RequestHandler);

export { router as columnRoutes };
