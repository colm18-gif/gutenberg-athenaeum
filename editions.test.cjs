// The printed edition each text was transcribed from (data/editions.js), shown in the librarian's note and on the book
// pages: every entry is a book the library holds, and every year and name it gives is in that book's own front matter.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const EDITIONS=load('data/editions.js','ATHENAEUM_EDITIONS'),arrivals=load('data/new-books.js','ATHENAEUM_NEW_BOOKS');
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),pages=fs.readFileSync('scripts/book-pages.mjs','utf8');
const text=id=>{const plain=`texts/pg${id}.txt`,gz=`texts/bundled-gzip/pg${id}.txt.gz`;return fs.existsSync(plain)?fs.readFileSync(plain,'utf8'):fs.existsSync(gz)?zlib.gunzipSync(fs.readFileSync(gz)).toString('utf8'):null};
const front=t=>{const start=t.indexOf('*** START'),head=t.slice(0,Math.max(0,start));return (head.match(/^Original publication:.*$/m)?.[0]||'')+'\n'+t.slice(start,start+14000)};
const flat=s=>s.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9']+/g,' ');

test('the editions load before the game and are shown in the note and on the book pages',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert.ok(order.indexOf('data/editions.js')>=0&&order.indexOf('data/editions.js')<order.indexOf('game.js'));
  assert.ok(game.includes('window.ATHENAEUM_EDITIONS?.[book.id]'),'the librarian’s note names the edition');
  assert.ok(pages.includes('<dt>Transcribed from</dt>'),'so does the book page');
});

test('every edition is of a book the library holds, and its years and imprint are in the book’s own front matter',()=>{
  const held=id=>arrivals.some(e=>e[0]===id)||game.includes(`id:${id},`)||game.includes(`[${id},`);
  for(const [key,edition] of Object.entries(EDITIONS)){const id=Number(key);
    assert.ok(held(id),`${id} is on a shelf`);assert.ok(edition.length>8&&!/\.$/.test(edition),`${id}: a phrase that finishes “Transcribed from …”`);
    const t=text(id);if(!t)continue;const f=flat(front(t));
    // Years given as the edition's own (not those in brackets, which say where the book began).
    for(const year of edition.replace(/\([^)]*\)/g,'').match(/\b1[4-9]\d\d\b/g)||[]){
      const roman={1685:'mdclxxxv',1733:'mdccxxxiii',1853:'mdccclii',1903:'mdcccciii'}[year];assert.ok(f.includes(year)||roman&&f.replace(/ /g,'').includes(roman),`${id}: ${year} is in its front matter`)}
    // Publishers and printers named in it.
    for(const name of edition.replace(/\([^)]*\)/g,'').match(/\b(?:[A-Z][a-z’']+|[A-Z]\.)(?:,? (?:&|and|[A-Z][a-z’']+|[A-Z]\.))+/g)||[]){
      const word=flat(name).replace(/'s\b/g,'').split(' ').filter(w=>w.length>3&&!['the','edition','london','boston','york','harper','philadelphia','washington'].includes(w))[0];if(word)assert.ok(f.includes(word),`${id}: “${name}” is in its front matter`)}
  }
});

