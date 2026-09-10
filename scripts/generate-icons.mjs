import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SOURCE = new URL("../public/IsaMed_SomenteSimbolos.webp", import.meta.url);
const ICONS_DIR = new URL("../public/icons/", import.meta.url);
const FAVICON_PATH = new URL("../public/favicon.ico", import.meta.url);
await mkdir(ICONS_DIR, { recursive: true });

const targets = [
  { name: "icon-192.png", size: 192, dir: ICONS_DIR },
  { name: "icon-512.png", size: 512, dir: ICONS_DIR },
  { name: "apple-touch-icon.png", size: 180, dir: ICONS_DIR },
];

// Os icones sao uma conveniencia de build: se a geracao falhar, avisamos e
// seguimos, em vez de derrubar o deploy inteiro.
for (const t of targets) {
  try {
    await sharp(fileURLToPath(SOURCE))
      .resize(t.size, t.size)
      .png({ compressionLevel: 9, palette: true, colors: 64 })
      .toFile(fileURLToPath(new URL(t.name, t.dir)));
    console.log(`generated ${t.name}`);
  } catch (err) {
    console.warn(`AVISO: nao foi possivel gerar ${t.name}:`, err.message);
  }
}

// favicon.ico multi-resolucao (16/32/48), para o icone aparecer certo na aba
// do navegador e em atalhos que ainda procuram esse arquivo direto na raiz.
// Desde o Windows Vista o formato ICO aceita PNG embutido, entao nao
// precisamos de nenhuma biblioteca externa so pra montar o container.
try {
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((size) => sharp(fileURLToPath(SOURCE)).resize(size, size).png().toBuffer()),
  );
  await writeFile(fileURLToPath(FAVICON_PATH), buildIco(sizes, pngBuffers));
  console.log("generated favicon.ico");
} catch (err) {
  console.warn("AVISO: nao foi possivel gerar favicon.ico:", err.message);
}

function buildIco(sizes, pngBuffers) {
  const HEADER_SIZE = 6;
  const ENTRY_SIZE = 16;
  const dataOffset0 = HEADER_SIZE + ENTRY_SIZE * sizes.length;

  const header = Buffer.alloc(HEADER_SIZE);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(sizes.length, 4); // image count

  let offset = dataOffset0;
  const entries = [];
  for (const [i, size] of sizes.entries()) {
    const entry = Buffer.alloc(ENTRY_SIZE);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // offset of image data
    entries.push(entry);
    offset += pngBuffers[i].length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}
