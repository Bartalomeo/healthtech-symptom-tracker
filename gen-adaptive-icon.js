// Adaptive icon - same design but with transparent background
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

  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * rowSize + 1 + x * 4;
      raw[dst] = rgba[src];
      raw[dst+1] = rgba[src+1];
      raw[dst+2] = rgba[src+2];
      raw[dst+3] = rgba[src+3];
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

function fillCircle(cx, cy, r, color, startY = 0) {
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

const size = 1024;
const rgba = new Uint8Array(size * size * 4);

// Transparent background
rgba.fill(0);

// Indigo background circle
fillCircle(512, 512, 450, [79, 70, 229, 255]);

// White inner circle
fillCircle(512, 512, 380, [255, 255, 255, 255]);

// "AI" text in indigo
const aColor = [79, 70, 229, 255];

// "A" - left diagonal
for (let i = 0; i < 160; i++) {
  const y = 370 + i;
  const x = Math.round(512 - 75 + i * 0.47);
  const w = Math.max(1, 28 - i * 0.08);
  fillRect(Math.round(x), y, Math.round(w), 4, aColor);
}
// A right diagonal
for (let i = 0; i < 160; i++) {
  const y = 370 + i;
  const x = Math.round(512 + 75 - i * 0.47);
  const w = Math.max(1, 28 - i * 0.08);
  fillRect(Math.round(x), y, Math.round(w), 4, aColor);
}
// A crossbar
fillRect(448, 490, 128, 22, aColor);

// "I" - simple vertical bar
fillRect(580, 380, 40, 180, aColor);
// I dot
fillRect(575, 350, 50, 30, aColor);

const png = createPNG(size, size, rgba);
fs.writeFileSync('assets/adaptive-icon.png', png);
console.log('Created assets/adaptive-icon.png - 1024x1024 with transparency');