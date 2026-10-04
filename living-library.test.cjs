const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('living-library.js','utf8');
function fixture(initial={}){
  const values=new Map(Object.entries(initial)),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  const window={};vm.runInNewContext(code,{window});
  const books=[614,1874,120,11,16,84,27924,2701].map(id=>({id,title:'Book '+id,progress:0}));
  const create=()=>window.createLibraryMemory({storage,books});
  return {values,storage,books,create,memory:create(),window};
}
test('paper trails require each clue, survive reload, and do not expose unfound steps',()=>{
  const f=fixture(),m=f.memory;
  assert.equal(m.journal().length,0);
  assert.equal(m.encounter('signal-ledger'),null);
  assert.equal(m.encounter('read-27924'),null);
  assert.equal(m.encounter('sorting-slip').fresh,true);
  assert.equal(m.encounter('sorting-slip').fresh,false);
  assert.equal(m.journal()[0].entries.length,1);
  assert.equal(JSON.stringify(m.journal()).includes('signalman’s receipt'),false);
  const restored=f.create();assert.equal(restored.journal()[0].entries.length,1);
  assert.equal(restored.encounter('map-snark').fresh,true);
  assert.equal(restored.encounter('signal-ledger').fresh,true);
  assert.equal(restored.encounter('read-27924').complete,true);
  assert.equal(f.create().journal()[0].complete,true);
});
test('the traveller trail works separately and only finishes in its own book',()=>{
  const {memory:m}=fixture();m.encounter('returns-letter');
  assert.equal(m.encounter('map-treasure-island'),null);
  m.encounter('departures-label');m.encounter('map-treasure-island');
  assert.equal(m.encounter('read-27924'),null);
  assert.equal(m.encounter('read-120').complete,true);
  assert.equal(m.journal().length,1);
});
test('return histories are stable within a visit and change on the next visit',()=>{
  const f=fixture(),a=f.memory.returnSlips();
  assert.equal(a.length,3);assert.equal(new Set(a.map(x=>x.book.id)).size,3);
  assert.equal(JSON.stringify(a),JSON.stringify(f.memory.returnSlips()));
  assert.notEqual(JSON.stringify(a),JSON.stringify(f.create().returnSlips()));
  assert.ok(a.every(x=>f.books.includes(x.book)&&x.text));
  const empty=f.window.createLibraryMemory({storage:f.storage,books:[]});assert.equal(empty.returnSlips().length,0);
});
test('resume includes the first page, uses last-read time and excludes completed or invalid records',()=>{
  const f=fixture();
  const set=(id,p,n,t)=>f.values.set('athenaeum-progress-'+id,JSON.stringify({p,n,t}));
  set(614,.4,100,10);set(1874,0,300,30);set(120,.001,700,20);
  set(11,.96,100,40);set(16,.1,1,50);f.values.set('athenaeum-progress-84','bad JSON');
  assert.deepEqual(Array.from(f.memory.unfinished(),b=>b.id),[1874,120,614]);
  f.books[1].progress=1;assert.deepEqual(Array.from(f.memory.unfinished(),b=>b.id),[120,614]);
});
test('the librarian only acknowledges actual discoveries, once, with repeatable topics',()=>{
  const f=fixture(),known=new Set();assert.equal(f.memory.greeting(known),null);assert.equal(f.memory.conversations(known).length,0);
  f.values.set('athenaeum-kells-found','1');assert.match(f.memory.greeting(known),/turf/);assert.equal(f.memory.greeting(known),null);
  assert.equal(f.create().greeting(known),null);assert.equal(f.memory.conversations(known)[0].id,'kells');
  known.add('antipodes');assert.match(f.memory.greeting(known),/southern stars/);
  known.add('map-room');assert.match(f.memory.greeting(known),/blank one/);
  assert.ok(f.memory.conversations(known)[0].text.includes('Periodicals'));
});
test('corrupt and unavailable local storage leave exploration usable',()=>{
  for(const value of ['null','[]','broken','{"visit":-4,"clues":["signal-ledger","read-27924"],"heard":2}']){
    const f=fixture({'athenaeum-library-memory-v1':value});assert.equal(f.memory.journal().length,0);assert.equal(f.memory.encounter('sorting-slip').fresh,true);
  }
  const f=fixture(),m=f.window.createLibraryMemory({books:f.books,storage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}});
  assert.equal(m.encounter('returns-letter').fresh,true);assert.equal(m.journal().length,1);assert.equal(m.returnSlips().length,3);
});
test('every secret edition has a complete local text instead of relying on an external fetch',()=>{
  const zlib=require('node:zlib');
  const copies={174:'texts/pg174.txt',1952:'texts/pg1952.txt',8492:'texts/bundled-gzip/pg8492.txt.gz',10002:'texts/pg10002.txt',456:'texts/pg456.txt',28174:'texts/pg28174.txt',900002:'texts/open-access/a-voyage-to-arcturus.txt'};
  const ids=[...code.matchAll(/\{id:(\d+),room:'/g)].map(match=>Number(match[1]));
  assert.deepEqual(ids.slice().sort((a,b)=>a-b),Object.keys(copies).map(Number).sort((a,b)=>a-b));
  for(const [id,path] of Object.entries(copies)){const raw=fs.readFileSync(path),text=path.endsWith('.gz')?zlib.gunzipSync(raw).toString():raw.toString();assert(text.length>10000,'Full local edition for '+id);}
});
