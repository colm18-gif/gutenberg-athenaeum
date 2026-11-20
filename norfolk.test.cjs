// Norfolk Island (norfolk-island.js), the fifth ship in a bottle: built for real with a stand-in for Three.js; its bottle
// on the Long Corridor's shelf, the house at Kingston and its verandah, its shelves filled from the catalogue, every
// quotation read against the library's own texts, and the reef where the Sirius was lost, bare at low tide.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('norfolk-island.js','utf8'),helenaSource=fs.readFileSync('st-helena.js','utf8'),tristanSource=fs.readFileSync('tristan-island.js','utf8'),pitcairnSource=fs.readFileSync('pitcairn-island.js','utf8'),shelfSource=fs.readFileSync('ships-in-bottles.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8'),montserratSource=fs.readFileSync('montserrat-room.js','utf8');
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
  const context={window:{},Math,Object,Array,Number,String,Set,Date};for(const s of [corridorSource,shelfSource,montserratSource,pitcairnSource,tristanSource,helenaSource,source])vm.runInNewContext(s,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],shown=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z)=>player.pos.set(x,0,z),bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id})};
  const corridor=context.window.createLongCorridor(shared),bottles=context.window.createShipsInBottles({...shared,corridor});
  for(const make of ['createMontserratRoom','createPitcairnIsland','createTristanIsland','createStHelena'])context.window[make]({...shared,bottles});
  const r=context.window.createNorfolkIsland({...shared,bottles,registerSeat:(parts,group,at,yaw,data)=>seats.push(data),showPicture:p=>shown.push(p),
    arrivals:{first:byRoom('norfolk-first'),sirius:byRoom('norfolk-sirius')},storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,corridor,bottles,player,interactables,notices,seats,shown,store,find:(type,key)=>interactables.find(o=>o.userData.type===type&&(key==null||o.userData.key===key))};
}

test('it loads after St Helena, before game.js, and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]),at=f=>order.indexOf(f);
  assert.ok(at('st-helena.js')<at('norfolk-island.js')&&at('norfolk-island.js')<at('game.js'),'Norfolk Island takes the fifth slot');
  for(const term of ['norfolkIsland.floorAt','norfolkIsland.allowed','norfolkIsland.interact','norfolkIsland.update',"if(norfolkIsland?.contains(x,z))return 'norfolk'",
    "norfolk:norfolkIsland&&(()=>norfolkIsland.enter())","sirius:'norfolk'","['norfolk','Norfolk Island']"])assert.ok(game.includes(term),term);
  for(const key of ['first','sirius'])assert.ok(game.includes(`arrivalIds('norfolk-${key}')`),key);
  assert.ok(ambience.includes('norfolk:{beds:'),'it has an ambience');
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.(Point|Directional|Spot)Light/g)||[]).length,2,'two lights, the sun and the lamp');
});

test('its bottle is the fifth and last on the shelf, and looking in goes to the house and back',()=>{
  const h=island();assert.deepEqual(Array.from(h.bottles.bottles,b=>b.key),['montserrat','pitcairn','tristan','st-helena','norfolk']);
  const bottle=h.find('bottle','norfolk');assert.ok(bottle);h.bottles.interact(bottle);
  assert.ok(h.r.built);assert.equal(h.r.zoneAt(h.player.pos.x,h.player.pos.z),'norfolk');assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.match(h.notices.at(-1),/Norfolk Island, on an autumn evening/);
  h.r.interact(h.find('norfolk-exit'));const p=h.player.pos;assert.ok(h.corridor.contains(p.x,p.z)&&h.corridor.allowed(p.x,p.z));
  assert.ok(Math.abs(p.z-(h.bottles.bay.z+h.bottles.slotX(4)))<1e-9,'in front of its own bottle');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed after the reader has gone');assert.ok(!h.interactables.some(o=>o.userData.norfolk||String(o.userData.type).startsWith('norfolk-')));
  assert.ok(h.find('bottle','norfolk'),'its bottle stays on the shelf');
});

