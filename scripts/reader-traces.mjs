// Traces of other readers: once a night, ask Plausible how many people came in yesterday and which books
// they opened over the past week, and write the totals to data/reader-traces.js for the library to show.
//
// Only totals leave Plausible, and a book is listed only once at least MIN_READERS different people have
// opened it, so nothing here can point to one reader. Needs PLAUSIBLE_API_KEY (a Stats API key); without it
// the script says so and leaves the file alone.
//
//   node scripts/reader-traces.mjs            fetch and write
//   node scripts/reader-traces.mjs --validate check the current file
import fs from 'node:fs';
import vm from 'node:vm';

const FILE = 'data/reader-traces.js';
const SITE = process.env.PLAUSIBLE_SITE_ID || 'libraryafterdark.space';
const API = process.env.PLAUSIBLE_API_URL || 'https://plausible.io/api/v2/query';
const MIN_READERS = 3, MAX_BOOKS = 120;

export function read(file = FILE) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);
  return context.window.ATHENAEUM_READER_TRACES;
}

export function validate(data) {
  const problems = [];
  if (!data || typeof data !== 'object') return ['no data'];
  if (data.date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) problems.push('bad date');
  if (!Number.isInteger(data.readers) || data.readers < 0) problems.push('bad reader count');
  if (!data.books || typeof data.books !== 'object') problems.push('no books');
  else for (const [id, count] of Object.entries(data.books)) {
    if (!/^\d{1,6}$/.test(id)) problems.push(`bad book id ${id}`);
    if (!Number.isInteger(count) || count < MIN_READERS) problems.push(`book ${id} is below the privacy threshold`);
  }
  if (Object.keys(data.books || {}).length > MAX_BOOKS) problems.push('too many books');
  return problems;
}

export function render(data) {
  return `// Written each night by scripts/reader-traces.mjs from Plausible totals. Do not edit by hand.\n` +
    `// date: the day the reader count covers. readers: people who came in that day. books: Gutenberg number to\n` +
    `// the number of different people who opened it in the seven days to that date (${MIN_READERS} or more only).\n` +
    `window.ATHENAEUM_READER_TRACES=${JSON.stringify(data)};\n`;
}

// Turns Plausible's rows into the library's shape, keeping only books enough people opened.
export function summarise(date, visitorRows, bookRows) {
  const readers = Math.max(0, Math.round(Number(visitorRows?.[0]?.metrics?.[0]) || 0));
  const books = {};
  for (const row of bookRows || []) {
    const id = String(row?.dimensions?.[0] ?? ''), count = Math.round(Number(row?.metrics?.[0]) || 0);
    if (/^\d{1,6}$/.test(id) && count >= MIN_READERS && Object.keys(books).length < MAX_BOOKS) books[id] = count;
  }
  return { date, readers, books };
}

const day = offset => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

async function query(key, body) {
  const response = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ site_id: SITE, ...body }) });
  if (!response.ok) throw new Error(`Plausible answered ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return (await response.json()).results || [];
}

async function main() {
  if (process.argv.includes('--validate')) {
    const problems = validate(read());
    if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
    console.log('reader traces look fine');
    return;
  }
  const key = process.env.PLAUSIBLE_API_KEY;
  if (!key) { console.log('No PLAUSIBLE_API_KEY set, so the reader traces were left as they are.'); return; }
  const yesterday = day(-1), weekStart = day(-7);
  const visitors = await query(key, { metrics: ['visitors'], date_range: [yesterday, yesterday] });
  const books = await query(key, { metrics: ['visitors'], date_range: [weekStart, yesterday], dimensions: ['event:props:book'],
    filters: [['is', 'event:name', ['Book Opened']]], order_by: [['visitors', 'desc']], pagination: { limit: MAX_BOOKS } });
  const data = summarise(yesterday, visitors, books), problems = validate(data);
  if (problems.length) throw new Error(problems.join('\n'));
  fs.writeFileSync(FILE, render(data));
  console.log(`${yesterday}: ${data.readers} readers, ${Object.keys(data.books).length} books opened by ${MIN_READERS}+ people this week`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error.message); process.exit(1); });
