import http from 'http';
import { createApp } from './app';
import { ENV } from './config/env';
import { logger } from './config/logger';

const app = createApp();
const server = http.createServer(app);

const PORT = ENV.PORT;

server.listen(PORT, () => {
  logger.info({ port: PORT, env: ENV.NODE_ENV }, 'Backend service listening');
});

const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

shutdownSignals.forEach((signal) => {
  process.on(signal, () => {
    logger.info({ signal }, 'Received shutdown signal');
    server.close(() => {
      logger.info('HTTP server closed cleanly');
      process.exit(0);
    });

    // Force exit if shutdown stalls
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  });
});