test('the shelves hold the Pitcairners’ story and the settlements, every book resolved, with open floor and the verandah',()=>{
  const h=island();h.r.enter();const {groups}=h.r.catalogue(),ids=k=>Array.from(groups.find(g=>g.key===k).books,b=>b.id);
  assert.equal(ids('pitcairners')[0],69363,'Rosalind Young, of Pitcairn, heads the Pitcairners’ shelf');
  for(const id of [15662,4052,3424])assert.ok(ids('first').includes(id),`${id} on the settlements’ shelf`);
  for(const g of groups){assert.ok(g.books.length>=3,g.key);assert.ok(g.books.length<=g.max,`${g.key} fits its shelf`)}
  for(const id of [...h.r.own.pitcairners,...h.r.own.first])assert.ok(game.includes(`[${id},`)||arrivals.some(e=>e[0]===id),`${id} is always loaded`);
  const mine=arrivals.filter(e=>String(e[4]).startsWith('norfolk-'));assert.ok(mine.length>=3);
  for(const e of mine){assert.ok(resolved[e[1]]?.id===e[0],`${e[1]} resolved`);assert.ok(fs.existsSync(`texts/bundled-gzip/pg${e[0]}.txt.gz`),`${e[1]} bundled`);assert.ok(e[5].split(/[.!?]”?\s/).length>=3,`${e[1]} has a note`)}
  assert.equal(h.seats.length,3,'two chairs at the table and one on the verandah');
  const {cx,cz,d}=h.r.room,z1=cz+d/2;
  for(const [x,z,why] of [[cx,cz+.9,'arrival'],[cx-2.6,cz,'before the Pitcairners'],[cx+2.6,cz,'before the settlements'],[cx,z1,'the doorway'],[cx,z1+1.4,'the verandah'],[cx-3.6,z1+1.4,'the verandah’s west end']])
    assert.ok(h.r.allowed(x,z),`${why} (${(x-cx).toFixed(1)}, ${(z-cz).toFixed(1)}) is open floor`);
  assert.ok(!h.r.allowed(cx-2.6,z1),'not through the window');assert.ok(!h.r.allowed(cx,z1+h.r.verandah-.1),'the rail is the edge');assert.ok(!h.r.allowed(cx,cz-d/2),'not through the back wall');
});

test('every quotation is in its book, and every quotation on a card is one of them',()=>{
  const h=island();
  for(const [key,line] of Object.entries(h.r.quotes)){const id=h.r.sources[key];assert.ok(id,`${key} has a source`);assert.ok(letters(text(id)).includes(letters(line)),`${key} (${id}): ${line}`)}
  for(const [key,[,body]] of Object.entries(h.r.cards))for(const [,quoted] of body.matchAll(/“([^”]+)”/g))assert.ok(Object.values(h.r.quotes).includes(quoted),`${key}: “${quoted}”`);
  for(const [,quoted] of source.matchAll(/q\('([a-z]+)'\)/g))assert.ok(h.r.quotes[quoted],quoted);
  assert.match(h.r.cards.cook[1],/1774/);assert.match(h.r.cards.first[1],/6 March 1788/);assert.match(h.r.cards.sirius[1],/19 March 1790/);assert.match(h.r.cards.pitcairners[1],/Bounty Day/);
});

test('the pictures are public-domain files the workflow fetched, and looked at, open large',()=>{
  const credits=JSON.parse(fs.readFileSync('assets/pictures/pictures.json','utf8')),script=fs.readFileSync('scripts/fetch-maps.mjs','utf8');
  const h=island();h.r.enter();
  for(const [key,p] of Object.entries(h.r.pictures)){assert.ok(script.includes(`key: '${p.file}'`),p.file);for(const f of [`${p.file}.jpg`,`${p.file}-wall.jpg`])assert.ok(fs.existsSync(`assets/pictures/${f}`),f);
    assert.match(JSON.stringify(credits[p.file]),/public domain/i,`${p.file} is public domain`);assert.match(p.credit,/Public domain/);assert.ok(h.r.cards[p.card],`${key} has a card`);
    const frame=h.interactables.find(o=>o.userData.type==='norfolk-picture'&&o.userData.picture===key);assert.ok(frame,key);h.r.interact(frame);assert.equal(h.shown.at(-1).src,`assets/pictures/${p.file}.jpg`)}
  assert.equal(Object.keys(h.r.pictures).length,6);
});

test('the secret: at low tide the Sirius is on the reef, and Tench’s account is left on the verandah, for good',()=>{
  const h=island();h.r.enter();const reef=h.find('norfolk-reef');assert.ok(reef);const count=h.r.books.length;
  h.player.pos.set(h.r.room.cx,0,h.r.room.cz+3);h.r.update(1);assert.ok(!h.r.tideLow(),'the tide is in at first');
  h.r.interact(reef);assert.match(h.notices.at(-1),/tide is in/);assert.ok(!h.r.found);
  h.r.update(h.r.tide/2);assert.ok(h.r.tideLow(),'half a turn later it is out');h.r.interact(reef);
  assert.ok(h.r.found);assert.equal(h.store.get('athenaeum-norfolk-sirius'),'1');assert.match(h.notices.at(-1),/Sirius on the reef/);
  assert.equal(h.r.books.length,count+1,'a book is left on the verandah');assert.equal(h.r.books.at(-1).userData.book.id,3534);
  h.r.interact(reef);assert.equal(h.r.books.length,count+1,'left once');
  for(const again of [island({stored:['athenaeum-norfolk-sirius']}),island({search:'?room=norfolk&sirius'})]){again.r.enter();assert.ok(again.r.found);assert.ok(again.r.books.some(b=>b.userData.shelf==='secret'))}
});
