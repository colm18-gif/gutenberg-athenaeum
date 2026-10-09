// A survey, for the log only: how much of the Book of Kells and of Vesalius's Fabrica (1543) can be had whole, in the
// public domain, so that a reader could page through all of either book (fetch-book-pages.mjs keeps only chosen pages).
// For each it lists what Wikimedia Commons holds (per folio or page, with licences and sizes, and any complete scan as a
// PDF or DjVu, with its page count) and what the Internet Archive holds. Run by the Book images workflow; it changes
// nothing in the repository.
const API = 'https://commons.wikimedia.org/w/api.php';
const HEADERS = { 'User-Agent': 'LibraryAfterDark-survey/1.0 (https://libraryafterdark.space; surveying public-domain scans)' };
const strip = html => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const freeLicence = meta => /public domain|^pd\b|^pd-|cc0/i.test(strip(meta?.LicenseShortName?.value)) || /^pd/i.test(strip(meta?.License?.value));

async function get(url) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: HEADERS });
    if (response.ok) return response.json();
    if (attempt >= 5) throw new Error(`${response.status} for ${url}`);
    await new Promise(res => setTimeout(res, 3000 * attempt));
  }
}
const api = params => get(`${API}?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', ...params })}`);

// Every file under a category, with the subcategory it was found in.
async function categoryFiles(root, maxDepth = 3) {
  const files = new Map(), seen = new Set(), queue = [[root, 0]], counts = [];
  while (queue.length && seen.size < 120) {
    const [category, depth] = queue.shift();
    if (seen.has(category)) continue; seen.add(category);
    let cont = {}, here = 0;
    do {
      const data = await api({ list: 'categorymembers', cmtitle: category, cmlimit: '500', cmtype: 'file|subcat', ...cont });
      for (const m of data.query?.categorymembers || []) {
        if (m.ns === 14 && depth < maxDepth) queue.push([m.title, depth + 1]);
        else if (m.ns === 6) { here++; if (!files.has(m.title)) files.set(m.title, category) }
      }
      cont = data.continue || null;
    } while (cont);
    counts.push([category, here]);
  }
  return { files, counts };
}
async function info(titles) {
  const out = [];
  for (let i = 0; i < titles.length; i += 50) {
    const data = await api({ prop: 'imageinfo', iiprop: 'size|mime|extmetadata', titles: titles.slice(i, i + 50).join('|') });
    out.push(...(data.query?.pages || []));
  }
  return out;
}
const describe = p => { const i = p.imageinfo?.[0] || {}; return `${p.title.replace(/^File:/, '')} ${i.width}x${i.height}${i.pagecount ? ` ${i.pagecount} pages` : ''} ${Math.round((i.size || 0) / 1e6)} MB ${strip(i.extmetadata?.LicenseShortName?.value)}` };

// Complete scans: multi-page files found by search.
async function scans(queries, must) {
  const titles = new Set();
  for (const q of queries) {
    const data = await api({ list: 'search', srsearch: q, srnamespace: '6', srlimit: '50' });
    for (const hit of data.query?.search || []) if (must.test(hit.title)) titles.add(hit.title);
  }
  const pages = await info([...titles]);
  console.log(`  complete scans (PDF or DjVu) found by search: ${pages.length}`);
  for (const p of pages.sort((a, b) => (b.imageinfo?.[0]?.pagecount || 0) - (a.imageinfo?.[0]?.pagecount || 0))) console.log(`    ${freeLicence(p.imageinfo?.[0]?.extmetadata) ? 'FREE ' : '     '}${describe(p)}`);
}
async function archive(query) {
  const url = `https://archive.org/advancedsearch.php?${new URLSearchParams({ q: query, rows: '40', output: 'json' })}&fl[]=identifier&fl[]=title&fl[]=date&fl[]=imagecount&fl[]=collection&fl[]=licenseurl&fl[]=rights&fl[]=possible-copyright-status`;
  try {
    const docs = (await get(url)).response?.docs || [];
    console.log(`  Internet Archive: ${docs.length} items for ${query}`);
    for (const d of docs) console.log(`    ${d.identifier} | ${String(d.title).slice(0, 90)} | ${d.date || ''} | ${d.imagecount || '?'} images | ${[].concat(d.collection || []).slice(0, 3).join(',')} | ${d['possible-copyright-status'] || d.licenseurl || String(d.rights || '').slice(0, 60)}`);
  } catch (error) { console.log(`  Internet Archive: ${error.message}`) }
}
// Folio runs, compactly: 1r–5v, 8r, 10v–12r.
function ranges(sides) {
  const n = s => Number(s.slice(0, -1)) * 2 + (s.endsWith('v') ? 1 : 0), name = k => `${k >> 1}${k & 1 ? 'v' : 'r'}`;
  const ks = [...new Set(sides.map(n))].sort((a, b) => a - b), out = [];
  for (let i = 0; i < ks.length; i++) { let j = i; while (j + 1 < ks.length && ks[j + 1] === ks[j] + 1) j++; out.push(i === j ? name(ks[i]) : `${name(ks[i])}–${name(ks[j])}`); i = j }
  return out.join(', ');
}

