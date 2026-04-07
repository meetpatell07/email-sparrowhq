/**
 * generate-icons.js — Generates PNG icons for the SparrowHQ extension.
 *
 * Run once (or whenever the brand changes):
 *   node icons/generate-icons.js
 *
 * Output: icon16.png, icon48.png, icon128.png
 *
 * Visual spec:
 *   - White circle on transparent background
 *   - SparrowHQ bird mark centred in black
 *   - Tail/wing accent at 55% opacity (grey)
 *   - White eye dot
 *
 * Pure Node.js — no external dependencies.
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const zlib = require("zlib");

// ── Cubic Bézier sampler ──────────────────────────────────────────────────────

function sampleCubic(x0, y0, cx1, cy1, cx2, cy2, x1, y1, steps) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
        const t  = i / steps;
        const mt = 1 - t;
        pts.push({
            x: mt**3 * x0 + 3 * mt**2 * t * cx1 + 3 * mt * t**2 * cx2 + t**3 * x1,
            y: mt**3 * y0 + 3 * mt**2 * t * cy1 + 3 * mt * t**2 * cy2 + t**3 * y1,
        });
    }
    return pts;
}

// ── Path → polygon (SVG viewBox 0 0 40 40) ───────────────────────────────────

// Main body — sweeping curve of the bird in flight
// d="M7 26 C7 21 11 15 19 15 C24 15 28 16.5 32 11 C32 11 30.5 22 22 24.5
//    C18.5 25.5 15 24.5 13 27.5 C11 30 11 33 8.5 32.5 C6 32 5.5 29 7 26Z"
function bodyPolygon(steps) {
    const p = [];
    p.push(...sampleCubic(  7, 26,   7, 21,  11, 15,  19, 15, steps));
    p.push(...sampleCubic( 19, 15,  24, 15,  28, 16.5, 32, 11, steps));
    p.push(...sampleCubic( 32, 11,  32, 11,  30.5, 22, 22, 24.5, steps));
    p.push(...sampleCubic( 22, 24.5, 18.5, 25.5, 15, 24.5, 13, 27.5, steps));
    p.push(...sampleCubic( 13, 27.5, 11, 30,  11, 33,  8.5, 32.5, steps));
    p.push(...sampleCubic(8.5, 32.5,  6, 32,  5.5, 29,   7, 26, steps));
    return p;
}

// Wing / tail — secondary accent
// d="M19 15 C18 10.5 13.5 7 8 7 C11.5 9 15 11.5 19 15Z"
function wingPolygon(steps) {
    const p = [];
    p.push(...sampleCubic(19, 15, 18, 10.5, 13.5,  7,  8,  7, steps));
    p.push(...sampleCubic( 8,  7, 11.5,  9,  15, 11.5, 19, 15, steps));
    return p;
}

// ── Point-in-polygon (ray casting) ───────────────────────────────────────────

function pointInPoly(px, py, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y;
        const xj = poly[j].x, yj = poly[j].y;
        if (((yi > py) !== (yj > py)) &&
            (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

// ── RGBA PNG encoder (pure Node.js) ──────────────────────────────────────────

const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c;
    }
    return t;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
    const tb  = Buffer.from(type, "ascii");
    const len = Buffer.allocUnsafe(4);
    const crc = Buffer.allocUnsafe(4);
    len.writeUInt32BE(data.length, 0);
    crc.writeUInt32BE(crc32(Buffer.concat([tb, data])), 0);
    return Buffer.concat([len, tb, data, crc]);
}

function encodePNG(rgba, size) {
    const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.allocUnsafe(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
    ihdr[10] = ihdr[11] = ihdr[12] = 0;

    // Scanlines: 1 filter byte + 4 bytes per pixel
    const row = 1 + size * 4;
    const raw = Buffer.allocUnsafe(size * row);
    for (let y = 0; y < size; y++) {
        raw[y * row] = 0; // filter = None
        for (let x = 0; x < size; x++) {
            const s = (y * size + x) * 4;
            const d = y * row + 1 + x * 4;
            raw[d]     = rgba[s];
            raw[d + 1] = rgba[s + 1];
            raw[d + 2] = rgba[s + 2];
            raw[d + 3] = rgba[s + 3];
        }
    }
    return Buffer.concat([
        sig,
        pngChunk("IHDR", ihdr),
        pngChunk("IDAT", zlib.deflateSync(raw)),
        pngChunk("IEND", Buffer.alloc(0)),
    ]);
}

// ── Icon renderer ─────────────────────────────────────────────────────────────

function renderIcon(size) {
    // SparrowHQ SVG viewBox is 0 0 40 40.
    // We add a small inset padding (10% on each side) so the bird isn't
    // clipped at the circle edge.
    const SVG_SIZE  = 40;
    const PAD_RATIO = 0.12;                            // 12% inset on each side
    const drawSize  = size * (1 - 2 * PAD_RATIO);
    const offset    = size * PAD_RATIO;
    const scale     = drawSize / SVG_SIZE;

    const STEPS = Math.max(24, size * 2);              // enough samples for smooth curves

    // Scale polygons to pixel space
    const body = bodyPolygon(STEPS).map(p => ({ x: p.x * scale + offset, y: p.y * scale + offset }));
    const wing = wingPolygon(STEPS).map(p => ({ x: p.x * scale + offset, y: p.y * scale + offset }));

    // Eye in pixel coords
    const eyeCx = 26.5 * scale + offset;
    const eyeCy = 16   * scale + offset;
    const eyeR2 = (1.6 * scale) ** 2;

    // Circle parameters — fill entire square (let OS/Chrome clip to circle shape)
    const cx = (size - 1) / 2;
    const cy = (size - 1) / 2;
    const r2 = (size / 2 - 0.5) ** 2;

    // Wing rendered as pre-composited grey (opacity 0.55 over white bg)
    const WING_GREY = Math.round(255 * (1 - 0.55)); // 115

    const rgba = new Uint8Array(size * size * 4);

    for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
            const i  = (py * size + px) * 4;
            const dx = px - cx, dy = py - cy;

            if (dx * dx + dy * dy > r2) {
                // Outside circle → transparent
                rgba[i] = rgba[i+1] = rgba[i+2] = rgba[i+3] = 0;
                continue;
            }

            // ── Eye (white dot) ───────────────────────────────────────────────
            const ex = px - eyeCx, ey = py - eyeCy;
            if (ex * ex + ey * ey <= eyeR2) {
                rgba[i] = rgba[i+1] = rgba[i+2] = 255; rgba[i+3] = 255;
                continue;
            }

            // ── Bird body (black) ─────────────────────────────────────────────
            if (pointInPoly(px + 0.5, py + 0.5, body)) {
                rgba[i] = rgba[i+1] = rgba[i+2] = 0; rgba[i+3] = 255;
                continue;
            }

            // ── Wing accent (grey, 55 % opacity over white) ───────────────────
            if (pointInPoly(px + 0.5, py + 0.5, wing)) {
                rgba[i] = rgba[i+1] = rgba[i+2] = WING_GREY; rgba[i+3] = 255;
                continue;
            }

            // ── White background ──────────────────────────────────────────────
            rgba[i] = rgba[i+1] = rgba[i+2] = 255; rgba[i+3] = 255;
        }
    }

    return rgba;
}

// ── Generate ──────────────────────────────────────────────────────────────────

const dir = __dirname;

for (const size of [16, 48, 128]) {
    const rgba = renderIcon(size);
    const buf  = encodePNG(rgba, size);
    const file = path.join(dir, `icon${size}.png`);
    fs.writeFileSync(file, buf);
    console.log(`✓  icon${size}.png  (${buf.length} bytes)`);
}

console.log("\nDone — load the extension from packages/extension/ in Chrome.");
