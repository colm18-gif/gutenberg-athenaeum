// Downloads the Map Room's maps (map-room.js) from Wikimedia Commons, keeping only public-domain images, and writes
// two copies of each: assets/maps/<key>.jpg (up to 2048 px, for looking closely in the map viewer) and
// assets/maps/<key>-wall.jpg (up to 768 px, for the frame on the wall). What was chosen, with its Commons page, maker
// and licence, is written to assets/maps/maps.json, which the room reads for its credits. Cloud sessions cannot reach
// Commons, so the Map images workflow runs this whenever it changes. Maps already downloaded are kept as they are.
//
// Each map names the Commons file wanted; if that file is missing or not public domain, the search is tried instead
// and the first large public-domain result is taken (the log says which). `minSize` asks for a larger image than
// usual, `exclude` passes over results whose names match, and `rotate` turns a scan the right way up. One map, the
// Bellman's chart from The Hunting of the Snark, is only on Commons inside scanned books, so it is drawn here instead
// (`drawn`), after the poem, and credited as the library's own copy.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const MAPS = [
  { key: 'mercator', files: ['Mercator 1569 world map composite.jpg', 'Mercator World Map 1569.jpg', 'Mercator 1569 world map.jpg', 'Mercator 1569.png'], search: 'Mercator 1569 world map', exclude: /\bof \d+\)|detail|crop|projection|globe|portrait/i },
  { key: 'waldseemuller', file: 'Waldseemuller map 2.jpg', search: 'Waldseemüller 1507 Universalis Cosmographia' },
  { key: 'ortelius', file: 'OrteliusWorldMap1570.jpg', search: 'Ortelius Typus Orbis Terrarum 1570' },
  { key: 'hereford', file: 'Hereford-Karte.jpg', search: 'Hereford Mappa Mundi' },
  { key: 'piri-reis', file: 'Piri reis world map 01.jpg', search: 'Piri Reis map 1513' },
  { key: 'idrisi', file: 'TabulaRogeriana.jpg', search: 'Tabula Rogeriana al-Idrisi' },
  { key: 'hondius', file: 'Nova totius Terrarum Orbis geographica ac hydrographica tabula (Hendrik Hondius) balanced.jpg', search: 'Hondius Nova totius terrarum orbis 1630' },
  { key: 'snow', file: 'Snow-cholera-map-1.jpg', search: 'John Snow cholera map 1854' },
  { key: 'cellarius', file: 'Cellarius Harmonia Macrocosmica - Planisphaerium Copernicanum.jpg', search: 'Cellarius Harmonia Macrocosmica Planisphaerium Copernicanum' },
  { key: 'treasure-island', file: 'Treasure-island-map.jpg', search: 'Treasure Island map Stevenson 1883' },
  { key: 'snark', drawn: true },
  { key: 'catalan', file: 'Catalan Atlas BNF Sheet 6 Western Sahara.jpg', search: 'Catalan Atlas Mansa Musa' },
  { key: 'ricci', file: 'Kunyu Wanguo Quantu by Matteo Ricci.jpg', search: 'Kunyu Wanguo Quantu Ricci 1602' },
  { key: 'pacific', file: 'Ortelius - Maris Pacifici 1589.jpg', search: 'Ortelius Maris Pacifici 1589' },
  { key: 'mars', file: 'Karte Mars Schiaparelli MKL1888.png', search: 'Schiaparelli map of Mars' },
  { key: 'smith', file: 'Geological map Britain William Smith 1815.jpg', search: 'William Smith 1815 delineation of the strata of England and Wales', exclude: /Woodward|1904/i },
  { key: 'speed-ireland', file: 'John Speed - The Kingdome of Irland, 1610.jpg', search: 'John Speed Kingdome of Irland' },
  { key: 'ptolemy', file: 'Claudius Ptolemy- The World.jpg', search: 'Ptolemy world map Ulm 1482' },
  { key: 'riccioli', file: 'Riccioli1651MoonMap.jpg', search: 'Riccioli 1651 moon map Almagestum Novum' },
  { key: 'de-la-cosa', file: '1500 map by Juan de la Cosa.jpg', search: 'Juan de la Cosa map 1500', rotate: -90 }
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
  const url = `${API}?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', origin: '*', ...params })}`;
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: HEADERS });
    const body = await response.text();
    if (response.ok) { try { return JSON.parse(body) } catch { throw new Error(`Commons sent a page, not JSON (${response.headers.get('content-type')}): ${body.replace(/\s+/g, ' ').slice(0, 600)}`) } }
    if (attempt >= 4) throw new Error(`${response.status} from Commons for ${url}`);
    await new Promise(r => setTimeout(r, 2000 * attempt));
  }
}
const INFO = { prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: String(FULL) };
const usable = (page, map = {}) => {
  const info = page?.imageinfo?.[0];
  return info && !page.missing && /jpeg|png|tiff/.test(info.mime) && Math.max(info.width, info.height) >= (map.minSize || 1000) && !map.exclude?.test(page.title) && isPublicDomain(info.extmetadata);
};
async function choose(map) {
  // The files named, in order of preference; the first that is there and usable is taken.
  for (const file of map.files || (map.file ? [map.file] : [])) {
    const data = await api({ ...INFO, titles: `File:${file}` });
    const page = data.query?.pages?.[0];
    if (usable(page, map)) return page;
    console.log(`  ${map.key}: File:${file} ${page?.missing ? 'is not on Commons' : `is not usable (${page?.imageinfo?.[0]?.width}x${page?.imageinfo?.[0]?.height}, ${strip(page?.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value)})`}`);
  }
  if (map.file || map.files) console.log(`  ${map.key}: searching instead`);
  const data = await api({ ...INFO, generator: 'search', gsrsearch: map.search, gsrnamespace: '6', gsrlimit: '15' });
  const pages = (data.query?.pages || []).sort((a, b) => a.index - b.index);
  for (const page of pages) console.log(`    candidate: ${page.title} ${page.imageinfo?.[0]?.width}x${page.imageinfo?.[0]?.height} ${strip(page.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value)}`);
  return pages.find(page => usable(page, map)) || null;
}

