// Downloads the pages of the Irish Room's secret Book of Kells facsimile (kells-book.js) from Wikimedia Commons,
// keeping only public-domain images, and writes each as assets/kells/<key>.jpg, fitted to the page of the facsimile
// (portrait, 1290 x 1700, the proportions of a Kells leaf, about 330 by 250 mm). What was chosen, with its Commons
// page, maker and licence, goes to assets/kells/kells.json, which the book reads for its credits. Cloud sessions cannot
// reach Commons, so the Kells images workflow runs this whenever it changes. Pages already downloaded are kept.
//
// Each page names the Commons files wanted, in order of preference. If none of them is there and public domain, the
// files in the Book of Kells categories whose names carry the folio number (KellsFol034r…, "folio 34r"…) are tried,
// then a search; the log lists the candidates and says which was taken.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const PAGES = [
  { key: '007v', files: ['KellsFol007vMadonnaChild.jpg', 'KellsFol007vVirginChild.jpg', 'Meister des Book of Kells 001.jpg'] },
  { key: '027v', files: ['KellsFol027v4Evangelists.jpg', 'KellsFol027vFourEvangelists.jpg'] },
  { key: '028v', files: ['KellsFol028vMatthew.jpg', 'KellsFol028vStMatthew.jpg', 'KellsFol028vPortraitMatthew.jpg'] },
  { key: '029r', files: ['KellsFol029rIncipitMatthew.jpg', 'KellsFol029rLiberGenerationis.jpg', 'KellsFol029rIncipMatt.jpg'] },
  { key: '032v', files: ['KellsFol032vChristEnthroned.jpg'] },
  { key: '033r', files: ['KellsFol033rCarpetPage.jpg', 'KellsFol033rCarpet.jpg'] },
  { key: '034r', files: ['KellsFol034rChiRhoMonogram.jpg', 'KellsFol034rChiRho.jpg'] },
  { key: '114r', files: ['KellsFol114rArrest.jpg', 'KellsFol114rChristArrest.jpg', 'KellsFol114rArrestChrist.jpg'] },
  { key: '188r', files: ['KellsFol188rIncipitMark.jpg', 'KellsFol188rIncipMark.jpg', 'KellsFol188rInitiumEvangelii.jpg'] },
  { key: '202v', files: ['KellsFol202vTemptation.jpg', 'KellsFol202vTemptationChrist.jpg'] },
  { key: '291v', files: ['KellsFol291vJohn.jpg', 'KellsFol291vStJohn.jpg', 'KellsFol291vPortraitJohn.jpg'] },
  { key: '292r', files: ['KellsFol292rIncipJohn.jpg', 'KellsFol292rIncipitJohn.jpg', 'KellsFol292rInPrincipio.jpg'] }
];

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(root, 'assets/kells');
const API = 'https://commons.wikimedia.org/w/api.php';
// Wikimedia asks for a User-Agent that says who is asking.
const HEADERS = { 'User-Agent': 'LibraryAfterDark-irish-room/1.0 (https://libraryafterdark.space; page images for a public-domain library)' };
export const PAGE_W = 1290, PAGE_H = 1700;
const VELLUM = '#e6d6b4';

const strip = html => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, '’').replace(/\s+/g, ' ').trim();
export const isPublicDomain = meta => /public domain|^pd\b|^pd-|cc0/i.test(strip(meta?.LicenseShortName?.value)) || /^pd/i.test(strip(meta?.License?.value));
// "034r" matches KellsFol034rChiRho.jpg, "Book of Kells folio 34r", "Kells f. 34r", but not 134r or 34v.
export const folioPattern = key => { const n = Number(key.slice(0, 3)), side = key[3]; return new RegExp(`(?:fol(?:io)?|f)[\\s._-]*0*${n}${side}(?![a-z0-9])|(?<![0-9])0*${n}${side}(?=[A-Z_ .-])`, 'i') };

async function api(params) {
  const url = `${API}?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', origin: '*', ...params })}`;
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: HEADERS });
    const body = await response.text();
    if (response.ok) { try { return JSON.parse(body) } catch { throw new Error(`Commons sent a page, not JSON: ${body.replace(/\s+/g, ' ').slice(0, 300)}`) } }
    if (attempt >= 4) throw new Error(`${response.status} from Commons for ${url}`);
    await new Promise(r => setTimeout(r, 2000 * attempt));
  }
}
const INFO = { prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: String(PAGE_W * 2) };
const describe = page => `${page.title} ${page.imageinfo?.[0]?.width}x${page.imageinfo?.[0]?.height} ${strip(page.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value)}`;
const usable = page => { const info = page?.imageinfo?.[0]; return info && !page.missing && /jpeg|png|tiff/.test(info.mime) && info.height >= 1000 && info.height > info.width && isPublicDomain(info.extmetadata) };
const area = page => (page.imageinfo?.[0]?.width || 0) * (page.imageinfo?.[0]?.height || 0);

