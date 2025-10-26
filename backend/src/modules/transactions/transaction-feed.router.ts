import { Router } from 'express';
import { getTransactionFeed } from './transaction.controller';

const router = Router();

router.get('/', getTransactionFeed);

export default router;
