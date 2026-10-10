const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),fetcher=fs.readFileSync('scripts/fetch-book-pages.mjs','utf8'),list=fs.readFileSync('data/new-books.js','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/voynich/voynich.json','utf8'));
const context={window:{},Math,setTimeout};for(const f of ['whole-book.js','fine-books.js','voynich-book.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),context);
const book=context.window.createVoynichBook({THREE:{},renderer:{}}),spec=context.window.VOYNICH_BOOK;

test('the Voynich Manuscript loads before the game and lies open on the Restricted Catalogue’s lectern',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('fine-books.js')<order.indexOf('voynich-book.js')&&order.indexOf('voynich-book.js')<order.indexOf('game.js'));
  assert.match(game,/voynichBook=window\.createVoynichBook\?\.\(fineBookOptions\)/);assert.match(game,/\|\|voynichBook\?\.isOpen\)/,'the world stops while the book is open');
  assert.match(game,/desk\.position\.set\(47,1\.72,2\.35\);desk\.rotation\.x=-\.22/,'on the lectern, at its slope');
  assert.match(game,/page\('009v',-1\),right=page\('010r',1\)/,'open at the pansy');
  assert.match(game,/focus\.userData\?\.type==='restricted-voynich'\)\{focus=null;ui\.prompt\.style\.opacity=0;voynichBook\.open\(\)/);
  assert.match(game,/lockBody=box\(\.7,\.65,\.2,MAT\.brass,47\.95,/,'the padlock moved aside for it');
  assert.match(game,/voynich:\(\)=>moveReaderTo\(47,0,\.5,Math\.PI\)/);assert.match(game,/restricted:'voynich'/);
  for(const key of ['009v','010r'])assert(fs.existsSync(`assets/voynich/${key}-case.jpg`),`the lectern's small copy of ${key}`);
});

test('every page of the Voynich has a card and a public-domain photograph, bound in real openings',()=>{
  const folios=Object.keys(book.folios),block=fetcher.slice(fetcher.indexOf('voynich: {')),fetched=[...block.matchAll(/key: '([a-z0-9]+)'/g)].map(m=>m[1]);
  assert.deepEqual(fetched,folios,'scripts/fetch-book-pages.mjs fetches the same pages, in the same order');
  for(const key of folios){
    const [label,title,note]=book.folios[key];assert(label&&title&&note.length>60,`${key} has a card`);
    assert(fs.existsSync(`assets/voynich/${key}.jpg`),`${key}.jpg`);assert.match(manifest[key]?.licence||'',/public domain|^pd|cc0/i,`${key} is in the public domain`);
    assert.match(manifest[key].page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  }
  assert.equal(new Set(book.faces).size,book.faces.length);assert.equal(book.faces.length,2*book.pages);for(const key of folios)assert(book.faces.includes(key),`${key} is bound in`);
  assert.deepEqual([...book.spreadAt(1)],['paste-front','v-title']);assert.deepEqual([...book.spreadAt(book.pages)],['colophon','paste-back']);
  const spreads=Array.from({length:book.pages+1},(_,n)=>book.spreadAt(n).join());
  for(const [v,r] of [['009v','010r'],['055v','056r'],['077v','078r'],['099v','100r'],['102v','103r']])assert(spreads.includes(`${v},${r}`),`${v} faces ${r}, as in the manuscript`);
  assert(!fs.existsSync('assets/voynich/survey'),'the survey pictures are gone');
});

test('the whole Voynich comes from the Beinecke’s scan, and its marked places are the facsimile’s pages',()=>{
  const whole=spec.whole;assert.equal(whole.pages,214);assert.equal(whole.hash,'5/55');
  assert.equal(context.window.wholeBookPageUrl(whole,4,960),'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Voynich_Manuscript_(IA_voynich_MS_408).pdf/page4-960px-Voynich_Manuscript_(IA_voynich_MS_408).pdf.jpg');
  // The scan runs one image ahead of the Beinecke photographs the pages come from.
  for(const key of Object.keys(book.folios)){const n=Number(/\((\d+)\)/.exec(manifest[key].file)?.[1]);if(n)assert.equal(whole.pageFor(key),n+1,`${key} in the scan`)}
  assert.equal(whole.pageFor('056r'),112);
  for(const [label,n] of whole.marks){assert(n>=1&&n<=whole.pages,label);const folio=/folio (\d+)([rv])\)/.exec(label);if(folio){const key=String(folio[1]).padStart(3,'0')+folio[2];if(book.folios[key])assert.equal(whole.pageFor(key),n,label)}}
});

test('the case behind the lectern holds books about ciphers that stand on no other shelf',()=>{
  const entries=[...list.matchAll(/^\s*\[(\d+|null),'((?:[^'\\]|\\.)+)','(?:[^'\\]|\\.)+','(?:[^'\\]|\\.)+','([a-z-]+)','((?:[^'\\]|\\.)+)'\]/gm)];
  const own=entries.filter(m=>m[3]==='ciphers'),others=entries.filter(m=>m[3]!=='ciphers');
  assert(own.length>=8&&own.length<=10,'one case of ten');
  const elsewhere=[game,...fs.readdirSync('data').filter(f=>f.endsWith('.js')&&!f.startsWith('new-books')).map(f=>fs.readFileSync('data/'+f,'utf8'))].join('\n');
  for(const [,id,title,,note] of own){
    assert(note.split(/[.!?”](?:\s|$)/).filter(Boolean).length>=3,`${title} has a librarian’s note`);
    assert(!others.some(m=>m[2]===title||m[1]===id),`${title} is on no other new-arrivals shelf`);
    assert(!new RegExp(`\\[${id},'`).test(elsewhere)&&!new RegExp(`[\\[,]${id}[,\\]]`).test(game),`${title} (${id}) is not already in the library`);
  }
  assert.match(game,/curatedShelf\(newArrivals\.list\('ciphers'\)\.map\(book=>book\.id\)\.slice\(0,10\),47,7\.3,Math\.PI\)/);
  assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),/'ciphers'/);assert.match(fs.readFileSync('scripts/book-pages.mjs','utf8'),/'ciphers':'The Restricted Catalogue'/);
});
