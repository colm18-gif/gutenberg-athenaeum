// A survey, for the log and for a few contact sheets: the whole Book of Kells and the whole Fabrica as single scans on
// Wikimedia Commons, read page by page (whole-book.js). For each it checks that a page can be fetched at a standard width
// straight from upload.wikimedia.org (the address the reader builds itself), and draws numbered pages into
// <dir>/survey so that a scan's page numbers can be matched to the book's folios or pages. Run by the Book images
// workflow; the sheets are to be looked at and removed.
import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const API = 'https://commons.wikimedia.org/w/api.php';
const HEADERS = { 'User-Agent': 'LibraryAfterDark-survey/1.0 (https://libraryafterdark.space; reading public-domain scans)' };
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const strip = html => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
async function get(url, binary = false) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: HEADERS });
    if (response.ok) return binary ? Buffer.from(await response.arrayBuffer()) : response.json();
    if (attempt >= 5) throw new Error(`${response.status} for ${url}`);
    await new Promise(res => setTimeout(res, 3000 * attempt));
  }
}
// The address of a page of a multi-page file, as Commons serves its thumbnails.
export function pageUrl(file, page, width) {
  const name = file.replace(/ /g, '_'), md5 = createHash('md5').update(name).digest('hex');
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${md5[0]}/${md5.slice(0, 2)}/${encodeURIComponent(name)}/page${page}-${width}px-${encodeURIComponent(name)}.jpg`;
}
const BOOKS = [
  { name: 'kells', file: 'Book of Kells.pdf', dir: 'assets/kells', sample: [1, 2, 3, 4, 5, 6, 7, 8, 63, 64, 65, 66, 67, 68, 69, 70, 225, 226, 227, 228, 229, 230, 581, 582, 583, 584, 585, 586, 615, 616, 617, 618, 676, 677, 678, 679, 680, 681] },
  { name: 'fabrica', file: 'Andreae Vesalii Bruxellensis, scholae medicorum Patauinae professoris De humani corporis fabrica libri septem .. (IA 2295005R.nlm.nih.gov).pdf', dir: 'assets/vesalius', sample: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 727, 728, 729, 730] }
];
for (const book of BOOKS) {
  console.log(`\n=== ${book.name}: ${book.file} ===`);
  const data = await get(`${API}?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'imageinfo', iiprop: 'size|url|extmetadata', iiurlwidth: '1280', iiurlparam: 'page5-1280px', titles: 'File:' + book.file })}`);
  const p = data.query.pages[0], i = p.imageinfo?.[0] || {}, meta = i.extmetadata || {};
  console.log(`  ${i.width}x${i.height}, ${i.pagecount} pages, ${strip(meta.LicenseShortName?.value)}`);
  for (const k of ['ImageDescription', 'Artist', 'Credit', 'DateTimeOriginal', 'LicenseUrl', 'UsageTerms']) console.log(`  ${k}: ${strip(meta[k]?.value).slice(0, 400)}`);
  console.log(`  description page: ${i.descriptionurl}`);
  console.log(`  the API's page 5 at 1280: ${i.thumburl}`);
  console.log(`  ours:                     ${pageUrl(book.file, 5, 1280)}`);
  for (const [page, width] of [[5, 1280], [5, 960], [book.sample.at(-1), 1280], [300, 640]]) {
    const url = pageUrl(book.file, page, width), started = Date.now();
    try { const r = await fetch(url, { headers: HEADERS }); const body = Buffer.from(await r.arrayBuffer()); console.log(`  fetch page ${page} at ${width}: ${r.status} ${r.headers.get('content-type')} ${Math.round(body.length / 1024)} KB in ${Date.now() - started} ms; cache ${r.headers.get('x-cache-status') || r.headers.get('x-cache') || '?'}`) } catch (error) { console.log(`  fetch page ${page} at ${width}: ${error.message}`) }
  }
  // Numbered pages, eight to a sheet.
  const OUT = path.join(root, book.dir, 'survey'); await mkdir(OUT, { recursive: true });
  const TW = 300, TH = 420, PER = 8;
  for (let k = 0; k < book.sample.length; k += PER) {
    const cells = [], group = book.sample.slice(k, k + PER);
    for (const [n, page] of group.entries()) {
      const left = (n % 4) * TW, top = Math.floor(n / 4) * (TH + 36);
      try { cells.push({ input: await sharp(await get(pageUrl(book.file, page, 640), true)).resize({ width: TW - 8, height: TH, fit: 'inside' }).toBuffer(), left: left + 4, top: top + 36 }) } catch (error) { console.log(`  page ${page}: ${error.message}`) }
      cells.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="32"><text x="6" y="24" font-size="22" font-family="DejaVu Sans" fill="#ff0">pdf page ${page}</text></svg>`), left, top });
      await new Promise(res => setTimeout(res, 400));
    }
    const name = `whole-${String(k / PER + 1).padStart(2, '0')}.jpg`;
    await sharp({ create: { width: TW * 4, height: (TH + 36) * Math.ceil(group.length / 4), channels: 3, background: '#222' } }).composite(cells).jpeg({ quality: 78 }).toFile(path.join(OUT, name));
    console.log(`  ${name}: pages ${group.join(', ')}`);
  }
}
