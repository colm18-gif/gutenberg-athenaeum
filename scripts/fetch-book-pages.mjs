// Downloads the pages of the library's fine books (book-engine.js) from Wikimedia Commons, keeping only public-domain
// images, and writes each fitted to its book's page as <dir>/<key>.jpg. What was chosen, with its Commons page, maker and
// licence, goes to the book's manifest (kells.json, kelmscott.json), which the book reads for its credits. Cloud sessions
// cannot reach Commons, so the Book images workflow runs this whenever it changes. Pages already downloaded are kept.
//
//   kells      The Irish Room's Book of Kells (kells-book.js): leaves of about 330 by 250 mm, on vellum.
//   durrow     The Irish Room's Book of Durrow (durrow-book.js): leaves of about 245 by 145 mm, on vellum.
//   kelmscott  The Periodicals Room's Kelmscott Chaucer (kelmscott-book.js): folio pages of about 425 by 292 mm, on
//              Morris's handmade paper.
//   vesalius   The Medicine Room's Fabrica (vesalius-book.js): Andreas Vesalius's De humani corporis fabrica (Basel, 1543),
//              folio leaves of about 420 by 280 mm.
//
// Each page names the Commons files wanted, in order of preference. If none of them is there and public domain, a book
// with a `pattern` tries the files in its categories whose names match (KellsFol034r…, "folio 34r"…), then a search;
// the log lists the candidates and says which was taken. The pages a book's room shows in its glass case or on its walls
// (`display`) are also written small, as <key>-case.jpg, so the room does not load the full pages to show them. A book with no pages yet is only surveyed: its categories and
// searches are listed in the log, so its pages can be chosen from what Commons really holds.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// "034r" matches KellsFol034rChiRho.jpg, "Book of Kells folio 34r", "Kells f. 34r", but not 134r or 34v.
export const folioPattern = key => { const n = Number(key.slice(0, 3)), side = key[3]; return new RegExp(`(?:fol(?:io)?|f)[\\s._-]*0*${n}${side}(?![a-z0-9])|(?<![0-9])0*${n}${side}(?=[A-Z_ .-])`, 'i') };

