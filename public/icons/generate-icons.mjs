#!/usr/bin/env node
// Dependency-free PWA icon generator for Darons.
// Rasterizes the brand mark (navy rounded square + orange "D") to real PNGs
// using only Node built-ins (zlib). Run: node public/icons/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT_DIR = dirname(fileURLToPath(import.meta.url));
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const NAVY = [27, 40, 56]; // #1B2838
const ORANGE = [232, 115, 74]; // #E8734A

// Antialiased coverage via 3x3 supersampling per pixel.
const SS = 3;

function hypotInsideRoundedRect(x, y, w, h, r) {
  // Returns true if point (x,y) is inside a rounded rectangle [0,w]x[0,h] radius r.
  const rx = Math.min(Math.max(x, r), w - r);
  const ry = Math.min(Math.max(y, r), h - r);
  const dx = x - rx;
  const dy = y - ry;
  return dx * dx + dy * dy <= r * r;
}

function insideD(x, y, S) {
  // "D" glyph laid out on a 512 grid then scaled to S.
  const u = (x / S) * 512;
  const v = (y / S) * 512;
  // Bounding box of the letter.
  const left = 150, right = 392, top = 120, bottom = 392;
  if (u < left || u > right || v < top || v > bottom) return false;
  const stemRight = left + 70; // vertical stem thickness
  if (u <= stemRight) return true; // left vertical bar
  // Bowl: outer ellipse minus inner ellipse, right half only.
  const cx = stemRight;
  const cyMid = (top + bottom) / 2;
  const outerRx = right - stemRight;
  const outerRy = (bottom - top) / 2;
  const innerRx = outerRx - 70;
  const innerRy = outerRy - 70;
  const ox = (u - cx) / outerRx;
  const oy = (v - cyMid) / outerRy;
  const inOuter = ox * ox + oy * oy <= 1;
  if (!inOuter) return false;
  if (innerRx <= 0 || innerRy <= 0) return true;
  const ix = (u - cx) / innerRx;
  const iy = (v - cyMid) / innerRy;
  const inInner = ix * ix + iy * iy < 1;
  return !inInner;
}

function buildRGBA(S) {
  const radius = (80 / 512) * S;
  const buf = Buffer.alloc(S * S * 4);
  for (let py = 0; py < S; py++) {
    for (let px = 0; px < S; px++) {
      let bgCov = 0;
      let fgCov = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = px + (sx + 0.5) / SS;
          const y = py + (sy + 0.5) / SS;
          if (hypotInsideRoundedRect(x, y, S, S, radius)) {
            bgCov++;
            if (insideD(x, y, S)) fgCov++;
          }
        }
      }
      const total = SS * SS;
      const alpha = bgCov / total;
      const fg = fgCov / total;
      // Composite orange over navy, navy over transparent.
      const i = (py * S + px) * 4;
      if (alpha === 0) {
        buf[i] = buf[i + 1] = buf[i + 2] = buf[i + 3] = 0;
        continue;
      }
      const fgRatio = fg / alpha; // fraction of the opaque area that is the letter
      const r = ORANGE[0] * fgRatio + NAVY[0] * (1 - fgRatio);
      const g = ORANGE[1] * fgRatio + NAVY[1] * (1 - fgRatio);
      const b = ORANGE[2] * fgRatio + NAVY[2] * (1 - fgRatio);
      buf[i] = Math.round(r);
      buf[i + 1] = Math.round(g);
      buf[i + 2] = Math.round(b);
      buf[i + 3] = Math.round(alpha * 255);
    }
  }
  return buf;
}

// --- Minimal PNG encoder ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(S, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0);
  ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  // Raw image data with per-scanline filter byte 0.
  const raw = Buffer.alloc(S * (S * 4 + 1));
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0;
    rgba.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const size of SIZES) {
  const png = encodePNG(size, buildRGBA(size));
  const path = join(OUT_DIR, `icon-${size}x${size}.png`);
  writeFileSync(path, png);
  console.log(`Generated ${path} (${png.length} bytes)`);
}
console.log("Done.");
