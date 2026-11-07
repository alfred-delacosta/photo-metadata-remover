import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(__dirname, "../../backend/package.json"));
const sharp = require("sharp");
const outDir = path.resolve(__dirname, "../public");

function svgFor(size) {
  const fontSize = Math.round(size * 0.28);
  const subSize = Math.max(6, Math.round(size * 0.09));
  const pad = Math.round(size * 0.12);
  const r = Math.round(size * 0.18);
  const stroke = Math.max(1, Math.round(size * 0.02));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#1976d2"/>
  <rect x="${pad}" y="${pad}" width="${size - pad * 2}" height="${size - pad * 2}" rx="${Math.round(r * 0.6)}" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="${stroke}"/>
  <text x="50%" y="48%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}" fill="#ffffff">PMR</text>
  <text x="50%" y="${Math.round(size * 0.72)}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="${subSize}" fill="#ffffff" fill-opacity="0.85">PRIVACY</text>
</svg>`);
}

const files = [
  ["apple-touch-icon.png", 180],
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
];

for (const [name, size] of files) {
  await sharp(svgFor(size)).png().toFile(path.join(outDir, name));
  console.log("wrote", name);
}
