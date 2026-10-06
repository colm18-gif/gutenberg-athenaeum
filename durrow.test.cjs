const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),fetcher=fs.readFileSync('scripts/fetch-book-pages.mjs','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/durrow/durrow.json','utf8'));
const book=(()=>{const context={window:{},Math,setTimeout};for(const f of ['fine-books.js','kells-book.js','durrow-book.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),context);return context.window.createDurrowBook({THREE:{},renderer:{}})})();

test('the Book of Durrow loads after the Kells (whose ornament it shares) and before the game, and is handed to the Irish Room',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('kells-book.js')<order.indexOf('durrow-book.js')&&order.indexOf('durrow-book.js')<order.indexOf('game.js'));
  assert.match(game,/durrowBook=window\.createDurrowBook\?\.\(fineBookOptions\)/);assert.match(game,/durrow:durrowBook/);
});

test('every page of the facsimile has a card, a public-domain photograph, and a place in the book',()=>{
  const block=fetcher.slice(fetcher.indexOf('durrow: {'),fetcher.indexOf('kelmscott: {')),folios=Object.keys(book.folios),fetched=[...block.matchAll(/key: '(\d{3}[rv])'/g)].map(m=>m[1]);
  assert.equal(folios.length,5);assert.deepEqual(fetched,folios,'scripts/fetch-book-pages.mjs fetches the same pages, in the same order');
  for(const key of folios){
    assert(fs.existsSync(`assets/durrow/${key}.jpg`),`${key}.jpg`);assert.match(manifest[key]?.licence||'',/public domain|^pd|cc0/i,`${key} is in the public domain`);
    assert.match(manifest[key].page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    const [label,title,note]=book.folios[key];assert.equal(label,`Folio ${Number(key.slice(0,3))}${key[3]}`);assert(title&&note.length>40);
  }
  assert.equal(new Set(book.faces).size,book.faces.length);assert.equal(book.faces.length,2*book.pages);
  for(const key of folios)assert(book.faces.includes(key),`${key} is bound in`);
  assert.deepEqual([...book.spreadAt(1)],['paste-front','title']);assert.deepEqual([...book.spreadAt(book.pages)],['colophon','paste-back']);
  assert(!fs.existsSync('assets/durrow/survey')&&!fs.existsSync('assets/kells/survey'),'the survey pictures are gone');
});
