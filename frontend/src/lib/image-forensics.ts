/**
 * Image forensics utilities for analyzing images
 */

export interface HistogramData {
  luminance: number[];
  red: number[];
  green: number[];
  blue: number[];
}

export interface ExifData {
  [key: string]: string | number;
}

/**
 * Generate histogram data for an image
 */
export async function generateHistogram(imageData: Uint8Array): Promise<HistogramData> {
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
  
  const luminance = new Array(256).fill(0);
  const red = new Array(256).fill(0);
  const green = new Array(256).fill(0);
  const blue = new Array(256).fill(0);
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    red[r]++;
    green[g]++;
    blue[b]++;
    
    // Calculate luminance
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    luminance[lum]++;
  }
  
  return { luminance, red, green, blue };
}

/**
 * Extract bit planes from an image
 */
export async function extractBitPlanes(imageData: Uint8Array, bitPlane: number): Promise<string> {
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
  
  // Extract specified bit plane
  for (let i = 0; i < pixels.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const bit = (pixels[i + c] >> bitPlane) & 1;
      pixels[i + c] = bit * 255;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL();
}

/**
 * Calculate entropy of image data
 */
export async function calculateEntropy(imageData: Uint8Array): Promise<number[][]> {
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
  
  const blockSize = 16;
  const entropyMap: number[][] = [];
  
  for (let y = 0; y < canvas.height; y += blockSize) {
    const row: number[] = [];
    for (let x = 0; x < canvas.width; x += blockSize) {
      const histogram = new Array(256).fill(0);
      let count = 0;
      
      // Calculate histogram for block
      for (let by = 0; by < blockSize && y + by < canvas.height; by++) {
        for (let bx = 0; bx < blockSize && x + bx < canvas.width; bx++) {
          const idx = ((y + by) * canvas.width + (x + bx)) * 4;
          const gray = Math.round(0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]);
          histogram[gray]++;
          count++;
        }
      }
      
      // Calculate entropy
      let entropy = 0;
      for (let i = 0; i < 256; i++) {
        if (histogram[i] > 0) {
          const p = histogram[i] / count;
          entropy -= p * Math.log2(p);
        }
      }
      
      row.push(entropy);
    }
    entropyMap.push(row);
  }
  
  return entropyMap;
}

/**
 * Extract EXIF data from image (simplified - real EXIF parsing is complex)
 */
export async function extractExifData(imageData: Uint8Array): Promise<ExifData> {
  // This is a simplified version - real EXIF parsing requires a library
  // For now, return basic image info
  const buffer = imageData.buffer instanceof ArrayBuffer 
    ? imageData.buffer 
    : new Uint8Array(imageData).buffer;
  const blob = new Blob([buffer], { type: 'image/png' });
  const imageBitmap = await createImageBitmap(blob);
  
  return {
    'Image Width': imageBitmap.width,
    'Image Height': imageBitmap.height,
    'File Size': `${(imageData.length / 1024).toFixed(2)} KB`,
    'Format': 'PNG',
    'Color Space': 'RGB',
    'Bit Depth': '8 bits per channel'
  };
}

/**
 * Compare two images byte by byte
 */
export async function compareImages(
  image1: Uint8Array,
  image2: Uint8Array
): Promise<{ differences: number; percentage: number; diffImage: string }> {
  const buffer1 = image1.buffer instanceof ArrayBuffer ? image1.buffer : new Uint8Array(image1).buffer;
  const buffer2 = image2.buffer instanceof ArrayBuffer ? image2.buffer : new Uint8Array(image2).buffer;
  
  const blob1 = new Blob([buffer1], { type: 'image/png' });
  const blob2 = new Blob([buffer2], { type: 'image/png' });
  
  const img1 = await createImageBitmap(blob1);
  const img2 = await createImageBitmap(blob2);
  
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(img1.width, img2.width);
  canvas.height = Math.max(img1.height, img2.height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to get canvas context');
  
  ctx.drawImage(img1, 0, 0);
  const data1 = ctx.getImageData(0, 0, img1.width, img1.height);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img2, 0, 0);
  const data2 = ctx.getImageData(0, 0, img2.width, img2.height);
  
  const diffData = ctx.createImageData(canvas.width, canvas.height);
  let differences = 0;
  
  for (let i = 0; i < data1.data.length; i += 4) {
    const diff = Math.abs(data1.data[i] - data2.data[i]) +
                 Math.abs(data1.data[i + 1] - data2.data[i + 1]) +
                 Math.abs(data1.data[i + 2] - data2.data[i + 2]);
    
    if (diff > 0) {
      differences++;
      diffData.data[i] = 255;
      diffData.data[i + 1] = 0;
      diffData.data[i + 2] = 0;
      diffData.data[i + 3] = 255;
    } else {
      diffData.data[i] = data1.data[i];
      diffData.data[i + 1] = data1.data[i + 1];
      diffData.data[i + 2] = data1.data[i + 2];
      diffData.data[i + 3] = 255;
    }
  }
  
  ctx.putImageData(diffData, 0, 0);
  const percentage = (differences / (data1.data.length / 4)) * 100;
  
  return {
    differences,
    percentage,
    diffImage: canvas.toDataURL()
  };
}
