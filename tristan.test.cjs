// Tristan da Cunha (tristan-island.js), the third ship in a bottle: built for real with a stand-in for Three.js; its
// bottle on the Long Corridor's shelf, the cottage and its yard, its shelves filled from the catalogue, every quotation
// read against the library's own texts, and the telescope that finds the ships of the library's books.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('tristan-island.js','utf8'),pitcairnSource=fs.readFileSync('pitcairn-island.js','utf8'),shelfSource=fs.readFileSync('ships-in-bottles.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8'),montserratSource=fs.readFileSync('montserrat-room.js','utf8');
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const arrivals=load('data/new-books.js','ATHENAEUM_NEW_BOOKS'),resolved=load('data/new-books-resolved.js','ATHENAEUM_NEW_BOOKS_RESOLVED').books;
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);
const text=id=>zlib.gunzipSync(fs.readFileSync(`texts/bundled-gzip/pg${id}.txt.gz`)).toString('utf8');
const letters=s=>s.toLowerCase().replace(/[^a-z]/g,'');

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  let self;const scale=Object.assign(function(){return self},{x:1,y:1,z:1,set(){return scale}});
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},rotation:{x:0,y:0,z:0,set(){return this}},quaternion:{clone:()=>({})},material:{opacity:1},
    add(...c){for(const x of c){x.parent=self;t.children.push(x)}return self},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(self),1);t.parent=null},
    traverse(fn){fn(self);for(const c of t.children)c.traverse?.(fn)}};
  return self=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
function island({stored=[],search=''}={}){
  const context={window:{},Math,Object,Array,Number,String,Set,Date};for(const s of [corridorSource,shelfSource,montserratSource,pitcairnSource,source])vm.runInNewContext(s,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],shown=[],tones=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z)=>player.pos.set(x,0,z),bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id})};
  const corridor=context.window.createLongCorridor(shared),bottles=context.window.createShipsInBottles({...shared,corridor});
  context.window.createMontserratRoom({...shared,bottles});context.window.createPitcairnIsland({...shared,bottles});
  const r=context.window.createTristanIsland({...shared,bottles,registerSeat:(parts,group,at,yaw,data)=>seats.push(data),showPicture:p=>shown.push(p),tone:(...a)=>tones.push(a),
    arrivals:{island:byRoom('tristan-island'),ships:byRoom('tristan-ships'),atlantic:byRoom('tristan-atlantic')},
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,corridor,bottles,player,interactables,notices,seats,shown,tones,store,find:(type,key)=>interactables.find(o=>o.userData.type===type&&(key==null||o.userData.key===key))};
}


test('it loads after Pitcairn, before game.js, and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]),at=f=>order.indexOf(f);
  assert.ok(at('pitcairn-island.js')<at('tristan-island.js')&&at('tristan-island.js')<at('game.js'),'Tristan takes the third slot');
  for(const term of ['tristanIsland.floorAt','tristanIsland.allowed','tristanIsland.interact','tristanIsland.update',"if(tristanIsland?.contains(x,z))return 'tristan'",
    "tristan:tristanIsland&&(()=>tristanIsland.enter())","'tristan-da-cunha':'tristan'","['tristan','Tristan da Cunha']"])assert.ok(game.includes(term),term);
  for(const key of ['island','ships','atlantic'])assert.ok(game.includes(`arrivalIds('tristan-${key}')`),key);
  assert.ok(ambience.includes('tristan:{beds:'),'it has an ambience');
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.(Point|Directional|Spot)Light/g)||[]).length,2,'two lights, the sun and the fire');
});

test('its bottle is the third on the shelf, and looking in goes to the cottage and back',()=>{
  const h=island();assert.deepEqual(Array.from(h.bottles.bottles,b=>b.key),['montserrat','pitcairn','tristan']);
  const bottle=h.find('bottle','tristan');assert.ok(bottle);h.bottles.interact(bottle);
  assert.ok(h.r.built);assert.equal(h.r.zoneAt(h.player.pos.x,h.player.pos.z),'tristan');assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.match(h.notices.at(-1),/Tristan da Cunha, on an evening/);
  h.r.interact(h.find('tristan-exit'));const p=h.player.pos;assert.ok(h.corridor.contains(p.x,p.z)&&h.corridor.allowed(p.x,p.z));
  assert.ok(Math.abs(p.z-(h.bottles.bay.z+h.bottles.slotX(2)))<1e-9,'in front of its own bottle');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed after the reader has gone');assert.ok(!h.interactables.some(o=>o.userData.tristan||String(o.userData.type).startsWith('tristan-')));
  assert.ok(h.find('bottle','tristan'),'its bottle stays on the shelf');
});

