// Downloads the Map Room's maps (map-room.js) from Wikimedia Commons, keeping only public-domain images, and writes
// two copies of each: assets/maps/<key>.jpg (up to 2048 px, for looking closely in the map viewer) and
// assets/maps/<key>-wall.jpg (up to 768 px, for the frame on the wall). What was chosen, with its Commons page, maker
// and licence, is written to assets/maps/maps.json, which the room reads for its credits. Cloud sessions cannot reach
// Commons, so the Map images workflow runs this whenever it changes. Maps already downloaded are kept as they are.
//
// Each map names the Commons file wanted; if that file is missing or not public domain, the search is tried instead
// and the first large public-domain result is taken (the log says which).
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const MAPS = [
  { key: 'mercator', file: 'Mercator 1569.png', search: 'Mercator 1569 world map Nova et Aucta Orbis Terrae' },
  { key: 'waldseemuller', file: 'Waldseemuller map 2.jpg', search: 'Waldseemüller 1507 Universalis Cosmographia' },
  { key: 'ortelius', file: 'OrteliusWorldMap1570.jpg', search: 'Ortelius Typus Orbis Terrarum 1570' },
  { key: 'hereford', file: 'Hereford-Karte.jpg', search: 'Hereford Mappa Mundi' },
  { key: 'piri-reis', file: 'Piri reis world map 01.jpg', search: 'Piri Reis map 1513' },
  { key: 'idrisi', file: 'TabulaRogeriana.jpg', search: 'Tabula Rogeriana al-Idrisi' },
  { key: 'hondius', file: 'Nova totius Terrarum Orbis geographica ac hydrographica tabula (Hendrik Hondius) balanced.jpg', search: 'Hondius Nova totius terrarum orbis 1630' },
  { key: 'snow', file: 'Snow-cholera-map-1.jpg', search: 'John Snow cholera map 1854' },
  { key: 'cellarius', file: 'Cellarius Harmonia Macrocosmica - Planisphaerium Copernicanum.jpg', search: 'Cellarius Harmonia Macrocosmica Planisphaerium Copernicanum' },
  { key: 'treasure-island', file: 'Treasure-island-map.jpg', search: 'Treasure Island map Stevenson 1883' },
  { key: 'snark', file: 'Snark-ocean-chart.jpg', search: 'Hunting of the Snark Bellman ocean chart Holiday' },
  { key: 'catalan', file: 'Catalan Atlas BNF Sheet 6 Western Sahara.jpg', search: 'Catalan Atlas Mansa Musa' },
  { key: 'ricci', file: 'Kunyu Wanguo Quantu by Matteo Ricci.jpg', search: 'Kunyu Wanguo Quantu Ricci 1602' },
  { key: 'pacific', file: 'Ortelius - Maris Pacifici 1589.jpg', search: 'Ortelius Maris Pacifici 1589' },
  { key: 'mars', file: 'Karte Mars Schiaparelli MKL1888.png', search: 'Schiaparelli map of Mars' },
  { key: 'smith', file: 'Geological map of Great Britain.jpg', search: 'William Smith geological map 1815' },
  { key: 'speed-ireland', file: 'John Speed - The Kingdome of Irland, 1610.jpg', search: 'John Speed Kingdome of Irland' },
  { key: 'ptolemy', file: 'Claudius Ptolemy- The World.jpg', search: 'Ptolemy world map Ulm 1482' },
  { key: 'riccioli', file: 'Riccioli1651MoonMap.jpg', search: 'Riccioli 1651 moon map Almagestum Novum' },
  { key: 'de-la-cosa', file: '1500 map by Juan de la Cosa.jpg', search: 'Juan de la Cosa map 1500' }
];

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(root, 'assets/maps');
const API = 'https://commons.wikimedia.org/w/api.php';
// Wikimedia asks for a User-Agent that says who is asking.
const HEADERS = { 'User-Agent': 'LibraryAfterDark-map-room/1.0 (https://libraryafterdark.space; map images for a public-domain library)' };
const FULL = 2048, WALL = 768;

