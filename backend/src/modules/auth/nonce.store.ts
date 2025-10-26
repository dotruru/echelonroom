import crypto from 'crypto';

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MESSAGE_PREFIX = 'Sign this command to access the echelon room.';

interface NonceRecord {
  nonce: string;
  expiresAt: number;
}

const nonceStore = new Map<string, NonceRecord>();

export function buildNonceMessage(nonce: string) {
  return `${MESSAGE_PREFIX}\n\nNonce: ${nonce}`;
}

export function createNonceForWallet(wallet: string) {
  const nonce = crypto.randomBytes(16).toString('hex');
  nonceStore.set(wallet, {
    nonce,
    expiresAt: Date.now() + NONCE_TTL_MS,
  });

  return {
    nonce,
    message: buildNonceMessage(nonce),
  };
}

export function consumeNonce(wallet: string, nonce: string) {
  const record = nonceStore.get(wallet);
  if (!record) {
    return false;
  }

  const isValid = record.nonce === nonce && Date.now() < record.expiresAt;
  if (isValid) {
    nonceStore.delete(wallet);
  }

  return isValid;
}