// Every file in the Book of Kells category and its subcategories, looked up once.
let categoryFiles = null;
async function kellsCategory() {
  if (categoryFiles) return categoryFiles;
  categoryFiles = [];
  const seen = new Set(), queue = [['Category:Book of Kells', 0]];
  while (queue.length && seen.size < 40) {
    const [category, depth] = queue.shift();
    if (seen.has(category)) continue; seen.add(category);
    let cont = {};
    do {
      const data = await api({ list: 'categorymembers', cmtitle: category, cmlimit: '500', cmtype: 'file|subcat', ...cont });
      for (const m of data.query?.categorymembers || []) {
        if (m.ns === 14 && depth < 2) queue.push([m.title, depth + 1]);
        else if (m.ns === 6) categoryFiles.push(m.title);
      }
      cont = data.continue || null;
    } while (cont);
  }
  console.log(`  (${categoryFiles.length} files in ${seen.size} Book of Kells categories)`);
  return categoryFiles;
}
async function infoFor(titles) {
  const pages = [];
  for (let i = 0; i < titles.length; i += 40) pages.push(...((await api({ ...INFO, titles: titles.slice(i, i + 40).join('|') })).query?.pages || []));
  return pages;
}
async function choose(entry) {
  for (const file of entry.files) {
    const page = (await infoFor([`File:${file}`]))[0];
    if (usable(page)) return page;
    console.log(`  ${entry.key}: File:${file} ${page?.missing ? 'is not on Commons' : `is not usable (${describe(page)})`}`);
  }
  const pattern = folioPattern(entry.key);
  const named = (await kellsCategory()).filter(title => pattern.test(title.replace(/^File:/, '')));
  if (named.length) {
    const pages = await infoFor(named);
    for (const page of pages) console.log(`    category candidate: ${describe(page)}`);
    const best = pages.filter(usable).sort((a, b) => area(b) - area(a))[0];
    if (best) return best;
  }
  const n = Number(entry.key.slice(0, 3)), side = entry.key[3];
  const data = await api({ ...INFO, generator: 'search', gsrsearch: `Book of Kells folio ${n}${side}`, gsrnamespace: '6', gsrlimit: '20' });
  const found = (data.query?.pages || []).sort((a, b) => a.index - b.index);
  for (const page of found) console.log(`    search candidate: ${describe(page)}`);
  return found.find(page => usable(page) && /kells/i.test(page.title) && pattern.test(page.title.replace(/^File:/, ''))) || null;
}

async function exists(file) { try { await access(file); return true } catch { return false } }
async function main() {
  await mkdir(OUT, { recursive: true });
  const manifestFile = path.join(OUT, 'kells.json');
  let manifest = {};
  try { manifest = JSON.parse(await readFile(manifestFile, 'utf8')) } catch {}
  const wanted = new Set(PAGES.map(p => p.key));
  for (const key of Object.keys(manifest)) if (!wanted.has(key)) delete manifest[key];
  let failed = 0;
  for (const entry of PAGES) {
    const out = path.join(OUT, `${entry.key}.jpg`);
    if (manifest[entry.key] && await exists(out)) { console.log(`${entry.key}: kept (${manifest[entry.key].file})`); continue }
    try {
      const page = await choose(entry);
      if (!page) { console.log(`${entry.key}: NOTHING USABLE FOUND`); failed++; continue }
      const info = page.imageinfo[0], meta = info.extmetadata || {}, source = info.thumburl || info.url;
      const response = await fetch(source, { headers: HEADERS });
      if (!response.ok) throw new Error(`${response.status} downloading ${source}`);
      const image = sharp(Buffer.from(await response.arrayBuffer()), { limitInputPixels: false }).flatten({ background: VELLUM });
      const { width, height } = await image.metadata();
      // A scan close to the leaf's proportions fills the page (losing a sliver); any other is set on vellum.
      const fit = Math.abs(width / height - PAGE_W / PAGE_H) < .07 ? 'cover' : 'contain';
      const data = await image.resize({ width: PAGE_W, height: PAGE_H, fit, background: VELLUM }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      await writeFile(out, data);
      manifest[entry.key] = {
        file: page.title.replace(/^File:/, ''), page: info.descriptionurl, fit,
        artist: strip(meta.Artist?.value).slice(0, 160), date: strip(meta.DateTimeOriginal?.value).slice(0, 80),
        licence: strip(meta.LicenseShortName?.value) || 'Public domain', description: strip(meta.ImageDescription?.value).slice(0, 300)
      };
      console.log(`${entry.key}: ${page.title} (${width}x${height}, ${fit}) -> ${Math.round(data.length / 1024)} KB · ${manifest[entry.key].licence} · ${manifest[entry.key].artist}`);
    } catch (error) { console.log(`${entry.key}: FAILED ${error.message}`); failed++ }
  }
  const ordered = Object.fromEntries(PAGES.filter(p => manifest[p.key]).map(p => [p.key, manifest[p.key]]));
  await writeFile(manifestFile, JSON.stringify(ordered, null, 1) + '\n');
  console.log(`\n${Object.keys(ordered).length} of ${PAGES.length} pages in assets/kells; ${failed} not found.`);
  if (!Object.keys(ordered).length) process.exit(1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error); process.exit(1) });