async function kells() {
  console.log('\n=== The Book of Kells (Trinity College Dublin, MS 58): 340 folios, 680 sides ===');
  const { files, counts } = await categoryFiles('Category:Book of Kells');
  console.log(`  ${files.size} files in ${counts.length} categories`);
  for (const [c, n] of counts.filter(([, n]) => n).sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`    ${n} ${c}`);
  const pages = await info([...files.keys()]);
  const folioOf = title => {
    const t = title.replace(/^File:/, '');
    const m = t.match(/KellsFol0*(\d{1,3})([rv])/i) || t.match(/(?:fol(?:io)?|f)\.?[\s._-]*0*(\d{1,3})\s*([rv])(?![a-z])/i) || t.match(/(?<![0-9])0*(\d{1,3})([rv])(?=[A-Z_ .-]|$)/);
    return m && Number(m[1]) >= 1 && Number(m[1]) <= 340 ? `${Number(m[1])}${m[2].toLowerCase()}` : null;
  };
  const any = new Set(), usable = new Set(), large = new Set();
  for (const p of pages) {
    const f = folioOf(p.title), i = p.imageinfo?.[0];
    if (!f || !i) continue; any.add(f);
    if (freeLicence(i.extmetadata) && /jpeg|png|tiff/.test(i.mime)) { usable.add(f); if (i.height >= 1500) large.add(f) }
  }
  const all = []; for (let k = 1; k <= 340; k++) all.push(`${k}r`, `${k}v`);
  console.log(`  sides with any file: ${any.size} of 680; free and an image: ${usable.size}; free and at least 1500 px tall: ${large.size}`);
  console.log(`  free sides: ${ranges([...usable])}`);
  console.log(`  missing (no free image): ${ranges(all.filter(s => !usable.has(s)))}`);
  await scans(['"Book of Kells" filetype:pdf', '"Book of Kells" filetype:djvu', 'Kells manuscript facsimile filetype:pdf'], /kells/i);
  await archive('title:("book of kells")');
}

async function fabrica() {
  console.log('\n=== De humani corporis fabrica (Basel, 1543): about 700 pages ===');
  const { files, counts } = await categoryFiles('Category:De humani corporis fabrica');
  console.log(`  ${files.size} files in ${counts.length} categories`);
  const pages = await info([...files.keys()]), byCat = new Map();
  for (const p of pages) {
    const cat = files.get(p.title), i = p.imageinfo?.[0] || {}, lic = strip(i.extmetadata?.LicenseShortName?.value) || '?';
    const row = byCat.get(cat) || { n: 0, free: 0, multi: 0, lic: new Map() };
    row.n++; if (freeLicence(i.extmetadata)) row.free++; if (i.pagecount) row.multi++; row.lic.set(lic, (row.lic.get(lic) || 0) + 1); byCat.set(cat, row);
  }
  for (const [cat, r] of [...byCat].sort((a, b) => b[1].n - a[1].n).slice(0, 30)) console.log(`    ${r.n} files, ${r.free} free, ${r.multi} multi-page | ${cat} | ${[...r.lic].map(([l, n]) => `${l}: ${n}`).join(', ')}`);
  const multi = pages.filter(p => p.imageinfo?.[0]?.pagecount);
  for (const p of multi) console.log(`    in the category, multi-page: ${freeLicence(p.imageinfo?.[0]?.extmetadata) ? 'FREE ' : ''}${describe(p)}`);
  await scans(['"humani corporis fabrica" filetype:pdf', '"humani corporis fabrica" filetype:djvu', 'Vesalius fabrica 1543 filetype:pdf', 'Vesalius filetype:djvu'], /fabrica|vesal/i);
  await archive('title:("humani corporis fabrica") AND date:[1543-01-01 TO 1543-12-31]');
  await archive('title:("humani corporis fabrica")');
}

await kells();
await fabrica();
