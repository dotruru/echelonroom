/**
 * Bit plane overlay utilities for hiding images or text in specific bit planes
 */

/**
 * Embed an image overlay into a specific bit plane of the carrier image
 */
export async function embedImageInBitPlane(
  carrierImage: Uint8Array,
  overlayImage: Uint8Array,
  bitPlane: number
): Promise<Uint8Array> {
  // Load carrier image
  const carrierBuffer = carrierImage.buffer instanceof ArrayBuffer 
    ? carrierImage.buffer 
    : new Uint8Array(carrierImage).buffer;
  const carrierBlob = new Blob([carrierBuffer], { type: 'image/png' });
  const carrierBitmap = await createImageBitmap(carrierBlob);
  
  // Load overlay image
  const overlayBuffer = overlayImage.buffer instanceof ArrayBuffer 
    ? overlayImage.buffer 
    : new Uint8Array(overlayImage).buffer;
  const overlayBlob = new Blob([overlayBuffer], { type: 'image/png' });
  const overlayBitmap = await createImageBitmap(overlayBlob);
  
  // Create canvas for carrier
  const canvas = document.createElement('canvas');
  canvas.width = carrierBitmap.width;
  canvas.height = carrierBitmap.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to get canvas context');
  
  // Draw carrier image
  ctx.drawImage(carrierBitmap, 0, 0);
  const carrierData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create canvas for overlay (resize to match carrier)
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = carrierBitmap.width;
  overlayCanvas.height = carrierBitmap.height;
  const overlayCtx = overlayCanvas.getContext('2d');
  
  if (!overlayCtx) throw new Error('Failed to get overlay canvas context');
  
  // Draw overlay image (scaled to fit)
  overlayCtx.drawImage(overlayBitmap, 0, 0, canvas.width, canvas.height);
  const overlayData = overlayCtx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Embed overlay into specified bit plane
  const mask = ~(1 << bitPlane); // Clear the target bit
  
  for (let i = 0; i < carrierData.data.length; i += 4) {
    // Process RGB channels (skip alpha)
    for (let c = 0; c < 3; c++) {
      const idx = i + c;
      
      // Clear the target bit in carrier
      carrierData.data[idx] = carrierData.data[idx] & mask;
      
      // Extract the corresponding bit from overlay (use MSB for better visibility)
      const overlayBit = (overlayData.data[idx] >> 7) & 1;
      
      // Set the bit in carrier
      carrierData.data[idx] = carrierData.data[idx] | (overlayBit << bitPlane);
    }
  }
  
  // Put modified data back
  ctx.putImageData(carrierData, 0, 0);
  
  // Convert to PNG
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob'));
        return;
      }
      
      blob.arrayBuffer().then((buffer) => {
        resolve(new Uint8Array(buffer));
      }).catch(reject);
    }, 'image/png');
  });
}

/**
 * Embed text as an image overlay into a specific bit plane
 */
export async function embedTextInBitPlane(
  carrierImage: Uint8Array,
  text: string,
  bitPlane: number
): Promise<Uint8Array> {
  // Load carrier image
  const carrierBuffer = carrierImage.buffer instanceof ArrayBuffer 
    ? carrierImage.buffer 
    : new Uint8Array(carrierImage).buffer;
  const carrierBlob = new Blob([carrierBuffer], { type: 'image/png' });
  const carrierBitmap = await createImageBitmap(carrierBlob);
  
  // Create canvas for carrier
  const canvas = document.createElement('canvas');
  canvas.width = carrierBitmap.width;
  canvas.height = carrierBitmap.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to get canvas context');
  
  // Draw carrier image
  ctx.drawImage(carrierBitmap, 0, 0);
  const carrierData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create text overlay
  const textCanvas = document.createElement('canvas');
  textCanvas.width = canvas.width;
  textCanvas.height = canvas.height;
  const textCtx = textCanvas.getContext('2d');
  
  if (!textCtx) throw new Error('Failed to get text canvas context');
  
  // Fill with black background
  textCtx.fillStyle = '#000000';
  textCtx.fillRect(0, 0, textCanvas.width, textCanvas.height);
  
  // Draw white text
  textCtx.fillStyle = '#FFFFFF';
  textCtx.textAlign = 'center';
  textCtx.textBaseline = 'middle';
  
  // Calculate font size based on canvas size and text length
  const maxFontSize = Math.min(canvas.width, canvas.height) / 4;
  const fontSize = Math.max(20, Math.min(maxFontSize, canvas.width / text.length * 1.5));
  textCtx.font = `bold ${fontSize}px monospace`;
  
  // Draw text in center
  textCtx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const textData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
  
  // Embed text overlay into specified bit plane
  const mask = ~(1 << bitPlane); // Clear the target bit
  
  for (let i = 0; i < carrierData.data.length; i += 4) {
    // Process RGB channels (skip alpha)
    for (let c = 0; c < 3; c++) {
      const idx = i + c;
      
      // Clear the target bit in carrier
      carrierData.data[idx] = carrierData.data[idx] & mask;
      
      // Extract the corresponding bit from text overlay (use MSB for better visibility)
      const textBit = (textData.data[idx] >> 7) & 1;
      
      // Set the bit in carrier
      carrierData.data[idx] = carrierData.data[idx] | (textBit << bitPlane);
    }
  }
  
  // Put modified data back
  ctx.putImageData(carrierData, 0, 0);
  
  // Convert to PNG
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob'));
        return;
      }
      
      blob.arrayBuffer().then((buffer) => {
        resolve(new Uint8Array(buffer));
      }).catch(reject);
    }, 'image/png');
  });
}
