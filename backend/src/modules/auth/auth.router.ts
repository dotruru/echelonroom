import { Router } from 'express';
import { requestWalletNonce, verifyWalletAccess } from './auth.controller';

const router = Router();

router.post('/nonce', requestWalletNonce);
router.post('/verify', verifyWalletAccess);

export default router;
