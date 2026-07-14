import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const EXCLUDED_ROOT_NAMES = new Set([
  '.git',
  '.github',
  '.vercel',
  'node_modules',
  'dist',
  'scripts',
  'api'
]);

async function copyEntry(entry) {
  const source = path.join(ROOT, entry.name);
  const destination = path.join(DIST, entry.name);

  if (entry.isDirectory()) {
    await fs.cp(source, destination, { recursive: true });
    return;
  }

  if (entry.isFile()) {
    await fs.copyFile(source, destination);
  }
}

async function main() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const staticEntries = entries.filter(entry => !EXCLUDED_ROOT_NAMES.has(entry.name));

  for (const entry of staticEntries) {
    await copyEntry(entry);
  }

  console.log(`Copied ${staticEntries.length} static Exposure project entries into dist.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
