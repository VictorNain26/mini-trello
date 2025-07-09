import { type RequestHandler, Router } from 'express';
import { CardController } from '../controllers/card.controller.js';

const router: Router = Router();

// Card routes
router.put('/:id', CardController.updateCard as RequestHandler);
router.delete('/:id', CardController.deleteCard as RequestHandler);
router.put('/:id/move', CardController.moveCard as RequestHandler);

export { router as cardRoutes };
