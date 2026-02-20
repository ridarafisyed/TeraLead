import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../db/prisma.js';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../utils/http.js';
import { signToken } from '../../utils/jwt.js';
import { authSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/register', validate(authSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new HttpError(409, 'EMAIL_IN_USE', 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    const token = signToken({ sub: user.id, email: user.email });

    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', validate(authSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});