// The Bellman's chart: "a large map representing the sea, without the least vestige of land", with Mercator's North
// Poles and Equators, Tropics, Zones and Meridian Lines round its edges, as the crew wished.
export function snarkSvg(W = 2048, H = 1500) {
  const m = 120, label = (text, x, y, size = 46, rotate = 0) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" transform="rotate(${rotate} ${x} ${y})">${text}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#efe6cf"/><rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="none" stroke="#3a2c1c" stroke-width="6"/>
  <rect x="${m}" y="${m}" width="${W - 2 * m}" height="${H - 2 * m}" fill="#f6efdc" stroke="#3a2c1c" stroke-width="5"/>
  <g font-family="DejaVu Serif, Georgia, serif" fill="#2a1d10" letter-spacing="6">
  ${label('NORTH POLE', W / 2, 88)}${label('SOUTH POLE', W / 2, H - 52)}${label('EQUATOR', 72, H / 2, 40, -90)}${label('EQUATOR', W - 72, H / 2, 40, 90)}
  ${label('TROPICS', W * .2, 88, 34)}${label('ZONES', W * .8, 88, 34)}${label('MERIDIAN LINES', W * .2, H - 52, 34)}${label('TORRID ZONE', W * .8, H - 52, 34)}
  ${label('LATITUDE', 72, H * .2, 30, -90)}${label('LONGITUDE', W - 72, H * .8, 30, 90)}
  <text x="${W / 2}" y="${m + 110}" font-size="70" text-anchor="middle" font-style="italic" letter-spacing="10">OCEAN-CHART</text>
  <g transform="translate(${W / 2 - 300} ${H - m - 90})"><rect width="600" height="16" fill="none" stroke="#2a1d10" stroke-width="3"/><rect width="150" height="16" fill="#2a1d10"/><rect x="300" width="150" height="16" fill="#2a1d10"/>
  <text x="300" y="-14" font-size="28" text-anchor="middle" letter-spacing="2">Scale of Miles</text></g></g></svg>`;
}
async function drawSnark(full, wall) {
  const image = sharp(Buffer.from(snarkSvg()));
  const big = await image.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  await writeFile(full, big.data); await writeFile(wall, await image.clone().resize({ width: WALL }).jpeg({ quality: 78, mozjpeg: true }).toBuffer());
  return { file: null, page: null, drawn: true, width: big.info.width, height: big.info.height, artist: 'Drawn for the library, after the poem and Henry Holiday’s chart of 1876', date: '1876', licence: 'Public domain', description: 'The Bellman’s map from The Hunting of the Snark: a perfect and absolute blank.' };
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
      if (map.drawn) { manifest[map.key] = await drawSnark(full, wall); console.log(`${map.key}: drawn after the poem`); continue }
      const page = await choose(map);
      if (!page) { console.log(`${map.key}: NOTHING USABLE FOUND`); failed++; continue }
      const info = page.imageinfo[0], meta = info.extmetadata || {};
      const source = info.thumburl || info.url;
      const response = await fetch(source, { headers: HEADERS });
      if (!response.ok) throw new Error(`${response.status} downloading ${source}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const image = sharp(bytes, { limitInputPixels: false }).rotate(map.rotate || 0).flatten({ background: '#e8dcc0' });
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
  if (!Object.keys(ordered).length) process.exit(1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error); process.exit(1) });
