import { Router, type RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../db.ts';
import { auth } from '../auth.js';

export const authRouter = Router();

/* =====  SIGN-UP  ===== */
const signup: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: 'email & password required' });
      return;
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(409).json({ error: 'Email already used' });
      return;
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, hashedPwd, name } });

    res.status(201).end();
  } catch (err) {
    next(err);
  }
};

authRouter.post('/signup', signup);

/* =====  LOGIN / LOGOUT / SESSION (Auth.js)  ===== */
authRouter.use(auth);
