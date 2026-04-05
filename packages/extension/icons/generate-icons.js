/**
 * generate-icons.js — Creates placeholder PNG icons for the EmailHQ extension.
 *
 * Run once before loading the extension:
 *   node icons/generate-icons.js
 *
 * Replace with real brand icons when ready.
 */

const fs   = require("fs");
const path = require("path");
const zlib = require("zlib");

// ── Minimal PNG encoder ──────────────────────────────────────────────────────

const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        t[n] = c;
    }
    return t;
})();

function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const typeBytes = Buffer.from(type, "ascii");
    const lenBuf    = Buffer.allocUnsafe(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.allocUnsafe(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
    return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

function makePNG(size, r, g, b) {
    // PNG signature
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR: width, height, 8-bit, RGB (type 2)
    const ihdr = Buffer.allocUnsafe(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8]  = 8; // bit depth
    ihdr[9]  = 2; // RGB
    ihdr[10] = 0; // deflate/inflate
    ihdr[11] = 0; // adaptive filtering
    ihdr[12] = 0; // no interlace

    // Raw scanlines: 1 filter byte (0 = None) + size * 3 RGB bytes per row
    const rowSize = 1 + size * 3;
    const raw     = Buffer.allocUnsafe(size * rowSize);
    for (let y = 0; y < size; y++) {
        const base = y * rowSize;
        raw[base] = 0; // filter None
        for (let x = 0; x < size; x++) {
            const off = base + 1 + x * 3;
            raw[off]     = r;
            raw[off + 1] = g;
            raw[off + 2] = b;
        }
    }

    const idat = chunk("IDAT", zlib.deflateSync(raw));
    const iend = chunk("IEND", Buffer.alloc(0));

    return Buffer.concat([sig, chunk("IHDR", ihdr), idat, iend]);
}

// ── Generate ─────────────────────────────────────────────────────────────────

// #0a0a0a — matches the extension's background colour
const [R, G, B] = [10, 10, 10];
const dir = __dirname;

for (const size of [16, 48, 128]) {
    const buf  = makePNG(size, R, G, B);
    const file = path.join(dir, `icon${size}.png`);
    fs.writeFileSync(file, buf);
    console.log(`Created ${file}  (${buf.length} bytes)`);
}

console.log("Done. Load the extension from packages/extension/ in Chrome.");
