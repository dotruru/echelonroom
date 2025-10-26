import { Router } from 'express';
import { devLogin } from './auth.controller';

const router = Router();

router.post('/dev-login', devLogin);

export default router;
