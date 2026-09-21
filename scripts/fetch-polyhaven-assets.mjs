import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const models = [
  'Shelf_01',
  'CheeseBox_01',
  'wooden_crate_01',
  'wooden_crate_02',
  'wooden_ladder_02',
  'hand_truck',
  'vintage_spacecraft_instrument',
  'WoodenTable_01',
  'ArmChair_01',
  'seadogs_compass',
  'vintage_suitcase',
  'Sofa_01',
  'WoodenChair_01',
  'painted_wooden_chair_01',
  'painted_wooden_bench',
  'painted_wooden_sofa'
];

const materials = [
  'smoked_walnut_veneer',
  'brown_leather',
  'leather_red_02',
  'old_stone_wall',
  'blue_plaster_weathered'
];

const root = path.resolve('assets/polyhaven');

async function download(url, destination, expectedMd5) {
  try {
    const existing = await readFile(destination);
    if (!expectedMd5 || createHash('md5').update(existing).digest('hex') === expectedMd5) return;
  } catch {}
  const response = await fetch(url, { headers: { 'User-Agent': 'Gutenberg-Athenaeum-asset-builder' } });
  if (!response.ok) throw new Error(`${response.status} while downloading ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (expectedMd5 && createHash('md5').update(bytes).digest('hex') !== expectedMd5) {
    throw new Error(`Checksum mismatch for ${url}`);
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
}

async function assetRecord(id) {
  const response = await fetch(`https://api.polyhaven.com/files/${id}`);
  if (!response.ok) throw new Error(`Poly Haven asset not found: ${id}`);
  return response.json();
}

async function fetchModel(id) {
  const files = await assetRecord(id);
  const gltf = files?.gltf?.['1k']?.gltf;
  if (!gltf?.url) throw new Error(`No 1K glTF found for ${id}`);
  const directory = path.join(root, 'models', id);
  await download(gltf.url, path.join(directory, path.basename(new URL(gltf.url).pathname)), gltf.md5);
  for (const [relativeName, file] of Object.entries(gltf.include || {})) {
    await download(file.url, path.join(directory, relativeName), file.md5);
  }
  return { id, source: `https://polyhaven.com/a/${id}`, licence: 'CC0 1.0', resolution: '1k' };
}

function findTexture(record, tokens) {
  tokens = Array.isArray(tokens) ? tokens : [tokens];
  const seen = new Set();
  let match = null;
  const visit = value => {
    if (!value || typeof value !== 'object' || seen.has(value) || match) return;
    seen.add(value);
    if (typeof value.url === 'string' && value.url.includes('_1k.') && tokens.some(token => value.url.includes(token)) && /\.(jpg|png)$/i.test(value.url)) {
      match = value;
      return;
    }
    for (const child of Object.values(value)) visit(child);
  };
  visit(record);
  return match;
}

async function fetchMaterial(id) {
  const files = await assetRecord(id);
  const directory = path.join(root, 'materials', id);
  const channels = {
    diffuse: findTexture(files, ['_diff_', '_albedo_', '_coll1_']),
    normal: findTexture(files, '_nor_gl_'),
    roughness: findTexture(files, '_rough_'),
    displacement: findTexture(files, '_disp_')
  };
  const saved = {};
  for (const [channel, file] of Object.entries(channels)) {
    if (!file) continue;
    const extension = path.extname(new URL(file.url).pathname);
    const filename = `${channel}${extension}`;
    await download(file.url, path.join(directory, filename), file.md5);
    saved[channel] = `assets/polyhaven/materials/${id}/${filename}`;
  }
  return { id, source: `https://polyhaven.com/a/${id}`, licence: 'CC0 1.0', resolution: '1k', files: saved };
}

const manifest = { generated: new Date().toISOString(), models: [], materials: [] };
for (const id of models) {
  process.stdout.write(`Model ${id}\n`);
  manifest.models.push(await fetchModel(id));
}
for (const id of materials) {
  process.stdout.write(`Material ${id}\n`);
  manifest.materials.push(await fetchMaterial(id));
}
await mkdir(root, { recursive: true });
await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
