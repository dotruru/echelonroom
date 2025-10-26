/**
 * Advanced LSB Steganography with encryption and variable bit depth
 */

import { aesEncrypt, aesDecrypt, xorCipher } from './crypto';

export type EncryptionType = 'none' | 'aes' | 'xor';

/**
 * Embeds a message into an image with optional encryption and variable bit depth
 */
export async function embedMessageAdvanced(
  imageData: Uint8Array,
  message: string,
  bitDepth: number = 1,
  encryptionType: EncryptionType = 'none',
  passphrase: string = ''
): Promise<Uint8Array> {
  // Encrypt message if requested
  let processedMessage = message;
  if (encryptionType === 'aes' && passphrase) {
    processedMessage = await aesEncrypt(message, passphrase);
  } else if (encryptionType === 'xor' && passphrase) {
    processedMessage = xorCipher(message, passphrase);
  }

  // Create canvas
  const buffer = imageData.buffer instanceof ArrayBuffer 
    ? imageData.buffer 
    : new Uint8Array(imageData).buffer;
  const blob = new Blob([buffer], { type: 'image/png' });
  const imageBitmap = await createImageBitmap(blob);
  
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to get canvas context');
  
  ctx.drawImage(imageBitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imgData.data;
  
  // Add metadata header: encryption type + bit depth
  const header = `${encryptionType}:${bitDepth}:`;
  const messageWithHeader = `${header}${processedMessage.length}:${processedMessage}`;
  const messageBits = stringToBits(messageWithHeader);
  
  // Check capacity
  const maxBits = Math.floor(pixels.length / bitDepth) * bitDepth;
  if (messageBits.length > maxBits) {
    throw new Error('Message too long for this image with current bit depth');
  }
  
  // Embed message bits
  let bitIndex = 0;
  for (let i = 0; i < pixels.length && bitIndex < messageBits.length; i++) {
    // Clear the least significant bits based on bit depth
    const mask = ~((1 << bitDepth) - 1);
    pixels[i] = (pixels[i] & mask);
    
    // Embed bits
    for (let d = 0; d < bitDepth && bitIndex < messageBits.length; d++) {
      pixels[i] |= (messageBits[bitIndex] << d);
      bitIndex++;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      blob.arrayBuffer().then((buffer) => {
        resolve(new Uint8Array(buffer));
      });
    }, 'image/png');
  });
}

/**
 * Extracts a message from an image with optional decryption
 */
export async function extractMessageAdvanced(
  imageData: Uint8Array,
  bitDepth: number = 1,
  encryptionType: EncryptionType = 'none',
  passphrase: string = ''
): Promise<string | null> {
  try {
    const buffer = imageData.buffer instanceof ArrayBuffer 
      ? imageData.buffer 
      : new Uint8Array(imageData).buffer;
    const blob = new Blob([buffer], { type: 'image/png' });
    const imageBitmap = await createImageBitmap(blob);
    
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    ctx.drawImage(imageBitmap, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    
    // Extract bits
    const bits: number[] = [];
    for (let i = 0; i < pixels.length && bits.length < 50000; i++) {
      for (let d = 0; d < bitDepth; d++) {
        bits.push((pixels[i] >> d) & 1);
      }
    }
    
    // Convert to string and parse
    const fullMessage = bitsToString(bits);
    
    // Try to parse header
    const headerMatch = fullMessage.match(/^(none|aes|xor):(\d+):/);
    if (!headerMatch) return null;
    
    const extractedEncryption = headerMatch[1] as EncryptionType;
    const extractedBitDepth = parseInt(headerMatch[2], 10);
    const afterHeader = fullMessage.substring(headerMatch[0].length);
    
    const colonIndex = afterHeader.indexOf(':');
    if (colonIndex === -1) return null;
    
    const lengthStr = afterHeader.substring(0, colonIndex);
    const messageLength = parseInt(lengthStr, 10);
    
    if (isNaN(messageLength) || messageLength <= 0) return null;
    
    let message = afterHeader.substring(colonIndex + 1, colonIndex + 1 + messageLength);
    
    // Decrypt if needed
    if (extractedEncryption === 'aes' && passphrase) {
      message = await aesDecrypt(message, passphrase);
    } else if (extractedEncryption === 'xor' && passphrase) {
      message = xorCipher(message, passphrase);
    }
    
    return message || null;
  } catch (error) {
    console.error('Error extracting message:', error);
    return null;
  }
}

function stringToBits(str: string): number[] {
  const bits: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    for (let j = 7; j >= 0; j--) {
      bits.push((charCode >> j) & 1);
    }
  }
  return bits;
}

function bitsToString(bits: number[]): string {
  let str = '';
  for (let i = 0; i < bits.length; i += 8) {
    if (i + 7 >= bits.length) break;
    let charCode = 0;
    for (let j = 0; j < 8; j++) {
      charCode = (charCode << 1) | bits[i + j];
    }
    if (charCode === 0) break;
    str += String.fromCharCode(charCode);
  }
  return str;
}
