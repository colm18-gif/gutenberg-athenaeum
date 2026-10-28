const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),wing=fs.readFileSync('international-wing.js','utf8'),fetcher=fs.readFileSync('scripts/fetch-book-pages.mjs','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/peresopnytsia/peresopnytsia.json','utf8'));
const context={window:{},Math,setTimeout};for(const f of ['fine-books.js','peresopnytsia-book.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),context);
const book=context.window.createPeresopnytsiaBook({THREE:{},renderer:{}});

test('the Peresopnytsia Gospel loads before the game, lies under glass in the Ukrainian room and stops the world while it is open',()=>{
  assert(html.indexOf("startupScript('peresopnytsia-book.js')")>html.indexOf("startupScript('fine-books.js')"));
  assert.match(game,/peresopnytsiaBook=window\.createPeresopnytsiaBook\?\.\(fineBookOptions\)/);assert.match(game,/\|\|peresopnytsiaBook\?\.isOpen(\|\||\))/);
  assert.match(game,/createInternationalWing\?\.\(\{doorKit:getDoorKit\(\),tone:pianoTone,gospel:peresopnytsiaBook,/);
  assert.match(wing,/type:'intl-gospel'/);assert.match(wing,/data\.type==='intl-gospel'\)\{if\(gospel\)gospel\.open\(\)/);
  assert.match(wing,/page\('mark',-1\),right=page\('l129',1\)/,'the case lies open at Mark and the first page of his Gospel');
});

test('every page of the Gospel has a card and a public-domain image, and Mark and John face their Gospels',()=>{
  const folios=Object.keys(book.folios),block=fetcher.slice(fetcher.indexOf('peresopnytsia: {'),fetcher.indexOf('BOOKS.audubon')),fetched=[...block.matchAll(/key: '([a-z0-9]+)'/g)].map(m=>m[1]);
  assert.deepEqual(fetched,folios,'scripts/fetch-book-pages.mjs fetches the same pages, in the same order');
  for(const key of folios){
    const [label,title,note]=book.folios[key];assert(label&&title&&note.length>60,`${key} has a card`);
    assert(fs.existsSync(`assets/peresopnytsia/${key}.jpg`),`${key}.jpg`);assert.match(manifest[key]?.licence||'',/public domain|^pd|cc0/i,`${key} is in the public domain`);
  }
  for(const key of ['mark','l129'])assert(fs.existsSync(`assets/peresopnytsia/${key}-case.jpg`),`${key}-case.jpg for the case`);
  assert.equal(new Set(book.faces).size,book.faces.length);assert.equal(book.faces.length,2*book.pages);
  const spreads=Array.from({length:book.pages},(_,i)=>[...book.spreadAt(i+1)].join('|'));
  assert(spreads.includes('mark|l129'));assert(spreads.includes('l340|john'));assert(spreads.includes('l082|ukraine'));
  assert.equal(spreads.at(-1),'colophon|paste-back');
});
