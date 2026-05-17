// Minimal PNG generator - pure Node.js, no external deps
const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let c = 0xFFFFFFFF;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let n = i;
    for (let j = 0; j < 8; j++) n = n & 1 ? 0xEDB88320 ^ (n >>> 1) : n >>> 1;
    table[i] = n;
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  // Create raw pixel rows (filter byte + pixels)
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * rowSize + 1 + x * 4;
      raw[dst] = rgba[src];     // R
      raw[dst+1] = rgba[src+1]; // G
      raw[dst+2] = rgba[src+2]; // B
      raw[dst+3] = rgba[src+3]; // A
    }
  }

  const compressed = zlib.deflateSync(raw, {level: 9});
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

// Build pixel buffer
const size = 1024;
const rgba = new Uint8Array(size * size * 4);

// Fill background
const bgColor = [79, 70, 229, 255]; // #4F46E5
for (let i = 0; i < size * size; i++) {
  rgba[i*4] = bgColor[0];
  rgba[i*4+1] = bgColor[1];
  rgba[i*4+2] = bgColor[2];
  rgba[i*4+3] = bgColor[3];
}

// Helper to set filled circle
function fillCircle(cx, cy, r, color) {
  const r2 = r * r;
  for (let y = Math.max(0, cy-r); y < Math.min(size, cy+r); y++) {
    for (let x = Math.max(0, cx-r); x < Math.min(size, cx+r); x++) {
      const dx = x - cx, dy = y - cy;
      if (dx*dx + dy*dy <= r2) {
        const idx = (y * size + x) * 4;
        rgba[idx] = color[0];
        rgba[idx+1] = color[1];
        rgba[idx+2] = color[2];
        rgba[idx+3] = color[3];
      }
    }
  }
}

// Draw white circle in center
fillCircle(512, 450, 200, [255, 255, 255, 255]);

// Draw "A" letter in indigo
function fillRect(x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx, py = y + dy;
      if (px >= 0 && px < size && py >= 0 && py < size) {
        const idx = (py * size + px) * 4;
        rgba[idx] = color[0];
        rgba[idx+1] = color[1];
        rgba[idx+2] = color[2];
        rgba[idx+3] = color[3];
      }
    }
  }
}

// Simple "A" shape - using filled triangles/rects
const aColor = [79, 70, 229, 255];
// Left diagonal of A
for (let i = 0; i < 180; i++) {
  const y = 280 + i;
  const x = Math.round(512 - 90 + i * 0.5);
  const w = Math.max(1, 30 - i * 0.1);
  fillRect(Math.round(x), y, Math.round(w), 3, aColor);
}
// Right diagonal of A
for (let i = 0; i < 180; i++) {
  const y = 280 + i;
  const x = Math.round(512 + 90 - i * 0.5);
  const w = Math.max(1, 30 - i * 0.1);
  fillRect(Math.round(x), y, Math.round(w), 3, aColor);
}
// Crossbar of A
fillRect(430, 420, 164, 25, aColor);

const png = createPNG(size, size, rgba);
fs.writeFileSync('assets/icon.png', png);
console.log('Created assets/icon.png - 1024x1024');