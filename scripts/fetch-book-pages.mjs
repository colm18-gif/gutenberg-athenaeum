// Downloads the pages of the library's fine books (book-engine.js) from Wikimedia Commons, keeping only public-domain
// images, and writes each fitted to its book's page as <dir>/<key>.jpg. What was chosen, with its Commons page, maker and
// licence, goes to the book's manifest (kells.json, kelmscott.json), which the book reads for its credits. Cloud sessions
// cannot reach Commons, so the Book images workflow runs this whenever it changes. Pages already downloaded are kept.
//
//   kells      The Irish Room's Book of Kells (kells-book.js): leaves of about 330 by 250 mm, on vellum.
//   kelmscott  The Periodicals Room's Kelmscott Chaucer (kelmscott-book.js): folio pages of about 425 by 292 mm, on
//              Morris's handmade paper.
//
// Each page names the Commons files wanted, in order of preference. If none of them is there and public domain, a book
// with a `pattern` tries the files in its categories whose names match (KellsFol034r…, "folio 34r"…), then a search;
// the log lists the candidates and says which was taken. A book with no pages yet is only surveyed: its categories and
// searches are listed in the log, so its pages can be chosen from what Commons really holds.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// "034r" matches KellsFol034rChiRho.jpg, "Book of Kells folio 34r", "Kells f. 34r", but not 134r or 34v.
export const folioPattern = key => { const n = Number(key.slice(0, 3)), side = key[3]; return new RegExp(`(?:fol(?:io)?|f)[\\s._-]*0*${n}${side}(?![a-z0-9])|(?<![0-9])0*${n}${side}(?=[A-Z_ .-])`, 'i') };

export const BOOKS = {
  kells: {
    dir: 'assets/kells', manifest: 'kells.json', width: 1290, height: 1700, paper: '#e6d6b4',
    categories: ['Category:Book of Kells'], must: /kells/i, pattern: folioPattern,
    search: key => `Book of Kells folio ${Number(key.slice(0, 3))}${key[3]}`,
    pages: [
  { key: '007v', files: ['KellsFol007vMadonnaChild.jpg', 'KellsFol007vVirginChild.jpg', 'Meister des Book of Kells 001.jpg'] },
  { key: '027v', files: ['KellsFol027v4Evang.jpg', 'KellsFol027v4Evangelists.jpg'] },
  { key: '028v', files: ['KellsFol028vMatthew.jpg', 'KellsFol028vStMatthew.jpg', 'KellsFol028vPortraitMatthew.jpg'] },
  { key: '029r', files: ['KellsFol029rIncipitMatthew.jpg', 'KellsFol029rLiberGenerationis.jpg', 'KellsFol029rIncipMatt.jpg'] },
  { key: '032v', files: ['KellsFol032vChristEnthroned.jpg'] },
  { key: '033r', files: ['KellsFol033rCarpetPage.jpg', 'KellsFol033rCarpet.jpg'] },
  { key: '034r', files: ['KellsFol034rChiRhoMonogram.jpg', 'KellsFol034rChiRho.jpg'] },
  { key: '114r', files: ['KellsFol114rArrest.jpg', 'KellsFol114rChristArrest.jpg', 'KellsFol114rArrestChrist.jpg'] },
  { key: '130r', files: ['KellsFol130rIncipitMark.jpg', 'KellsFol130rInitium.jpg'] },
  { key: '188r', files: ['KellsFol188rQuoniam.jpg'] },
  { key: '202v', files: ['KellsFol202vTemptation.jpg', 'KellsFol202vTemptationChrist.jpg'] },
  { key: '292r', files: ['KellsFol292rIncipJohn.jpg', 'KellsFol292rIncipitJohn.jpg', 'KellsFol292rInPrincipio.jpg'] }
    ]
  },
  kelmscott: {
    dir: 'assets/kelmscott', manifest: 'kelmscott.json', width: 1190, height: 1730, paper: '#ece4d0',
    categories: ['Category:Kelmscott Chaucer', 'Category:The Works of Geoffrey Chaucer (Kelmscott Press)', 'Category:Kelmscott Press'], must: /chaucer|kelmscott/i,
    survey: ['Kelmscott Chaucer', 'Works of Geoffrey Chaucer Kelmscott', 'Kelmscott Press Chaucer Burne-Jones', 'Kelmscott Chaucer page'],
    pages: []
  }
};

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const API = 'https://commons.wikimedia.org/w/api.php';
// Wikimedia asks for a User-Agent that says who is asking.
const HEADERS = { 'User-Agent': 'LibraryAfterDark-fine-books/1.0 (https://libraryafterdark.space; page images for a public-domain library)' };