export const BOOKS = {
  kells: {
    dir: 'assets/kells', manifest: 'kells.json', width: 1290, height: 1700, paper: '#e6d6b4',
    categories: ['Category:Book of Kells'], must: /kells/i, pattern: folioPattern, display: ['032v', '033r'],
    search: key => `Book of Kells folio ${Number(key.slice(0, 3))}${key[3]}`,
    pages: [
  { key: '005r', files: ['KellsFol005rCanonTable.jpg', 'KellsFol005rCanon.jpg'] },
  { key: '007v', files: ['KellsFol007vMadonnaChild.jpg', 'KellsFol007vVirginChild.jpg', 'Meister des Book of Kells 001.jpg'] },
  { key: '008r', files: ['KellsFol008rBrevCausMatt.jpg'] },
  { key: '027v', files: ['KellsFol027v4Evang.jpg', 'KellsFol027v4Evangelists.jpg'] },
  { key: '028v', files: ['KellsFol028vMatthew.jpg', 'KellsFol028vStMatthew.jpg', 'KellsFol028vPortraitMatthew.jpg'] },
  { key: '029r', files: ['KellsFol029rIncipitMatthew.jpg', 'KellsFol029rLiberGenerationis.jpg', 'KellsFol029rIncipMatt.jpg'] },
  { key: '032v', files: ['KellsFol032vChristEnthroned.jpg'] },
  { key: '033r', files: ['KellsFol033rCarpetPage.jpg', 'KellsFol033rCarpet.jpg'] },
  { key: '034r', files: ['KellsFol034rChiRhoMonogram.jpg', 'KellsFol034rChiRho.jpg'] },
  { key: '114r', files: ['KellsFol114rArrest.jpg', 'KellsFol114rChristArrest.jpg', 'KellsFol114rArrestChrist.jpg'] },
  { key: '130r', files: ['KellsFol130rIncipitMark.jpg', 'KellsFol130rInitium.jpg'] },
  { key: '183r', files: ['KellsFol183rEratAutem.jpg', 'KellsFol183rErat.jpg'] },
  { key: '188r', files: ['KellsFol188rQuoniam.jpg'] },
  { key: '200r', files: ['KellsFol200rGenealogy.jpg', 'KellsFol200rQuiFuit.jpg'] },
  { key: '202v', files: ['KellsFol202vTemptation.jpg', 'KellsFol202vTemptationChrist.jpg'] },
  { key: '203r', files: ['KellsFol203rIesusAutem.jpg'] },
  { key: '292r', files: ['KellsFol292rIncipJohn.jpg', 'KellsFol292rIncipitJohn.jpg', 'KellsFol292rInPrincipio.jpg'] },
  { key: '309r', files: ['KellsFol309r.jpg'] }
    ]
  },
  // The Irish Room's secret since the Book of Kells went on show: the Book of Durrow (Trinity College Dublin, MS 57), the
  // older Gospel book of Colum Cille's community, leaves of about 245 by 145 mm. Its pages were chosen from a survey of Commons.
  durrow: {
    dir: 'assets/durrow', manifest: 'durrow.json', width: 1000, height: 1690, paper: '#e2d2ae',
    categories: ['Category:Book of Durrow'], must: /durrow/i, pattern: folioPattern,
    search: key => `Book of Durrow folio ${Number(key.slice(0, 3))}${key[3]}`,
    survey: ['Book of Durrow', 'Durrow carpet page', 'Durrow folio'], surveyOnly: /durrow/i,
    // Chosen from the survey: the man, the opening of Mark, the calf, and two carpet pages.
    pages: [
  { key: '021v', files: ['Meister des Book of Durrow 001.jpg', 'DurrowFol21vMan.jpg'] },
  { key: '086r', files: ['BookDurrowInitMark86r.jpg', 'BookOfDurrowBeginMarkGospel.jpg'] },
  { key: '124v', files: ['Book of Durrow - TCL Ms57 (Ox).jpg'] },
  { key: '125v', files: ['BookOfDurrowFolio125vCarpetPage.jpg'] },
  { key: '192v', files: ['Book of Durrow folio 192v.png', 'Meister des Book of Durrow 002.jpg'] }
    ]
  },
  kelmscott: {
    dir: 'assets/kelmscott', manifest: 'kelmscott.json', width: 1190, height: 1730, paper: '#ece4d0',
    categories: ['Category:Kelmscott Chaucer', 'Category:The Works of Geoffrey Chaucer (Kelmscott Press)', 'Category:Kelmscott Press'], must: /chaucer|kelmscott/i,
    survey: ['Works of Geoffrey Chaucer newly imprinted', 'Kelmscott Chaucer leaf'], surveyOnly: /chaucer|805K/i,
    // The whole book, scanned by the Internet Archive (568 pages; its page 13 is the book's page 1, so a page's number is
    // its place in the scan less twelve). The woodcut title and seven openings, each a pair of pages as Morris designed
    // them, chosen from contact sheets of the scan.
    scan: 'The works of Geoffrey Chaucer - now newly imprinted. (Colophon- Here ends the Book of the Works of Geoffrey Chaucer (IA worksofgeoffreyc00chau 0).pdf',
    pages: [
      { key: 'p000', scan: 12 },
      { key: 'p001', scan: 13 },
      { key: 'p030', scan: 42 },
      { key: 'p031', scan: 43 },
      { key: 'p114', scan: 126 },
      { key: 'p115', scan: 127 },
      { key: 'p222', scan: 234 },
      { key: 'p223', scan: 235 },
      { key: 'p240', scan: 252 },
      { key: 'p241', scan: 253 },
      { key: 'p312', scan: 324 },
      { key: 'p313', scan: 325 },
      { key: 'p470', scan: 482 },
      { key: 'p471', scan: 483 },
      { key: 'p552', scan: 564 },
      { key: 'p553', scan: 565 }
    ]
  },
  // The Medicine Room's great book: the Fabrica of 1543, Vesalius's anatomy, with the woodcuts of Titian's workshop, folio
  // leaves of about 420 by 280 mm. Its pages were chosen from a survey of Commons: the title, Vesalius's portrait, the three
  // skeletons, four of the muscle men, a page of text, and the arteries, the nerves and the organs of nutrition. The plates
  // are named for their page in the 1543 edition, as the scans are.
  vesalius: {
    dir: 'assets/vesalius', manifest: 'vesalius.json', width: 1190, height: 1780, paper: '#e8dcc0',
    categories: ['Category:De humani corporis fabrica'], must: /vesal|fabrica/i,
    survey: ['De humani corporis fabrica 1543', 'Vesalius Fabrica woodcut', 'Vesalius 1543 plate', 'Vesalius muscle man', 'Vesalius skeleton'],
    surveyOnly: /vesal|fabrica/i, display: ['title', 'portrait', 'p164', 'p165'],
    pages: [
  { key: 'title', files: ['Vesalius Fabrica fronticepiece.jpg', 'Vesalius01.jpg', 'Fabrica titlepg frc.png'] },
  { key: 'portrait', files: ["Portrait of Andreas Vesalius, half-length in profile standing in front of a table dissecting the arm of a body; frontispiece to Andreas Vesalius 'De humani corporis fabrica libri septem' MET DP853465.jpg", 'Vesalius Fabrica portrait.jpg'] },
  { key: 'p163', files: ['Vesalius Fabrica p163.jpg'] },
  { key: 'p164', files: ['Vesalius Fabrica p164.jpg', 'Vesalius 164frc.png'] },
  { key: 'p165', files: ['Vesalius Fabrica p165.jpg'] },
  { key: 'p174', files: ['Vesalius Fabrica p174.jpg', 'Houghton Typ 565.43.868 - De humani corporis fabrica, 174.jpg'] },
  { key: 'p178', files: ['Vesalius Fabrica p178.jpg'] },
  { key: 'p184', files: ['Vesalius Fabrica p184.jpg'] },
  { key: 'p194', files: ['Vesalius Fabrica p194.jpg'] },
  { key: 'p239', files: ['De Humani Corporis Fabrica Libri Septem, page 239.jpg'] },
  { key: 'p295', files: ['Vesalius Fabrica p295.jpg'] },
  { key: 'p332', files: ['Vesalius Fabrica p332.jpg'] },
  { key: 'p355', files: ['Vesalius Fabrica p355.jpg'] }
    ]
  },
  // The Restricted Catalogue's book: the Voynich Manuscript (Yale, Beinecke Library, MS 408), in a script nobody has
  // read, leaves of about 235 by 162 mm, on vellum. Its pages were chosen from a survey of Commons: the Beinecke's own
  // photographs, numbered in the manuscript's order (1 is the front cover, 3 is folio 1r; lost leaves, such as folio 12
  // and folios 59 to 64, have none, and a fold-out is one photograph), checked against the folio numbers written on the
  // rectos. Each page is named for its folio. Real openings, one from each part of the book.
  voynich: {
    dir: 'assets/voynich', manifest: 'voynich.json', width: 1160, height: 1690, paper: '#e4d6b6',
    categories: ['Category:Voynich manuscript'], must: /voynich/i, display: ['009v', '010r'],
    // The whole manuscript (voynich-book.js reads it page by page from Commons): Voynich Manuscript (IA voynich MS 408).pdf,
    // 214 images, each one ahead of the photographs above; its openings were looked at with `openings` and `surveyOpenings`.
    pages: [
  { key: '001r', files: ['Voynich Manuscript (3).jpg'] },
  { key: '009v', files: ['Voynich Manuscript (20).jpg'] },
  { key: '010r', files: ['Voynich Manuscript (21).jpg'] },
  { key: '055v', files: ['Voynich Manuscript (110).jpg'] },
  { key: '056r', files: ['DroseraVoynichManuscriptF56r.jpg', 'Voynich Manuscript (111).jpg'] },
  { key: '070v1', files: ['Voynich Manuscript (128).jpg'] },
  { key: '071r', files: ['Voynich Manuscript (129).jpg'] },
  { key: '077v', files: ['Voynich Manuscript (140).jpg'] },
  { key: '078r', files: ['Voynich Manuscript (141).jpg'] },
  { key: 'rosettes', files: ['Voynich Manuscript (158).jpg'], wide: true },
  { key: '099v', files: ['Voynich Manuscript (176).jpg'] },
  { key: '100r', files: ['Voynich Manuscript (177).jpg'] },
  { key: '102v', files: ['Voynich Manuscript (182).jpg'] },
  { key: '103r', files: ['Voynich Manuscript (183).jpg'] },
  { key: '116v', files: ['Voynich Manuscript (206).jpg'] }
    ]
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
const describe = page => `${page.title} ${page.imageinfo?.[0]?.width}x${page.imageinfo?.[0]?.height}${page.imageinfo?.[0]?.pagecount ? ` (${page.imageinfo[0].pagecount} pages)` : ''} ${strip(page.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value)}`;
// A page is upright, unless it is a fold-out opened flat (`wide`).
const usable = (page, wide = false) => { const i = page?.imageinfo?.[0]; return i && !page.missing && /jpeg|png|tiff/.test(i.mime) && i.height >= 1000 && (wide || i.height > i.width) && isPublicDomain(i.extmetadata) };
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
  // A page of the book's scan: the scan's file, rendered at that page.
  if (entry.scan) {
    const page = (await api({ ...info(book), iiurlparam: `page${entry.scan}-${book.width * 2}px`, titles: `File:${book.scan}` })).query?.pages?.[0];
    const i = page?.imageinfo?.[0];
    if (!i || page.missing || !isPublicDomain(i.extmetadata)) { console.log(`  ${entry.key}: the scan is not usable`); return null }
    return page;
  }
  for (const file of entry.files) {
    const page = (await infoFor(book, [`File:${file}`]))[0];
    if (usable(page, entry.wide)) return page;
    console.log(`  ${entry.key}: File:${file} ${page?.missing ? 'is not on Commons' : `is not usable (${describe(page)})`}`);
  }
  if (!book.pattern) return null;
  const pattern = book.pattern(entry.key);
  const named = (await inCategories(book)).filter(title => pattern.test(title.replace(/^File:/, '')));
  if (named.length) {
    const pages = await infoFor(book, named);
    for (const page of pages) console.log(`    category candidate: ${describe(page)}`);
    const best = pages.filter(p => usable(p)).sort((a, b) => area(b) - area(a))[0];
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
  const titles = new Set((await inCategories(book)).filter(t => !book.surveyOnly || book.surveyOnly.test(t)));
  for (const query of book.survey || []) {
    const data = await api({ list: 'search', srsearch: query, srnamespace: '6', srlimit: '100' });
    for (const hit of data.query?.search || []) if (!book.surveyOnly || book.surveyOnly.test(hit.title)) titles.add(hit.title);
  }
  const pages = (await infoFor(book, [...titles])).sort((a, b) => a.title.localeCompare(b.title));
  for (const page of pages) {
    const meta = page.imageinfo?.[0]?.extmetadata || {};
    console.log(`${usable(page) ? 'USABLE ' : '       '}${describe(page)} | ${strip(meta.ImageDescription?.value).slice(0, 160)}`);
  }
  console.log(`=== ${pages.length} files, ${pages.filter(p => usable(p)).length} usable ===`);
  if (book.openings) await openingSheets(book);
  // thumbs: 'usable' draws only the files the book could take (public domain, upright, large), at most 20 sheets.
  if (book.thumbs) await thumbSheets(book, pages.filter(p => book.thumbs === 'usable' ? usable(p) : (p.imageinfo?.[0]?.height || 0) >= 900 && /jpeg|png|tiff/.test(p.imageinfo?.[0]?.mime || '')).slice(0, book.thumbLimit || 160));
}
// Survey pictures of single files, numbered, eight to a sheet with their names, to be looked at and then removed.
async function thumbSheets(book, pages) {
  const OUT = path.join(root, book.dir, 'survey');
  await mkdir(OUT, { recursive: true });
  const TW = 300, TH = 440, PER = 8;
  for (let k = 0; k < pages.length; k += PER) {
    const cells = [], group = pages.slice(k, k + PER);
    for (const [n, page] of group.entries()) {
      const left = (n % 4) * TW, top = Math.floor(n / 4) * (TH + 40);
      try {
        const thumb = (await api({ prop: 'imageinfo', iiprop: 'url', iiurlwidth: '300', titles: page.title })).query.pages[0].imageinfo[0].thumburl;
        const r = await fetch(thumb, { headers: HEADERS });
        cells.push({ input: await sharp(Buffer.from(await r.arrayBuffer())).resize({ width: TW - 8, height: TH, fit: 'inside' }).toBuffer(), left: left + 4, top: top + 40 });
      } catch (error) { console.log(`  ${page.title}: ${error.message}`) }
      const label = `${k + n + 1}. ${page.title.replace(/^File:/, '').slice(0, 34)}`.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      cells.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="36"><text x="4" y="24" font-size="15" font-family="DejaVu Sans" fill="#ff0">${label}</text></svg>`), left, top });
    }
    const name = `files-${String(k / PER + 1).padStart(2, '0')}.jpg`;
    await sharp({ create: { width: TW * 4, height: (TH + 40) * Math.ceil(group.length / 4), channels: 3, background: '#222' } }).composite(cells).jpeg({ quality: 78 }).toFile(path.join(OUT, name));
    console.log(`${name}: ${group.map((p, n) => `${k + n + 1}=${p.title.replace(/^File:/, '')}`).join(' | ')}`);
  }
}
// Survey pictures, committed to <dir>/survey to be looked at and then removed: openings of a scanned book drawn side by
// side, three to a sheet, large enough to read their headings.
async function openingSheets(book) {
  const OUT = path.join(root, book.dir, 'survey');
  await mkdir(OUT, { recursive: true });
  const get = async url => { for (let attempt = 1; ; attempt++) { const r = await fetch(url, { headers: HEADERS }); if (r.ok) return Buffer.from(await r.arrayBuffer()); if (attempt >= 5) throw new Error(`${r.status} for ${url}`); await new Promise(res => setTimeout(res, 1500 * attempt)) } };
  const first = (await api({ prop: 'imageinfo', iiprop: 'url|size', iiurlwidth: '450', iiurlparam: 'page1-450px', titles: `File:${book.scan}` })).query.pages[0].imageinfo[0].thumburl;
  console.log(`openings from ${first}`);
  if (!/page1-\d+px/.test(first)) throw new Error('the scan\'s thumbnail address does not name its page');
  const PW = 450, PH = 680, PER = 3;
  for (let k = 0; k < book.openings.length; k += PER) {
    const cells = [], group = book.openings.slice(k, k + PER);
    for (const [row, pair] of group.entries()) for (const [col, n] of pair.entries()) {
      try { cells.push({ input: await sharp(await get(first.replace(/page1-(\d+)px/, `page${n}-$1px`))).resize({ width: PW, height: PH - 24, fit: 'inside' }).toBuffer(), left: col * PW, top: row * PH + 24 }) } catch (error) { console.log(`  page ${n}: ${error.message}`) }
      cells.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="22"><text x="6" y="17" font-size="18" font-family="DejaVu Sans" fill="#ff0">${book.openingLabel ? book.openingLabel(n) : `pdf ${n} = page ${n - 12}`}</text></svg>`), left: col * PW, top: row * PH });
    }
    const name = `openings-${String(k / PER + 1).padStart(2, '0')}.jpg`;
    await sharp({ create: { width: PW * 2, height: PH * group.length, channels: 3, background: '#222' } }).composite(cells).jpeg({ quality: 78 }).toFile(path.join(OUT, name));
    console.log(`${name}: ${group.map(p => p.join('|')).join(', ')}`);
  }
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
      // Commons answers 429 when asked for many large files in a row: wait and ask again.
      let response;
      for (let attempt = 1; ; attempt++) {
        response = await fetch(source, { headers: HEADERS });
        if (response.status !== 429 || attempt >= 5) break;
        await new Promise(res => setTimeout(res, 4000 * attempt));
      }
      if (!response.ok) throw new Error(`${response.status} downloading ${source}`);
      const image = sharp(Buffer.from(await response.arrayBuffer()), { limitInputPixels: false }).flatten({ background: book.paper });
      const { width, height } = await image.metadata();
      // A scan close to the page's proportions fills it (losing a sliver); any other is set on the book's paper.
      const fit = entry.fit || (Math.abs(width / height - book.width / book.height) < .07 ? 'cover' : 'contain');
      const data = await image.resize({ width: book.width, height: book.height, fit, background: book.paper }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      await writeFile(out, data);
      manifest[entry.key] = {
        file: page.title.replace(/^File:/, ''), page: i.descriptionurl + (entry.scan ? `?page=${entry.scan}` : ''), fit, ...(entry.scan ? { scanPage: entry.scan } : {}),
        artist: strip(meta.Artist?.value).slice(0, 160), date: strip(meta.DateTimeOriginal?.value).slice(0, 80),
        licence: strip(meta.LicenseShortName?.value) || 'Public domain', description: strip(meta.ImageDescription?.value).slice(0, 300)
      };
      console.log(`${entry.key}: ${page.title}${entry.scan ? ` page ${entry.scan}` : ''} (${width}x${height}, ${fit}) -> ${Math.round(data.length / 1024)} KB · ${manifest[entry.key].licence} · ${manifest[entry.key].artist}`);
    } catch (error) { console.log(`${entry.key}: FAILED ${error.message}`); failed++ }
  }
  for (const key of book.display || []) {
    const from = path.join(OUT, `${key}.jpg`), to = path.join(OUT, `${key}-case.jpg`);
    if (!await exists(from) || await exists(to)) continue;
    await sharp(from).resize({ width: 768, height: 768, fit: 'inside' }).jpeg({ quality: 78, mozjpeg: true }).toFile(to);
    console.log(`${key}: small copy for the room written`);
  }
  const ordered = Object.fromEntries(book.pages.filter(p => manifest[p.key]).map(p => [p.key, manifest[p.key]]));
  await writeFile(manifestFile, JSON.stringify(ordered, null, 1) + '\n');
  console.log(`\n${name}: ${Object.keys(ordered).length} of ${book.pages.length} pages in ${book.dir}; ${failed} not found.`);
  // surveyOpenings: openings of the book's scan drawn to <dir>/survey as well, to be looked at and then removed.
  if (book.surveyOpenings && book.openings) await openingSheets(book);
  return Object.keys(ordered).length;
}
async function main() {
  let empty = 0;
  for (const [name, book] of Object.entries(BOOKS)) if ((await fetchBook(name, book)) === 0) empty++;
  if (empty) process.exit(1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error); process.exit(1) });
