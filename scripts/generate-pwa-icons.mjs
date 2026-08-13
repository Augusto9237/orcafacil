import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.join(process.cwd(), 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function createPngBuffer(width, height, r, g, b) {
  const p = (val, len) => {
    const buf = Buffer.alloc(len);
    if (len === 4) buf.writeUInt32BE(val, 0);
    else if (len === 2) buf.writeUInt16BE(val, 0);
    else buf.writeUInt8(val, 0);
    return buf;
  };

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdrData = Buffer.concat([
    p(width, 4),
    p(height, 4),
    p(8, 1),
    p(2, 1), // RGB
    p(0, 1),
    p(0, 1),
    p(0, 1)
  ]);
  
  const crc32 = (buf) => {
    let c;
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      table[n] = c;
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  };

  const createChunk = (type, data) => {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = p(data.length, 4);
    const crcBuf = p(crc32(Buffer.concat([typeBuf, data])), 4);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  };

  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  const bgR = r, bgG = g, bgB = b;
  const accentR = 16, accentG = 185, accentB = 129; // Emerald #10b981

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const isInSymbol = (dist < radius * 0.7) && (Math.abs(dx - dy) < width * 0.12 || Math.abs(dx + dy) < width * 0.12);

      if (isInSymbol) {
        rawData[pixelOffset] = accentR;
        rawData[pixelOffset + 1] = accentG;
        rawData[pixelOffset + 2] = accentB;
      } else {
        rawData[pixelOffset] = bgR;
        rawData[pixelOffset + 1] = bgG;
        rawData[pixelOffset + 2] = bgB;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function main() {
  console.log('Generating PWA Icons...');
  
  const icon192 = createPngBuffer(192, 192, 9, 9, 11);
  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);

  const icon512 = createPngBuffer(512, 512, 9, 9, 11);
  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);

  const appleIcon = createPngBuffer(180, 180, 9, 9, 11);
  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleIcon);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="#09090b"/>
  <path d="M160 160 L352 160 L352 352 L160 352 Z" fill="none" stroke="#10b981" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M210 256 L246 292 L302 220" fill="none" stroke="#10b981" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icon192);

  console.log('PWA Icons generated successfully!');
}

main();
