import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

const encoder = new TextEncoder();

export function verifyWalletSignature({
  wallet,
  message,
  signature,
}: {
  wallet: string;
  message: string;
  signature: string;
}) {
  try {
    const publicKey = new PublicKey(wallet);
    const messageBytes = encoder.encode(message);
    const signatureBytes = Buffer.from(signature, 'base64');
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
  } catch (error) {
    return false;
  }
}
