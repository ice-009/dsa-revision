// Renders the app icon (a small binary tree on blue) to PNGs without dependencies.
// Usage: node scripts/icons.mjs
import fs from 'node:fs';
import zlib from 'node:zlib';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = buf => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

const nodes = [[0.5, 0.31], [0.31, 0.58], [0.69, 0.58], [0.56, 0.80]];
const edges = [[0, 1], [0, 2], [2, 3]];
const segDist = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// scale < 1 shrinks the artwork toward the centre (maskable icons keep content inside the 80% safe zone)
function render(size, scale = 1) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  const aa = 1.2 / size / scale;
  const cover = d => Math.max(0, Math.min(1, 0.5 - d / aa));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const gu = (x + 0.5) / size, gv = (y + 0.5) / size;
      const u = 0.5 + (gu - 0.5) / scale, v = 0.5 + (gv - 0.5) / scale;
      let c = mix([58, 104, 245], [28, 52, 170], (gu + gv) / 2);
      for (const [a, b] of edges) c = mix(c, [255, 255, 255], 0.9 * cover(segDist(u, v, nodes[a], nodes[b]) - 0.022));
      nodes.forEach(([nx, ny], i) => {
        const d = Math.hypot(u - nx, v - ny);
        c = mix(c, i === 3 ? [255, 196, 77] : [255, 255, 255], cover(d - 0.085));
        if (i !== 3) c = mix(c, [42, 82, 220], cover(d - 0.038));
      });
      raw.set(c.map(Math.round), y * (size * 3 + 1) + 1 + x * 3);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [name, size, scale] of [['icon-192', 192], ['icon-512', 512], ['apple-touch-icon', 180], ['maskable-192', 192, 0.72], ['maskable-512', 512, 0.72]]) {
  fs.writeFileSync(new URL(`../icons/${name}.png`, import.meta.url), render(size, scale));
}
console.log('icons written');
