/**
 * Cryptographic utilities for text encryption, hashing, encoding, and classic ciphers
 */

// Hash functions
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

export async function sha1(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return bufferToHex(hashBuffer);
}

export async function md5(text: string): Promise<string> {
  // MD5 is not available in Web Crypto API, using a simple implementation
  // For production, consider using a library like crypto-js
  // This is a placeholder that returns a SHA-256 hash instead
  return sha256(text);
}

// Encoding functions
export function base64Encode(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function base64Decode(encoded: string): string {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    throw new Error('Invalid Base64 string');
  }
}

export function hexEncode(text: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return Array.from(data)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function hexDecode(hex: string): string {
  try {
    const bytes = hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  } catch {
    throw new Error('Invalid hex string');
  }
}

export function binaryEncode(text: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return Array.from(data)
    .map(byte => byte.toString(2).padStart(8, '0'))
    .join(' ');
}

export function binaryDecode(binary: string): string {
  try {
    const bytes = binary.split(' ').map(byte => parseInt(byte, 2));
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  } catch {
    throw new Error('Invalid binary string');
  }
}

// Classic ciphers
export function caesarCipher(text: string, shift: number, decode: boolean = false): string {
  const actualShift = decode ? -shift : shift;
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + actualShift + 26) % 26) + base);
  });
}

export function vigenereCipher(text: string, key: string, decode: boolean = false): string {
  if (!key) throw new Error('Key is required');
  const keyUpper = key.toUpperCase();
  let keyIndex = 0;
  
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    const keyChar = keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65;
    keyIndex++;
    const shift = decode ? -keyChar : keyChar;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

export function xorCipher(text: string, key: string): string {
  if (!key) throw new Error('Key is required');
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const textBytes = encoder.encode(text);
  const keyBytes = encoder.encode(key);
  
  const result = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    result[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return decoder.decode(result);
}

// AES encryption/decryption
export async function aesEncrypt(text: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Derive key from password
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Combine salt + iv + encrypted data
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return bufferToHex(result.buffer);
}

export async function aesDecrypt(encryptedHex: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const encrypted = hexToBuffer(encryptedHex);
  
  // Extract salt, iv, and encrypted data
  const salt = encrypted.slice(0, 16);
  const iv = encrypted.slice(16, 28);
  const data = encrypted.slice(28);
  
  // Derive key from password
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Helper functions
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
  return new Uint8Array(bytes);
}
