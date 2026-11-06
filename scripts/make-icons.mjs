/*
  APP ICON GENERATOR  (run once:  node scripts/make-icons.mjs)
  --------------------------------------------------------------
  Draws the Duikul mark as pure geometry (no fonts involved, so it
  renders identically everywhere) and writes the PNG icons into
  public/icons/ for the PWA manifest and iOS home screen.

  The mark: deep-green square, cream circle (the riverbank moon from
  the footer logo) with a dark-green "page line" through it.
*/

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const GREEN = "#0B6B4F";
const CREAM = "#FAF8F5";

/** Square SVG at 512 units. maskable = full-bleed background with
    the mark inside the central safe zone (60%). */
function iconSvg({ maskable = false, rounded = false, size = 512 } = {}) {
  const radius = rounded ? 112 : 0;
  // Safe zone for maskable icons: keep the mark within the middle 60%.
  const moonR = maskable ? 118 : 132;
  const barW = moonR * 1.15;
  const barH = moonR * 0.28;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radius}" fill="${GREEN}"/>
  <circle cx="256" cy="256" r="${moonR}" fill="${CREAM}"/>
  <rect x="${256 - barW / 2}" y="${256 - barH / 2}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="${GREEN}"/>
  <circle cx="256" cy="${256 - barH / 2 - moonR * 0.52}" r="${moonR * 0.055}" fill="${GREEN}"/>
</svg>`;
}

async function make(name, svg, size) {
  await sharp(Buffer.from(svg)).png().toFile(`public/icons/${name}`);
  console.log(`built public/icons/${name} (${size})`);
}

await mkdir("public/icons", { recursive: true });

// Browser/shortcut icons: rounded square on transparency.
await make(
  "icon-192.png",
  iconSvg({ rounded: true }).replace(/^<svg /, '<svg '),
  192
);
await make("icon-512.png", iconSvg({ rounded: true }), 512);

// Android maskable: full square, mark inside the safe zone.
await make("icon-512-maskable.png", iconSvg({ maskable: true }), 512);

// iOS home screen: full square (iOS rounds it itself).
await make("apple-touch-icon.png", iconSvg(), 180);

console.log("done");
