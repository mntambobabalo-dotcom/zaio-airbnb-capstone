import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assets } from '../client/src/data/assets.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(root, 'scripts/image-manifest.json'), 'utf8'));
const listings = await readFile(resolve(root, 'client/src/data/listings.js'), 'utf8');
const assetSource = await readFile(resolve(root, 'client/src/data/assets.js'), 'utf8');
const references = new Set([
  ...Object.values(assets).flat(),
  ...[...listings.matchAll(/searchImage:\s*"([^"]+)"/g)].map(match => match[1]),
]);
let failures = 0;
if (/https?:\/\//.test(listings) || /https?:\/\//.test(assetSource)) {
  console.error('Image data still contains external URLs.');
  failures++;
}
for (const path of references) {
  try {
    if (!path.startsWith('/images/')) throw new Error('Expected a local image path');
    const entry = manifest.find(item => item.localPath === path);
    if (!entry) throw new Error('Missing source manifest entry');
    const bytes = await readFile(resolve(root, 'client/public', `.${path}`));
    if (createHash('sha256').update(bytes).digest('hex') !== entry.sha256) {
      throw new Error('Image checksum mismatch');
    }
  } catch (error) {
    failures++;
    console.error(`${path}: ${error.message}`);
  }
}
if (failures) process.exitCode = 1;
else console.log(`All ${references.size} referenced local images/icons are present and verified.`);
