import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const createClient = () =>
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

export const prisma =
  global.prisma ||
  (() => {
    const client = createClient();

    client.$on('error', (event) => {
      logger.error({ event }, 'Prisma error');
    });

    client.$on('warn', (event) => {
      logger.warn({ event }, 'Prisma warning');
    });

    if (process.env.NODE_ENV !== 'production') {
      client.$on('query', (event) => {
        logger.debug(
          { query: event.query, params: event.params, duration: event.duration },
          'Prisma query executed'
        );
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      global.prisma = client;
    }

    return client;
  })();
