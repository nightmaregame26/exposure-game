import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const MOCKUP_DIR = path.join(ROOT, 'assets', 'mockups');
const COMPONENT_DIR = path.join(DIST, 'assets', 'ui', 'components');
const MASTER_REFERENCE = { width: 864, height: 1536 };
const SLICE_SIZE = { width: 432, height: 192 };
const CROPS = {
  header:   { left: 0,   top: 0,    width: 864, height: 174 },
  hero:     { left: 26,  top: 174,  width: 812, height: 390 },
  news:     { left: 27,  top: 568,  width: 431, height: 202 },
  clock:    { left: 466, top: 568,  width: 372, height: 202 },
  stamina:  { left: 28,  top: 777,  width: 363, height: 171 },
  exposure: { left: 398, top: 777,  width: 440, height: 171 },
  chapter:  { left: 28,  top: 953,  width: 386, height: 239 },
  tasks:    { left: 421, top: 953,  width: 417, height: 239 },
  events:   { left: 28,  top: 1198, width: 810, height: 208 },
  nav:      { left: 14,  top: 1425, width: 837, height: 105 }
};

const EXCLUDED_ROOT_NAMES = new Set([
  '.git', '.github', '.vercel', 'node_modules', 'dist', 'scripts', 'api'
]);

async function main() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  await copyStaticProject();
  const master = await loadMasterArtwork();
  await buildPanels(master);
  console.log(`Built ${Object.keys(CROPS).length} independent UI panels into dist/assets/ui/components.`);
}

async function copyStaticProject() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDED_ROOT_NAMES.has(entry.name)) continue;
    const source = path.join(ROOT, entry.name);
    const destination = path.join(DIST, entry.name);
    if (entry.isDirectory()) {
      await fs.cp(source, destination, { recursive: true });
    } else {
      await fs.copyFile(source, destination);
    }
  }
}

async function loadMasterArtwork() {
  const composites = [];

  for (let index = 0; index < 4; index += 1) {
    const file = path.join(MOCKUP_DIR, `home-${index}.svg`);
    const svg = await fs.readFile(file, 'utf8');
    const match = svg.match(/href=["']data:image\/(?:jpeg|jpg|png|webp);base64,([^"']+)["']/i);

    if (!match) {
      throw new Error(`No embedded artwork was found in ${file}`);
    }

    const sourceBuffer = Buffer.from(match[1].replace(/\s+/g, ''), 'base64');
    const normalized = await sharp(sourceBuffer)
      .resize(SLICE_SIZE.width, SLICE_SIZE.height, { fit: 'fill' })
      .png()
      .toBuffer();

    composites.push({
      input: normalized,
      left: 0,
      top: index * SLICE_SIZE.height
    });
  }

  return sharp({
    create: {
      width: SLICE_SIZE.width,
      height: SLICE_SIZE.height * 4,
      channels: 3,
      background: '#020405'
    }
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function buildPanels(masterBuffer) {
  const metadata = await sharp(masterBuffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error('Master artwork has no usable dimensions.');
  }

  await fs.mkdir(COMPONENT_DIR, { recursive: true });
  const scaleX = metadata.width / MASTER_REFERENCE.width;
  const scaleY = metadata.height / MASTER_REFERENCE.height;

  await Promise.all(Object.entries(CROPS).map(async ([name, crop]) => {
    const region = {
      left: Math.round(crop.left * scaleX),
      top: Math.round(crop.top * scaleY),
      width: Math.max(1, Math.round(crop.width * scaleX)),
      height: Math.max(1, Math.round(crop.height * scaleY))
    };

    const pipeline = sharp(masterBuffer).extract(region);
    await Promise.all([
      pipeline.clone().webp({ quality: 94, effort: 6 }).toFile(path.join(COMPONENT_DIR, `${name}.webp`)),
      pipeline.clone().png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(path.join(COMPONENT_DIR, `${name}.png`))
    ]);
  }));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