const strip = html => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, '’').replace(/\s+/g, ' ').trim();
export const isPublicDomain = meta => /public domain|^pd\b|^pd-|cc0/i.test(strip(meta?.LicenseShortName?.value)) || /^pd/i.test(strip(meta?.License?.value));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`;
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: HEADERS });
    if (response.ok) return response.json();
    if (attempt >= 4) throw new Error(`${response.status} from Commons for ${url}`);
    await new Promise(r => setTimeout(r, 2000 * attempt));
  }
}
const INFO = { prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: String(FULL) };
const usable = page => {
  const info = page?.imageinfo?.[0];
  return info && !page.missing && /jpeg|png|tiff/.test(info.mime) && Math.max(info.width, info.height) >= 1000 && isPublicDomain(info.extmetadata);
};
async function choose(map) {
  if (map.file) {
    const data = await api({ ...INFO, titles: `File:${map.file}` });
    const page = data.query?.pages?.[0];
    if (usable(page)) return page;
    console.log(`  ${map.key}: File:${map.file} ${page?.missing ? 'is not on Commons' : 'is not usable (size or licence)'}; searching instead`);
  }
  const data = await api({ ...INFO, generator: 'search', gsrsearch: map.search, gsrnamespace: '6', gsrlimit: '15' });
  const pages = (data.query?.pages || []).sort((a, b) => a.index - b.index);
  for (const page of pages) console.log(`    candidate: ${page.title} ${page.imageinfo?.[0]?.width}x${page.imageinfo?.[0]?.height} ${strip(page.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value)}`);
  return pages.find(usable) || null;
}

async function exists(file) { try { await access(file); return true } catch { return false } }
async function main() {
  await mkdir(OUT, { recursive: true });
  const manifestFile = path.join(OUT, 'maps.json');
  let manifest = {};
  try { manifest = JSON.parse(await readFile(manifestFile, 'utf8')) } catch {}
  const wanted = new Set(MAPS.map(m => m.key));
  for (const key of Object.keys(manifest)) if (!wanted.has(key)) delete manifest[key];
  let failed = 0;
  for (const map of MAPS) {
    const full = path.join(OUT, `${map.key}.jpg`), wall = path.join(OUT, `${map.key}-wall.jpg`);
    if (manifest[map.key] && await exists(full) && await exists(wall)) { console.log(`${map.key}: kept (${manifest[map.key].file})`); continue }
    try {
      const page = await choose(map);
      if (!page) { console.log(`${map.key}: NOTHING USABLE FOUND`); failed++; continue }
      const info = page.imageinfo[0], meta = info.extmetadata || {};
      const source = info.thumburl || info.url;
      const response = await fetch(source, { headers: HEADERS });
      if (!response.ok) throw new Error(`${response.status} downloading ${source}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const image = sharp(bytes, { limitInputPixels: false }).flatten({ background: '#e8dcc0' });
      const big = await image.clone().resize({ width: FULL, height: FULL, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true }).toBuffer({ resolveWithObject: true });
      const small = await image.clone().resize({ width: WALL, height: WALL, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true }).toBuffer();
      await writeFile(full, big.data); await writeFile(wall, small);
      manifest[map.key] = {
        file: page.title.replace(/^File:/, ''), page: info.descriptionurl,
        width: big.info.width, height: big.info.height,
        artist: strip(meta.Artist?.value).slice(0, 160), date: strip(meta.DateTimeOriginal?.value).slice(0, 80),
        licence: strip(meta.LicenseShortName?.value) || 'Public domain',
        description: strip(meta.ImageDescription?.value).slice(0, 400)
      };
      console.log(`${map.key}: ${page.title} -> ${big.info.width}x${big.info.height}, ${Math.round(big.data.length / 1024)} KB (wall ${Math.round(small.length / 1024)} KB) · ${manifest[map.key].licence} · ${manifest[map.key].artist} · ${manifest[map.key].date}`);
      console.log(`    ${manifest[map.key].description}`);
    } catch (error) { console.log(`${map.key}: FAILED ${error.message}`); failed++ }
  }
  const ordered = Object.fromEntries(MAPS.filter(m => manifest[m.key]).map(m => [m.key, manifest[m.key]]));
  await writeFile(manifestFile, JSON.stringify(ordered, null, 1) + '\n');
  console.log(`\n${Object.keys(ordered).length} of ${MAPS.length} maps in assets/maps; ${failed} not found.`);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error); process.exit(1) });
