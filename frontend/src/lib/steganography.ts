/**
 * LSB (Least Significant Bit) Steganography utilities
 * Embeds and extracts hidden text data in images
 */

/**
 * Embeds a hidden message into an image using LSB steganography
 * @param imageData - The original image data
 * @param message - The message to hide
 * @returns Modified image data with embedded message
 */
export async function embedMessage(imageData: Uint8Array, message: string): Promise<Uint8Array> {
  // Create a canvas to work with the image
  // Convert to ArrayBuffer to ensure compatibility
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
  
  // Convert message to binary with length prefix
  const messageWithLength = `${message.length}:${message}`;
  const messageBits = stringToBits(messageWithLength);
  
  // Check if image has enough capacity
  const maxBits = pixels.length;
  if (messageBits.length > maxBits) {
    throw new Error('Message too long for this image');
  }
  
  // Embed message bits into LSB of pixel values
  for (let i = 0; i < messageBits.length; i++) {
    pixels[i] = (pixels[i] & 0xFE) | messageBits[i];
  }
  
  // Add terminator
  if (messageBits.length + 8 < maxBits) {
    for (let i = 0; i < 8; i++) {
      pixels[messageBits.length + i] = pixels[messageBits.length + i] & 0xFE;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  
  // Convert canvas back to Uint8Array
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
 * Extracts a hidden message from an image using LSB steganography
 * @param imageData - The image data with embedded message
 * @returns The extracted message or null if no message found
 */
export async function extractMessage(imageData: Uint8Array): Promise<string | null> {
  try {
    // Create a canvas to work with the image
    // Convert to ArrayBuffer to ensure compatibility
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
    
    // Extract bits from LSB
    const bits: number[] = [];
    for (let i = 0; i < pixels.length && bits.length < 10000; i++) {
      bits.push(pixels[i] & 1);
    }
    
    // Convert bits to string and parse length prefix
    const fullMessage = bitsToString(bits);
    const colonIndex = fullMessage.indexOf(':');
    
    if (colonIndex === -1) return null;
    
    const lengthStr = fullMessage.substring(0, colonIndex);
    const messageLength = parseInt(lengthStr, 10);
    
    if (isNaN(messageLength) || messageLength <= 0) return null;
    
    const message = fullMessage.substring(colonIndex + 1, colonIndex + 1 + messageLength);
    return message || null;
  } catch (error) {
    console.error('Error extracting message:', error);
    return null;
  }
}

/**
 * Converts a string to an array of bits
 */
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

/**
 * Converts an array of bits to a string
 */
function bitsToString(bits: number[]): string {
  let str = '';
  for (let i = 0; i < bits.length; i += 8) {
    if (i + 7 >= bits.length) break;
    let charCode = 0;
    for (let j = 0; j < 8; j++) {
      charCode = (charCode << 1) | bits[i + j];
    }
    if (charCode === 0) break; // Terminator
    str += String.fromCharCode(charCode);
  }
  return str;
}