const strip = html => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, '’').replace(/\s+/g, ' ').trim();
export const isPublicDomain = meta => /public domain|^pd\b|^pd-|cc0/i.test(strip(meta?.LicenseShortName?.value)) || /^pd/i.test(strip(meta?.License?.value));

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
const info = book => ({ prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: String(book.width * 2) });
const describe = page => `${page.title} ${page.imageinfo?.[0]?.width}x${page.imageinfo?.[0]?.height} ${strip(page.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value)}`;
const usable = page => { const i = page?.imageinfo?.[0]; return i && !page.missing && /jpeg|png|tiff/.test(i.mime) && i.height >= 1000 && i.height > i.width && isPublicDomain(i.extmetadata) };
const area = page => (page.imageinfo?.[0]?.width || 0) * (page.imageinfo?.[0]?.height || 0);

// Every file in a book's categories and their subcategories, looked up once.
const categoryFiles = new Map();
async function inCategories(book) {
  if (categoryFiles.has(book)) return categoryFiles.get(book);
  const files = [], seen = new Set(), queue = book.categories.map(c => [c, 0]);
  while (queue.length && seen.size < 40) {
    const [category, depth] = queue.shift();
    if (seen.has(category)) continue; seen.add(category);
    let cont = {};
    do {
      const data = await api({ list: 'categorymembers', cmtitle: category, cmlimit: '500', cmtype: 'file|subcat', ...cont });
      for (const m of data.query?.categorymembers || []) {
        if (m.ns === 14 && depth < 2) queue.push([m.title, depth + 1]);
        else if (m.ns === 6 && !files.includes(m.title)) files.push(m.title);
      }
      cont = data.continue || null;
    } while (cont);
  }
  console.log(`  (${files.length} files in ${seen.size} categories)`);
  categoryFiles.set(book, files);
  return files;
}
async function infoFor(book, titles) {
  const pages = [];
  for (let i = 0; i < titles.length; i += 40) pages.push(...((await api({ ...info(book), titles: titles.slice(i, i + 40).join('|') })).query?.pages || []));
  return pages;
}
async function choose(book, entry) {
  for (const file of entry.files) {
    const page = (await infoFor(book, [`File:${file}`]))[0];
    if (usable(page)) return page;
    console.log(`  ${entry.key}: File:${file} ${page?.missing ? 'is not on Commons' : `is not usable (${describe(page)})`}`);
  }
  if (!book.pattern) return null;
  const pattern = book.pattern(entry.key);
  const named = (await inCategories(book)).filter(title => pattern.test(title.replace(/^File:/, '')));
  if (named.length) {
    const pages = await infoFor(book, named);
    for (const page of pages) console.log(`    category candidate: ${describe(page)}`);
    const best = pages.filter(usable).sort((a, b) => area(b) - area(a))[0];
    if (best) return best;
  }
  const data = await api({ ...info(book), generator: 'search', gsrsearch: book.search(entry.key), gsrnamespace: '6', gsrlimit: '20' });
  const found = (data.query?.pages || []).sort((a, b) => a.index - b.index);
  for (const page of found) console.log(`    search candidate: ${describe(page)}`);
  return found.find(page => usable(page) && book.must.test(page.title) && pattern.test(page.title.replace(/^File:/, ''))) || null;
}
// A book with no pages yet: list what Commons holds for it, with sizes, licences and descriptions.
async function survey(name, book) {
  console.log(`\n=== ${name}: survey ===`);
  const titles = new Set(await inCategories(book));
  for (const query of book.survey || []) {
    const data = await api({ list: 'search', srsearch: query, srnamespace: '6', srlimit: '50' });
    for (const hit of data.query?.search || []) titles.add(hit.title);
  }
  const pages = (await infoFor(book, [...titles])).sort((a, b) => a.title.localeCompare(b.title));
  for (const page of pages) {
    const meta = page.imageinfo?.[0]?.extmetadata || {};
    console.log(`${usable(page) ? 'USABLE ' : '       '}${describe(page)} | ${strip(meta.ImageDescription?.value).slice(0, 160)}`);
  }
  console.log(`=== ${pages.length} files, ${pages.filter(usable).length} usable ===`);
}

