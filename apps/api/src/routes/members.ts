import { type RequestHandler, Router } from 'express';
import { MemberController } from '../controllers/member.controller.js';

const router: Router = Router();

// Member routes
router.post('/boards/:boardId/invite', MemberController.inviteUser as RequestHandler);
router.get('/boards/:boardId/members', MemberController.getBoardMembers as RequestHandler);
router.delete('/boards/:boardId/members/:userId', MemberController.removeMember as RequestHandler);

export { router as memberRoutes };
