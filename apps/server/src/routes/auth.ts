import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../db.js';
import { auth } from '../auth.js';

export const authRouter = Router();

const SignupSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6, 'Le mot de passe doit faire ≥6 caractères'),
  name:     z.string().max(50).optional(),
});
const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

authRouter.post('/signup', async (req, res, next) => {
  try {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }
    const { email, password, name } = parsed.data;

    if (await prisma.user.findUnique({ where: { email } })) {
      res.status(409).json({ error: 'Email déjà utilisé' });
      return;
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, hashedPwd, name } });
    res.status(201).json({ ok: true });
    return;
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      return;
    }

    const match = await bcrypt.compare(password, user.hashedPwd);
    if (!match) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      return;
    }

    res.status(200).json({ ok: true });
    return;
  } catch (err) {
    next(err);
  }
});

authRouter.use(auth);
