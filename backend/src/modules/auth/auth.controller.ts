import { Request, Response } from 'express';
import { z } from 'zod';
import { createNonceForWallet, consumeNonce, buildNonceMessage } from './nonce.store';
import { verifyWalletSignature } from './signature';
import { ensureUserByPrincipal, buildAuthResponse } from './auth.service';

const walletSchema = z.object({
  wallet: z.string().trim().min(32).max(64),
});

const verifySchema = z.object({
  wallet: z.string().trim().min(32).max(64),
  nonce: z.string().min(1),
  signature: z.string().min(1),
});

export async function requestWalletNonce(req: Request, res: Response) {
  const parsed = walletSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten(),
    });
  }

  const { nonce, message } = createNonceForWallet(parsed.data.wallet);
  res.json({ data: { nonce, message } });
}

export async function verifyWalletAccess(req: Request, res: Response) {
  const parsed = verifySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten(),
    });
  }

  const { wallet, nonce, signature } = parsed.data;

  const nonceValid = consumeNonce(wallet, nonce);
  if (!nonceValid) {
    return res.status(400).json({
      status: 'error',
      message: 'Nonce expired or does not match wallet',
    });
  }

  const message = buildNonceMessage(nonce);
  const signatureValid = verifyWalletSignature({ wallet, message, signature });

  if (!signatureValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Signature verification failed',
    });
  }

  const user = await ensureUserByPrincipal(wallet);
  const authPayload = buildAuthResponse(user);

  res.json({ data: authPayload });
}
