const test=require('node:test');const assert=require('node:assert');const fs=require('fs');const zlib=require('zlib');
const antipodes=fs.readFileSync(__dirname+'/antipodes.js','utf8');
const plain=s=>s.toLowerCase().replace(/[^a-z]+/g,' ').trim();
test('every word given to South on the Endurance window is in South',()=>{
  const card=antipodes.match(/const ENDURANCE=\[([\s\S]*?)\];/)[1];
  const south=plain(zlib.gunzipSync(fs.readFileSync(__dirname+'/texts/bundled-gzip/pg5199.txt.gz')).toString('utf8'));
  const quotes=[...card.matchAll(/“([^”]+)”/g)].map(m=>m[1]);
  assert.ok(quotes.length>=2);
  for(const q of quotes)assert.ok(south.includes(plain(q)),q);
});
test('every word given to Cook on the Belgica calendar is in his book',()=>{
  const card=antipodes.match(/const BELGICA=\[([\s\S]*?)\];/)[1];
  const cook=plain(zlib.gunzipSync(fs.readFileSync(__dirname+'/texts/bundled-gzip/pg72211.txt.gz')).toString('utf8'));
  const quotes=[...card.matchAll(/“([^”]+)”/g)].map(m=>m[1]);assert.ok(quotes.length>=4);
  for(const q of quotes)assert.ok(cook.includes(plain(q)),q);
  for(const fact of ['amundsen','1st mate','march 14','1899','thirteen long months'])assert.ok(cook.includes(plain(fact)),fact);
});
test('the hut keeps its books low, in two rows of six, and the window adds no light',()=>{
  assert.match(antipodes,/key:'antarctic'[^}]*ids:\[[^\]]*58973[^\]]*\][^}]*max:12/);
  assert.match(antipodes,/Math\.floor\(i\/6\)/);assert.match(antipodes,/shelfBoards\(cx,back\+\.5,7\.8,'x',\[1\.35,2\.55\]\)/);
  const fn=antipodes.match(/function buildEndurance[\s\S]*?\n    }\n/)[0];assert.doesNotMatch(fn,/Light\(/);
});
test('the polar shelf has its own arrivals',()=>{
  const game=fs.readFileSync(__dirname+'/game.js','utf8'),books=fs.readFileSync(__dirname+'/data/new-books.js','utf8'),nb=fs.readFileSync(__dirname+'/scripts/new-books.mjs','utf8');
  assert.match(game,/antarctic:arrivalIds\('antarctic'\)/);assert.match(nb,/'antarctic'/);
  for(const id of [4229,69138,72211,6137,6721,36922,36802])assert.match(books,new RegExp(`\\[${id},[^\\n]*'antarctic'`),String(id));
});