async function exists(file) { try { await access(file); return true } catch { return false } }
async function fetchBook(name, book) {
  if (!book.pages.length) return survey(name, book);
  const OUT = path.join(root, book.dir);
  await mkdir(OUT, { recursive: true });
  const manifestFile = path.join(OUT, book.manifest);
  let manifest = {};
  try { manifest = JSON.parse(await readFile(manifestFile, 'utf8')) } catch {}
  const wanted = new Set(book.pages.map(p => p.key));
  for (const key of Object.keys(manifest)) if (!wanted.has(key)) delete manifest[key];
  let failed = 0;
  for (const entry of book.pages) {
    const out = path.join(OUT, `${entry.key}.jpg`);
    if (manifest[entry.key] && await exists(out)) { console.log(`${entry.key}: kept (${manifest[entry.key].file})`); continue }
    try {
      const page = await choose(book, entry);
      if (!page) { console.log(`${entry.key}: NOTHING USABLE FOUND`); failed++; continue }
      const i = page.imageinfo[0], meta = i.extmetadata || {}, source = i.thumburl || i.url;
      const response = await fetch(source, { headers: HEADERS });
      if (!response.ok) throw new Error(`${response.status} downloading ${source}`);
      const image = sharp(Buffer.from(await response.arrayBuffer()), { limitInputPixels: false }).flatten({ background: book.paper });
      const { width, height } = await image.metadata();
      // A scan close to the page's proportions fills it (losing a sliver); any other is set on the book's paper.
      const fit = entry.fit || (Math.abs(width / height - book.width / book.height) < .07 ? 'cover' : 'contain');
      const data = await image.resize({ width: book.width, height: book.height, fit, background: book.paper }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      await writeFile(out, data);
      manifest[entry.key] = {
        file: page.title.replace(/^File:/, ''), page: i.descriptionurl, fit,
        artist: strip(meta.Artist?.value).slice(0, 160), date: strip(meta.DateTimeOriginal?.value).slice(0, 80),
        licence: strip(meta.LicenseShortName?.value) || 'Public domain', description: strip(meta.ImageDescription?.value).slice(0, 300)
      };
      console.log(`${entry.key}: ${page.title} (${width}x${height}, ${fit}) -> ${Math.round(data.length / 1024)} KB · ${manifest[entry.key].licence} · ${manifest[entry.key].artist}`);
    } catch (error) { console.log(`${entry.key}: FAILED ${error.message}`); failed++ }
  }
  const ordered = Object.fromEntries(book.pages.filter(p => manifest[p.key]).map(p => [p.key, manifest[p.key]]));
  await writeFile(manifestFile, JSON.stringify(ordered, null, 1) + '\n');
  console.log(`\n${name}: ${Object.keys(ordered).length} of ${book.pages.length} pages in ${book.dir}; ${failed} not found.`);
  return Object.keys(ordered).length;
}
async function main() {
  let empty = 0;
  for (const [name, book] of Object.entries(BOOKS)) if ((await fetchBook(name, book)) === 0) empty++;
  if (empty) process.exit(1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error); process.exit(1) });
