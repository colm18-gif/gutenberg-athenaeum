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

// Pictures for the reading rooms' walls, fetched the same way into assets/pictures (pictures.json for the credits).
//   The Ukrainian Reading Room (international-wing.js): Shevchenko's Kateryna (1842), painted after his own poem, and the
//   his Raim Fortification: View from the Shipyard on the Syr Darya (1848), drawn in exile on the Aral expedition (Commons
//   calls it a self-portrait; the Ukrainian Book Institute gave its Ukrainian title); Pymonenko's Ukrainian Night (1905).
export const PICTURES = [
  { key: 'shevchenko-kateryna', files: ['Шевченко Т. Г. Катерина. 1842.jpg', 'Image-Shevchenko Kateryna Olia 1842 large.jpg', 'Kateryna (Taras Shevchenko).jpg'], search: 'Shevchenko Kateryna 1842 painting' },
  { key: 'shevchenko-1848', file: '1848 - 201 - Self-portrait at the Syr Darya bank. Rayim, June 1848, Taras Shevchenko.jpg', search: 'Shevchenko self-portrait 1848' },
  { key: 'pymonenko-night', file: 'Mykola Pymonenko-Ukrayinska nich.jpg', search: 'Pymonenko Ukrainian night 1905' },
  // For the Ukrainian Reading Room's chronicle frieze (HISTORY in international-wing.js): the documents its panels open
  // large. Public domain on Commons; each looked at before use.
  { key: 'ua-ostroh-bible-1581', file: 'Ostrog Bible, title page, 1581.jpg', minSize: 900 },
  { key: 'ua-orlyk-1710', file: 'Philipp Orlik Constitution Original Front Page.jpg', minSize: 700 },
  { key: 'ua-valuev-1863', file: 'Валуєвський циркуляр. Valuev Circular.jpg', minSize: 500 },
  { key: 'ua-universal-1918', file: 'IV Універсал УЦР.jpg', minSize: 900 },
  { key: 'ua-independence-1991', file: 'Declaration of Independence of Ukraine, 1991.jpg', minSize: 900 },
  { key: 'ua-pectoral', file: 'Pektoral111.JPG', minSize: 700 },
  // Beauplan's general map of Ukraine (Delineatio Generalis Camporum Desertorum vulgo Ukraina, Gdańsk 1648, engraved by
  // Willem Hondius), drawn with the south at the top: framed on the Ukrainian Reading Room's wall (BEAUPLAN in
  // international-wing.js), the writers' places marked on it by the library. `large`: a bigger copy as well,
  // `<key>-large.jpg`, for the picture card's zoom only (the table and the card keep the 2048-pixel one).
  { key: 'ua-beauplan-1648', files: ['Delineatio Generalis Camporum Desertorum vulgo Ukraina.jpg', 'Beauplan Ukraine 1648.jpg', 'Guillaume Le Vasseur de Beauplan. Delineatio Generalis Camporum Desertorum vulgo Ukraina. 1648.jpg'], search: 'Beauplan Delineatio Generalis Camporum Desertorum Ukraina', exclude: /detail|fragment|part|crop|\bof \d/i, minSize: 1500, large: 6000 },
  // For the Ukrainian children's room: the 1922 Yiddish edition of Ukrainian folk tales (Ukraynishe Folkmayses), its
  // picture for «Пан Коцький», and three letters of Heorhiy Narbut's Ukrainian alphabet (1917–19; Narbut died in 1920).
  { key: 'kids-pan-kotsky-1922', file: 'Ukraynishe Folkmayses 11.jpg', minSize: 500 },
  { key: 'kids-narbut-a', file: 'Нарбут Г.І. Літера А 1919 р.jpg', minSize: 450 },
  { key: 'kids-narbut-z', file: 'Г.Нарбут літера З Українська абетка.jpg', minSize: 450 },
  { key: 'kids-narbut-y', file: 'Azbuka Narbuta - И.jpg', minSize: 450 },
  // Emily Dickinson's room (dickinson-room.js): the daguerreotype of about 1847, the only authenticated photograph of
  // her, and three poems in her own hand (Safe in their Alabaster Chambers as she sent it to Higginson in 1862, now in
  // the Boston Public Library; Wild Nights; I taste a liquor never brewed, at Harvard's Houghton Library).
  { key: 'dickinson-daguerreotype', files: ['Black-white photograph of Emily Dickinson2.jpg', 'Emily Dickinson daguerreotype (Restored).jpg'], minSize: 700 },
  { key: 'dickinson-alabaster', file: 'Emily Dickinson, Amherst, Mass., autograph manuscript poem, Safe in their Alabaster Chamber, 1862, from the Digital Commonwealth - 1 commonwealth kh04mv67t.jpg' },
  { key: 'dickinson-wild-nights', file: 'Emily Dickinson "Wild nights" manuscript.jpg' },
  { key: 'dickinson-liquor', file: 'Emily Dickinson- I taste a liquor never brewed - Houghton Library (72a), J214, Fr207.jpg' },
  // The score of the lullaby «Котику сіренький», read to give the bandura its tune when Clio sleeps in the room (not hung).
  { key: 'kotyku-score', file: 'Котику сіренький.GIF', search: 'Котику сіренький', gif: true },
  // Montserrat (montserrat-room.js), in a bottle on the Long Corridor's shelf: the Admiralty's chart of the island of
  // 1869, a penny stamp of 1929 with Erin, her cross and her harp beside George V (looked at), the plate of the Montserrat
  // oriole from The Ibis of 1882, the mountain chicken, and the Soufrière Hills. All public domain.
  { key: 'montserrat-chart', file: 'Admiralty Chart No 254 Montserrat, Published 1869.jpg' },
  { key: 'montserrat-stamp', file: 'Stamp Montserrat 1929 1p.jpg', minSize: 450 },
  { key: 'montserrat-oriole', file: 'IcterusOberiKeulemans.jpg' },
  { key: 'montserrat-frog', files: ['Leptodactylus fallax (1).jpg', 'Leptodactylus fallax (2).jpg'] },
  { key: 'montserrat-volcano', files: ['Soufriere Hills.jpg', 'Montserrat Soufriere volcano 2.jpg'] },
  // Pitcairn Island (pitcairn-island.js), the second bottle: Robert Dodd's print of 1790 of Bligh set adrift, the
  // Admiralty's chart of the island of 1829 (from Beechey's survey of 1825), the Bounty's sheer draught of 1787,
  // Thursday October Christian drawn in 1814, John Adams in 1825, his house and grave in 1849, Bounty Bay in 1870, and
  // the threepenny stamp of 1940, the island's first set, with its map of the Pacific (none of the set shows the Bible). All public domain.
  { key: 'pitcairn-adrift', file: "The Mutineers turning Lieut Bligh and part of the Officers and Crew adrift from His Majesty's Ship the Bounty ( 29 April 1789) RMG S0713.jpg" },
  { key: 'pitcairn-chart', file: 'Admiralty Chart No 1113 Pitcairn Island, Published 1829.jpg' },
  { key: 'pitcairn-draught', file: 'Admiralty Sheer Draught Ship Plans - HMS Bounty RMG J2028.png' },
  { key: 'pitcairn-thursday', file: 'Thursday (Friday) Fletcher October Christian.jpg', minSize: 800 },
  { key: 'pitcairn-adams', file: 'John Adams (BM 1861,1109.519).jpg' },
  { key: 'pitcairn-house', file: "Edward Gennys Fanshawe, John Adams house and grave Pitcairn's Island, Augt 12th 1849.jpg" },
  { key: 'pitcairn-bay', file: 'Bounty Bay mutineersofbount00belcuoft 0006.jpg' },
  { key: 'pitcairn-stamp-3', file: 'Pitcairn 1940 03.jpg', minSize: 590 },
  // Tristan da Cunha (tristan-island.js), the third bottle: Augustus Earle's Solitude (1824), the painter stranded there
  // watching the horizon for a ship; a drawing of the settlement of 1818, Glass's time; the Tristan thrush and the
  // Tristan bunting, from plates of 1881 (Darwin's "only two land-birds, a thrush and a bunting"); the island from the
  // International Space Station in 2013; and the 1952 five-shilling stamp. All public domain, to be looked at.
  { key: 'tristan-solitude', files: ['Augustus Earle, (Self Portrait) Solitude, Tristan da Cunha, 1824.jpg', 'Augustus Earle - Solitude.jpg'], minSize: 590 },
  { key: 'tristan-glass', file: 'William Glass Tristan da Cunha.jpg', minSize: 380 },
  { key: 'tristan-thrush', file: 'Nesocichla eremita Smit.jpg' },
  { key: 'tristan-bunting', file: 'Nesospiza acunhae.jpg' },
  { key: 'tristan-space', file: 'ISS-34 Tristan da Cunha.jpg' },
  { key: 'tristan-stamp', file: 'Tristan da Cunha 1952 5 shilling stamp.jpg', minSize: 760 },
  // St Helena (st-helena.js), the fourth bottle: Jonathan photographed with another tortoise about 1886, a few years after
  // he came from the Seychelles; Thomas Daniell's Governor's House of 1794 (Plantation House, on whose lawn he lives);
  // Jacob's Ladder up from Jamestown; Longwood in a watercolour by Marchand, Napoleon's valet, and in an ink drawing of its
  // buildings by a Swedish visitor of the 1830s, numbered for its rooms; and the island from the International Space Station. All public domain or CC0, to be looked at.
  { key: 'sthelena-jonathan', file: 'Jonathan and another tortoise, St Helena.png', minSize: 540 },
  { key: 'sthelena-governor', file: "Thomas Daniell, View of the Governor's House in St. Helena, 1794, NGA 69395.jpg" },
  { key: 'sthelena-ladder', file: 'Jamestown Jacobs Ladder.jpg' },
  { key: 'sthelena-longwood', file: 'Louis-Joseph Marchand (1791-1876) Longwood op Sint-Helena (aquarel).jpg' },
  { key: 'sthelena-dwelling', file: 'Napoleons boning på St Helena.jpg' },
  { key: 'sthelena-space', file: 'ISS019E014918 Saint Helena Island.jpg' },
  // Norfolk Island (norfolk-island.js), the fifth bottle: George Raper's loss of the Sirius on the reef in 1790; the convict
  // establishment at Kingston in 1848; Government House about 1855, the year before the Pitcairners came; and Kingston,
  // its beach and the old gaol in 1898. All public domain, to be looked at.
  { key: 'norfolk-sirius', file: 'The melancholy loss of HMS Sirius off Norfolk Island March 19th 1790 - George Raper.jpg' },
  { key: 'norfolk-convicts', file: 'Convict Establishment Norfolk Island 1848.jpg' },
  { key: 'norfolk-government', file: 'Government House, Norfolk Island Wilson AUTAS001125294850.jpg' },
  { key: 'norfolk-kingston', file: 'Kingston, Norfolk Island (9014731556).jpg' },
  { key: 'norfolk-beach', file: 'The Beach, Kingston, Norfolk Island (9014730082).jpg' },
  { key: 'norfolk-gaol', file: 'The Old Gaol, Kingston, Norfolk Island (9013543011).jpg' },
  // The Faroe Islands (faroe-islands.js), the sixth bottle: a roykstova, the old smoke-room of a Faroese house, and the
  // islands in 1898; Tórshavn from its harbour; milkmaids at Haraldsund; fishermen; the chain dance; Debes's map of 1673.
  { key: 'faroe-roykstova', file: 'Røgstue i Skibenæs i Færøerne (DNT-118887).jpg' },
  { key: 'faroe-thorshavn', file: 'FARÖE(1898) THORSHAVN FROM THE HARBOUR.jpg' },
  { key: 'faroe-milkmaids', file: 'Malkepiger (neytakonur) ved Haraldsund i Færøerne, 1898 (DNT-25802).jpg' },
  { key: 'faroe-fishermen', file: 'Færøske fiskere. 1898.jpg' },
  { key: 'faroe-dance', file: 'Kædedans på Færøerne (ES-164677).jpg' },
  { key: 'faroe-map', file: 'Faroe map 1673 by lucas debes.png' }
];

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let OUT = path.join(root, 'assets/maps');
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
  return info && !page.missing && (map.gif ? /jpeg|png|tiff|gif/ : /jpeg|png|tiff/).test(info.mime) && Math.max(info.width, info.height) >= (map.minSize || 1000) && !map.exclude?.test(page.title) && isPublicDomain(info.extmetadata);
};
async function choose(map) {
  // The files named, in order of preference; the first that is there and usable is taken.
  for (const file of map.files || (map.file ? [map.file] : [])) {
    const data = await api({ ...INFO, titles: `File:${file}` });
    const page = data.query?.pages?.[0];
    if (usable(page, map)) return page;
    console.log(`  ${map.key}: File:${file} ${page?.missing ? 'is not on Commons' : `is not usable (${page?.imageinfo?.[0]?.width}x${page?.imageinfo?.[0]?.height}, ${strip(page?.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value)})`}`);
  }
  // With nothing to search for, give up: an empty search would take whatever Commons offers first.
  if (!map.search) { console.log(`  ${map.key}: nothing usable, and no search to try instead`); return null }
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
  const failed = await fetchAll(MAPS, 'assets/maps', 'maps.json', 'maps') + await fetchAll(PICTURES, 'assets/pictures', 'pictures.json', 'pictures');
  if (failed > MAPS.length) process.exit(1);
}
async function fetchAll(MAPS, dir, manifestName, what) {
  OUT = path.join(root, dir);
  await mkdir(OUT, { recursive: true });
  const manifestFile = path.join(OUT, manifestName);
  let manifest = {};
  try { manifest = JSON.parse(await readFile(manifestFile, 'utf8')) } catch {}
  const wanted = new Set(MAPS.map(m => m.key));
  for (const key of Object.keys(manifest)) if (!wanted.has(key)) delete manifest[key];
  let failed = 0;
  for (const map of MAPS) {
    const full = path.join(OUT, `${map.key}.jpg`), wall = path.join(OUT, `${map.key}-wall.jpg`);
    const large = path.join(OUT, `${map.key}-large.jpg`);
    if (manifest[map.key] && await exists(full) && await exists(wall) && (!map.large || (await exists(large) && manifest[map.key].large >= Math.min(map.large, manifest[map.key].original || Infinity)))) { console.log(`${map.key}: kept (${manifest[map.key].file})`); continue }
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
      // A larger copy for zooming, from Commons at that width (or the original, if it is smaller).
      let largeWidth, originalWidth;
      if (map.large) {
        const data = await api({ ...INFO, iiurlwidth: String(map.large), titles: page.title });
        // Commons serves thumbnails no wider than 3840: past that, take the original and resize it here.
        const li = data.query?.pages?.[0]?.imageinfo?.[0], from = li?.thumburl && (li.thumbwidth >= map.large || li.width <= li.thumbwidth) ? li.thumburl : li?.url;
        const got = await fetch(from, { headers: HEADERS });
        if (!got.ok) throw new Error(`${got.status} downloading ${from}`);
        const out = await sharp(Buffer.from(await got.arrayBuffer()), { limitInputPixels: false }).rotate(map.rotate || 0).flatten({ background: '#e8dcc0' })
          .resize({ width: map.large, height: map.large, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 72, mozjpeg: true }).toBuffer({ resolveWithObject: true });
        await writeFile(large, out.data); largeWidth = out.info.width; originalWidth = li?.width;
        console.log(`    large: ${out.info.width}x${out.info.height}, ${Math.round(out.data.length / 1024)} KB (original ${li?.width}x${li?.height})`);
      }
      manifest[map.key] = {
        file: page.title.replace(/^File:/, ''), page: info.descriptionurl,
        width: big.info.width, height: big.info.height,
        artist: strip(meta.Artist?.value).slice(0, 160), date: strip(meta.DateTimeOriginal?.value).slice(0, 80),
        licence: strip(meta.LicenseShortName?.value) || 'Public domain',
        description: strip(meta.ImageDescription?.value).slice(0, 400),
        ...(largeWidth ? { large: largeWidth, original: originalWidth } : {})
      };
      console.log(`${map.key}: ${page.title} -> ${big.info.width}x${big.info.height}, ${Math.round(big.data.length / 1024)} KB (wall ${Math.round(small.length / 1024)} KB) · ${manifest[map.key].licence} · ${manifest[map.key].artist} · ${manifest[map.key].date}`);
      console.log(`    ${manifest[map.key].description}`);
    } catch (error) { console.log(`${map.key}: FAILED ${error.message}`); failed++ }
  }
  const ordered = Object.fromEntries(MAPS.filter(m => manifest[m.key]).map(m => [m.key, manifest[m.key]]));
  await writeFile(manifestFile, JSON.stringify(ordered, null, 1) + '\n');
  console.log(`\n${Object.keys(ordered).length} of ${MAPS.length} ${what} in ${dir}; ${failed} not found.`);
  return failed;
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error); process.exit(1) });
