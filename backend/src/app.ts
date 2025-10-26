import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import authRouter from './modules/auth/auth.router';
import healthRouter from './routes/health';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/requireAuth';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_req, res) => {
    res.json({
      name: 'the-echelon-room-backend',
      status: 'operational',
    });
  });

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api', requireAuth, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
