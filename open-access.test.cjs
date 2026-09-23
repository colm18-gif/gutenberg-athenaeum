const assert = require('node:assert/strict');
const fs = require('node:fs');

const catalogue = JSON.parse(fs.readFileSync('data/open-access-catalog.json', 'utf8'));
const required = ['standard-ebooks', 'wikisource', 'internet-archive', 'open-library', 'doab-oapen', 'librivox'];
assert.deepEqual(Object.keys(catalogue.sources).sort(), required.sort());

const permitted = new Set(['Public Domain', 'CC0', 'CC BY', 'CC BY-SA']);
const rooms = new Set(['gothic', 'inquiry', 'chart', 'drawing', 'study', 'garden', 'contested', 'returning', 'quiet', 'unread', 'repository', 'mainhall', 'sorting']);
const ids = new Set();
for (const book of catalogue.books) {
  assert(!ids.has(book.id), `duplicate id ${book.id}`);
  ids.add(book.id);
  if (book.status !== 'published') continue;
  assert(catalogue.sources[book.source], `unknown source ${book.source}`);
  assert(Number.isInteger(book.id) && book.id >= 900000, `invalid open-access id ${book.id}`);
  assert(permitted.has(book.licence), `unapproved licence ${book.licence}`);
  assert(rooms.has(book.room), `unknown room ${book.room}`);
  assert(book.textPath || book.textUrls?.length, `${book.id} has no readable edition`);
  assert(book.sourceUrl && book.licenceUrl && book.room, `${book.id} has incomplete provenance`);
}

for (const book of catalogue.books.filter(book => book.room === 'sorting')) {
  const edition = fs.readFileSync(book.textPath, 'utf8');
  assert(edition.length > 100000, `${book.title} has an incomplete local edition`);
  assert(edition.includes('Exported from Wikisource'), `${book.title} is missing its source notice`);
}

console.log('Open-access catalogue is valid.');