test('the shelves hold the island’s one book first and the ships that called, every book resolved, with open floor to reach them and the door the only way out to the yard',()=>{
  const h=island();h.r.enter();const {groups}=h.r.catalogue(),ids=k=>Array.from(groups.find(g=>g.key===k).books,b=>b.id);
  assert.ok(ids('island').includes(8213),'Katherine Barrow’s book is on the island’s shelf');assert.equal(ids('ships')[0],51060,'Poe’s Pym, who meets Glass, heads the ships');
  for(const g of groups){assert.ok(g.books.length>=2,g.key);assert.ok(g.books.length<=g.max,`${g.key} fits its shelf`)}
  for(const id of [...h.r.own.island,...h.r.own.ships,...h.r.own.atlantic,10339])assert.ok(game.includes(`[${id},`)||arrivals.some(e=>e[0]===id)||fs.readFileSync('data/after-dark-books.js','utf8').includes(`id:${id},`),`${id} is always loaded`);
  const mine=arrivals.filter(e=>String(e[4]).startsWith('tristan-'));assert.ok(mine.length>=5);
  for(const e of mine){assert.ok(resolved[e[1]]?.id===e[0],`${e[1]} resolved`);assert.ok(fs.existsSync(`texts/bundled-gzip/pg${e[0]}.txt.gz`),`${e[1]} bundled`);assert.ok(e[5].split(/[.!?]”?\s/).length>=3,`${e[1]} has a note`)}
  assert.equal(h.seats.length,2,'the two chairs at the table');
  const {cx,cz}=h.r.room,z0=cz-h.r.room.d/2,door=h.r.door.x;
  for(const [x,z,why] of [[cx+.4,cz+1.6,'arrival'],[cx-2.6,cz,'before the ships'],[cx-2.3,cz+1.6,'before the island'],[cx+2.3,cz+1.6,'before the atlantic'],[door,z0+.8,'inside the door'],[door,z0,'the doorway'],[door,z0-1,'outside the door'],[cx+2.6,z0-2.2,'the yard'],[cx-1.3,z0-3.6,'by the longboat'],[cx-.6,z0+.9,'at the window']])
    assert.ok(h.r.allowed(x,z),`${why} (${x-cx}, ${z-cz}) is open floor`);
  assert.ok(!h.r.allowed(cx-1,z0),'not through the window');assert.ok(!h.r.allowed(cx-3,z0),'not through the wall');assert.ok(!h.r.allowed(cx,z0-h.r.yard-.1),'the yard wall is the edge');
});

test('every quotation is in its book, and every quotation on a card is one of them',()=>{
  const h=island();
  for(const [key,line] of Object.entries(h.r.quotes)){const id=h.r.sources[key];assert.ok(id,`${key} has a source`);assert.ok(letters(text(id)).includes(letters(line)),`${key} (${id}): ${line}`)}
  for(const [key,[,body]] of Object.entries(h.r.cards))for(const [,quoted] of body.matchAll(/“([^”]+)”/g))assert.ok(Object.values(h.r.quotes).includes(quoted),`${key}: “${quoted}”`);
  for(const ship of h.r.ships)for(const [,quoted] of ship.text.matchAll(/“([^”]+)”/g))assert.ok(Object.values(h.r.quotes).includes(quoted),`${ship.key}: “${quoted}”`);
  for(const [,quoted] of source.matchAll(/q\('([a-z]+)'\)/g))assert.ok(h.r.quotes[quoted],quoted);
  for(const fact of [/1506/,/1816/,/Napoleon/])assert.match(h.r.cards.found[1],fact);assert.match(h.r.cards.eruption[1],/10 October/);assert.match(h.r.cards.eruption[1],/1963/);assert.match(h.r.cards.village[1],/1867/);
});

test('the pictures are public-domain files the workflow fetched, and looked at, open large',()=>{
  const credits=JSON.parse(fs.readFileSync('assets/pictures/pictures.json','utf8')),script=fs.readFileSync('scripts/fetch-maps.mjs','utf8');
  const h=island();h.r.enter();
  for(const [key,p] of Object.entries(h.r.pictures)){assert.ok(script.includes(`key: '${p.file}'`),p.file);for(const f of [`${p.file}.jpg`,`${p.file}-wall.jpg`])assert.ok(fs.existsSync(`assets/pictures/${f}`),f);
    assert.match(JSON.stringify(credits[p.file]),/public domain/i,`${p.file} is public domain`);assert.match(p.credit,/Public domain/);assert.ok(h.r.cards[p.card],`${key} has a card`);
    const frame=h.interactables.find(o=>o.userData.type==='tristan-picture'&&o.userData.picture===key);assert.ok(frame,key);h.r.interact(frame);assert.equal(h.shown.at(-1).src,`assets/pictures/${p.file}.jpg`)}
  assert.equal(Object.keys(h.r.pictures).length,6);
});

test('the secret: the telescope finds the ships of three books, and leaves An Antarctic Mystery on the sill, for good',()=>{
  const h=island();h.r.enter();const scope=h.find('tristan-telescope');assert.ok(scope);assert.ok(!h.r.found);
  const count=h.r.books.length;
  h.r.interact(scope);assert.match(h.notices.at(-1),/Jane/);h.r.interact(scope);assert.match(h.notices.at(-1),/Duncan/);assert.ok(!h.r.found,'not yet');
  h.r.interact(scope);assert.ok(h.r.found);assert.equal(h.store.get('athenaeum-tristan-ships'),'1');assert.ok(h.notices.at(-1).includes(h.r.quotes.many));
  assert.equal(h.r.books.length,count+1,'a book is left on the sill');assert.equal(h.r.books.at(-1).userData.book.id,10339);
  for(let t=0;t<10;t+=.1)h.r.update(t);h.r.interact(scope);assert.equal(h.r.books.length,count+1,'left once');
  for(const again of [island({stored:['athenaeum-tristan-ships']}),island({search:'?room=tristan&glass'})]){again.r.enter();assert.ok(again.r.found);assert.ok(again.r.books.some(b=>b.userData.shelf==='secret'))}
});
