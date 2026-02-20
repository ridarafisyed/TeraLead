import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { chatRouter } from './modules/chat/chat.routes.js';
import { docsRouter } from './modules/docs/docs.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { patientRouter } from './modules/patients/patient.routes.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/health', healthRouter);
app.use('/', docsRouter);
app.use('/auth', authLimiter, authRouter);
app.use('/patients', requireAuth, patientRouter);
app.use('/', requireAuth, chatRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
