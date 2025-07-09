import { type RequestHandler, Router } from 'express';
import { BoardController } from '../controllers/board.controller.js';
import { ColumnController } from '../controllers/column.controller.js';

const router: Router = Router();

// Board routes
router.get('/', BoardController.getBoards as RequestHandler);
router.post('/', BoardController.createBoard as RequestHandler);
router.get('/:id', BoardController.getBoardById as RequestHandler);
router.put('/:id', BoardController.updateBoard as RequestHandler);
router.delete('/:id', BoardController.deleteBoard as RequestHandler);

// Column routes
router.post('/:boardId/columns', ColumnController.createColumn as RequestHandler);

export { router as boardRoutes };
