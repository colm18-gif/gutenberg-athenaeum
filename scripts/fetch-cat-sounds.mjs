// Surveys freely licensed recordings of cats on Wikimedia Commons and BigSoundBank (CC0), for Clio's voice.
// Cloud sessions cannot reach either site, so this runs as the Cat sounds workflow. Each candidate is saved, as
// downloaded, to assets/audio/cat-survey with survey.json (source, author, licence) to be listened to and measured;
// the chosen one becomes assets/audio/cat-meow.ogg and the survey folder is removed.
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'assets/audio/cat-survey';
const UA = 'LibraryAfterDark/1.0 (https://libraryafterdark.space; cat sounds survey)';
const CATEGORIES = ['Category:Audio files of cats', 'Category:Cat vocalizations', 'Category:Meowing', 'Category:Purring',
  'Category:Sounds of Felis catus', 'Category:Cat sounds'];
const SEARCHES = ['cat meow', 'cat trill', 'cat chirp', 'kitten meow', 'cat chirrup', 'cat purr meow', 'miaow'];
// BigSoundBank's cat recordings (all CC0); numbers from its site.
const BSB = [98, 99, 100, 101, 102, 103, 104, 105, 1049, 1050, 1051, 1052, 1053, 1054, 1890, 1891, 1892, 1893, 2047,
  2048, 2049, 2050, 2051, 2052, 2053];
const FREE = /public domain|cc0|cc[- ]by(?![- ]?nc)/i;

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, binary) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return binary ? Buffer.from(await r.arrayBuffer()) : r.json();
    } catch (e) { console.log('retry', e.message); await sleep(3000 * (i + 1)); }
  }
  return null;
}
const api = q => get('https://commons.wikimedia.org/w/api.php?format=json&' + new URLSearchParams(q));

fs.mkdirSync(OUT, { recursive: true });
const titles = new Set();
for (const c of CATEGORIES) {
  const j = await api({ action: 'query', list: 'categorymembers', cmtitle: c, cmtype: 'file', cmlimit: '200' });
  for (const m of j?.query?.categorymembers || []) titles.add(m.title);
}
for (const s of SEARCHES) {
  const j = await api({ action: 'query', list: 'search', srnamespace: '6', srsearch: s + ' filemime:audio', srlimit: '50' });
  for (const m of j?.query?.search || []) titles.add(m.title);
}
console.log(titles.size, 'Commons files found');

const survey = [];
const list = [...titles];
for (let i = 0; i < list.length; i += 40) {
  const j = await api({ action: 'query', prop: 'imageinfo', titles: list.slice(i, i + 40).join('|'),
    iiprop: 'url|size|mime|extmetadata', iiextmetadatafilter: 'LicenseShortName|Artist|ImageDescription' });
  for (const p of Object.values(j?.query?.pages || {})) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/audio|ogg|video\/webm/.test(ii.mime)) continue;
    const md = ii.extmetadata || {};
    const licence = md.LicenseShortName?.value || '';
    const artist = (md.Artist?.value || '').replace(/<[^>]+>/g, '').trim();
    const desc = (md.ImageDescription?.value || '').replace(/<[^>]+>/g, '').trim().slice(0, 200);
    console.log(`${FREE.test(licence) ? 'FREE' : '----'} ${p.title} | ${licence} | ${artist} | ${ii.size} B | ${desc}`);
    if (!FREE.test(licence) || ii.size > 3e6) continue;
    const name = 'c-' + p.title.replace(/^File:/, '').replace(/[^\w.-]+/g, '_');
    const buf = await get(ii.url, true);
    if (!buf) continue;
    fs.writeFileSync(path.join(OUT, name), buf);
    survey.push({ file: name, source: ii.descriptionurl, title: p.title, licence, artist, desc });
  }
}

for (const n of BSB) {
  const id = String(n).padStart(4, '0');
  for (const ext of ['ogg', 'mp3']) {
    const url = `https://bigsoundbank.com/UPLOAD/${ext}/${id}.${ext}`;
    const buf = await get(url, true);
    if (!buf || buf.length < 2000) continue;
    const name = `b-${id}.${ext}`;
    fs.writeFileSync(path.join(OUT, name), buf);
    survey.push({ file: name, source: url, licence: 'CC0 (BigSoundBank)', artist: 'Joseph Sardin' });
    console.log('BSB', id, buf.length);
    break;
  }
}
fs.writeFileSync(path.join(OUT, 'survey.json'), JSON.stringify(survey, null, 1) + '\n');
console.log(survey.length, 'candidates saved');
