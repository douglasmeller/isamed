import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SOURCE = new URL("../public/IsaMed_SomenteSimbolos.png", import.meta.url);
const ICONS_DIR = new URL("../public/icons/", import.meta.url);
await mkdir(ICONS_DIR, { recursive: true });

const targets = [
  { name: "icon-192.png", size: 192, dir: ICONS_DIR },
  { name: "apple-touch-icon.png", size: 180, dir: ICONS_DIR },
];

for (const t of targets) {
  await sharp(fileURLToPath(SOURCE))
    .resize(t.size, t.size)
    .png({ compressionLevel: 9, palette: true, colors: 64 })
    .toFile(fileURLToPath(new URL(t.name, t.dir)));
  console.log(`generated ${t.name}`);
}
