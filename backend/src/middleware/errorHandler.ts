/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';

// Generic error handler that keeps responses consistent across the API.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, 'Unhandled request error');

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}
