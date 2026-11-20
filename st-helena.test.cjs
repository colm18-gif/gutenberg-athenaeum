// St Helena (st-helena.js), the fourth ship in a bottle: built for real with a stand-in for Three.js; its bottle on the
// Long Corridor's shelf, the garden room and the lawn of Plantation House, its shelves filled from the catalogue, every
// quotation read against the library's own texts, and Jonathan, who comes over to a reader who stands still.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('st-helena.js','utf8'),tristanSource=fs.readFileSync('tristan-island.js','utf8'),pitcairnSource=fs.readFileSync('pitcairn-island.js','utf8'),shelfSource=fs.readFileSync('ships-in-bottles.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8'),montserratSource=fs.readFileSync('montserrat-room.js','utf8');
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
  const context={window:{},Math,Object,Array,Number,String,Set,Date};for(const s of [corridorSource,shelfSource,montserratSource,pitcairnSource,tristanSource,source])vm.runInNewContext(s,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],shown=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z)=>player.pos.set(x,0,z),bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id})};
  const corridor=context.window.createLongCorridor(shared),bottles=context.window.createShipsInBottles({...shared,corridor});
  context.window.createMontserratRoom({...shared,bottles});context.window.createPitcairnIsland({...shared,bottles});context.window.createTristanIsland({...shared,bottles});
  const r=context.window.createStHelena({...shared,bottles,registerSeat:(parts,group,at,yaw,data)=>seats.push(data),showPicture:p=>shown.push(p),
    arrivals:{captive:byRoom('st-helena-captive'),jonathan:byRoom('st-helena-jonathan')},storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,corridor,bottles,player,interactables,notices,seats,shown,store,find:(type,key)=>interactables.find(o=>o.userData.type===type&&(key==null||o.userData.key===key))};
}
// Stand still at (x, z) for a while, a frame at a time.
function wait(h,x,z,seconds,from=0){h.player.pos.set(x,0,z);let t=from;for(;t<from+seconds;t+=1/30)h.r.update(t);return t}

test('it loads after Tristan, before game.js, and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]),at=f=>order.indexOf(f);
  assert.ok(at('tristan-island.js')<at('st-helena.js')&&at('st-helena.js')<at('game.js'),'St Helena takes the fourth slot');
  for(const term of ['stHelena.floorAt','stHelena.allowed','stHelena.interact','stHelena.update',"if(stHelena?.contains(x,z))return 'st-helena'",
    "'st-helena':stHelena&&(()=>stHelena.enter())","jonathan:'st-helena'","['st-helena','St Helena']"])assert.ok(game.includes(term),term);
  for(const key of ['captive','jonathan'])assert.ok(game.includes(`arrivalIds('st-helena-${key}')`),key);
  assert.ok(ambience.includes("'st-helena':{beds:"),'it has an ambience');
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.(Point|Directional|Spot)Light/g)||[]).length,2,'two lights, the sun and the lamp');
});

test('its bottle is the fourth on the shelf, and looking in goes to the garden room and back',()=>{
  const h=island();assert.deepEqual(Array.from(h.bottles.bottles,b=>b.key),['montserrat','pitcairn','tristan','st-helena']);assert.equal(h.bottles.slots,5);
  const bottle=h.find('bottle','st-helena');assert.ok(bottle);h.bottles.interact(bottle);
  assert.ok(h.r.built);assert.equal(h.r.zoneAt(h.player.pos.x,h.player.pos.z),'st-helena');assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.match(h.notices.at(-1),/St Helena, on a misty afternoon/);
  h.r.interact(h.find('sthelena-exit'));const p=h.player.pos;assert.ok(h.corridor.contains(p.x,p.z)&&h.corridor.allowed(p.x,p.z));
  assert.ok(Math.abs(p.z-(h.bottles.bay.z+h.bottles.slotX(3)))<1e-9,'in front of its own bottle');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed after the reader has gone');assert.ok(!h.interactables.some(o=>o.userData.sthelena||String(o.userData.type).startsWith('sthelena-')));
  assert.ok(h.find('bottle','st-helena'),'its bottle stays on the shelf');
});

test('the shelves hold Napoleon’s exile and the ships that called, every book resolved, with open floor to reach them and the lawn',()=>{
  const h=island();h.r.enter();const {groups}=h.r.catalogue(),ids=k=>Array.from(groups.find(g=>g.key===k).books,b=>b.id);
  for(const id of [53967,28934,35037,15246])assert.ok(ids('captive').includes(id),`${id} on the captive’s shelf`);
  assert.deepEqual(ids('callers'),[944,8106,6317],'Darwin, Cook and Slocum, who called');
  for(const g of groups){assert.ok(g.books.length>=3,g.key);assert.ok(g.books.length<=g.max,`${g.key} fits its shelf`)}
  for(const id of [...h.r.own.captive,...h.r.own.callers])assert.ok(game.includes(`[${id},`)||arrivals.some(e=>e[0]===id),`${id} is always loaded`);
  const mine=arrivals.filter(e=>String(e[4]).startsWith('st-helena-'));assert.ok(mine.length>=4);
  for(const e of mine){assert.ok(resolved[e[1]]?.id===e[0],`${e[1]} resolved`);assert.ok(fs.existsSync(`texts/bundled-gzip/pg${e[0]}.txt.gz`),`${e[1]} bundled`);assert.ok(e[5].split(/[.!?]”?\s/).length>=3,`${e[1]} has a note`)}
  assert.equal(h.seats.length,3,'the two chairs at the table and the bench on the lawn');
  const {cx,cz,d}=h.r.room,z0=cz-d/2;
  for(const [x,z,why] of [[cx,cz-.6,'arrival'],[cx-2.4,cz+.2,'before the captive'],[cx+2.4,cz+.2,'before the callers'],[cx,z0,'between the pillars'],[cx,z0-2,'the lawn'],[cx+6,z0-4,'the east of the lawn'],[cx-7,z0-10,'the far corner']])
    assert.ok(h.r.allowed(x,z),`${why} (${(x-cx).toFixed(1)}, ${(z-cz).toFixed(1)}) is open floor`);
  assert.ok(!h.r.allowed(cx,cz+d/2),'not through the back wall');assert.ok(!h.r.allowed(cx,z0-h.r.lawn.d-.1),'the lawn’s edge is the edge');assert.ok(!h.r.allowed(h.r.jonathan.x,h.r.jonathan.z),'not through Jonathan');
});

test('every quotation is in its book, and every quotation on a card is one of them',()=>{
  const h=island();
  for(const [key,line] of Object.entries(h.r.quotes)){const id=h.r.sources[key];assert.ok(id,`${key} has a source`);assert.ok(letters(text(id)).includes(letters(line)),`${key} (${id}): ${line}`)}
  for(const [key,[,body]] of Object.entries(h.r.cards))for(const [,quoted] of body.matchAll(/“([^”]+)”/g))assert.ok(Object.values(h.r.quotes).includes(quoted),`${key}: “${quoted}”`);
  for(const [,quoted] of source.matchAll(/q\('([a-z]+)'\)/g))assert.ok(h.r.quotes[quoted],quoted);
  for(const fact of [/1502/,/1659/])assert.match(h.r.cards.found[1],fact);assert.match(h.r.cards.napoleon[1],/5 May 1821/);assert.match(h.r.cards.napoleon[1],/1840/);assert.match(h.r.cards.jonathan[1],/1882/);
  for(const [key,[,body]] of Object.entries(h.r.cards))assert.doesNotMatch(body,/oldest (tortoise|animal) (in|on) (the )?(world|earth)/i,`${key} keeps Jonathan’s age to what is thought`);
});

test('the pictures are public-domain files the workflow fetched, and looked at, open large',()=>{
  const credits=JSON.parse(fs.readFileSync('assets/pictures/pictures.json','utf8')),script=fs.readFileSync('scripts/fetch-maps.mjs','utf8');
  const h=island();h.r.enter();
  for(const [key,p] of Object.entries(h.r.pictures)){assert.ok(script.includes(`key: '${p.file}'`),p.file);for(const f of [`${p.file}.jpg`,`${p.file}-wall.jpg`])assert.ok(fs.existsSync(`assets/pictures/${f}`),f);
    assert.match(JSON.stringify(credits[p.file]),/public domain|cc0/i,`${p.file} is free to use`);assert.match(p.credit,/Public domain|CC0/);assert.ok(h.r.cards[p.card],`${key} has a card`);
    const frame=h.interactables.find(o=>o.userData.type==='sthelena-picture'&&o.userData.picture===key);assert.ok(frame,key);h.r.interact(frame);assert.equal(h.shown.at(-1).src,`assets/pictures/${p.file}.jpg`)}
  assert.equal(Object.keys(h.r.pictures).length,6);
});

test('the secret: stand still on the lawn and Jonathan comes over, and Lawrence’s Tortoises is left on the bench, for good',()=>{
  const h=island();h.r.enter();const jon=h.r.jonathan,start={x:jon.x,z:jon.z},count=h.r.books.length;assert.ok(!h.r.found);
  // Walking about does not bring him: he comes only to a reader who waits.
  let t=0;for(let i=0;i<120;i++){h.player.pos.set(start.x-3+(i%2)*.4,0,start.z+3);h.r.update(t+=1/30)}assert.equal(jon.mode,'grazing','not while the reader keeps moving');
  const spot={x:start.x-3,z:start.z+4};t=wait(h,spot.x,spot.z,4,t);assert.equal(jon.mode,'coming','he sets off once the reader has stood still');
  t=wait(h,spot.x,spot.z,60,t);assert.equal(jon.mode,'arrived');assert.ok(Math.hypot(jon.x-spot.x,jon.z-spot.z)<1.7,'he stops short of the reader');
  assert.ok(h.r.found);assert.equal(h.store.get('athenaeum-sthelena-jonathan'),'1');assert.match(h.notices.at(-1),/Jonathan comes over/);
  assert.equal(h.r.books.length,count+1,'a book is left on the bench');assert.equal(h.r.books.at(-1).userData.book.id,22475);
  t=wait(h,spot.x,spot.z,10,t);assert.equal(h.r.books.length,count+1,'left once');
  for(const again of [island({stored:['athenaeum-sthelena-jonathan']}),island({search:'?room=st-helena&jonathan'})]){again.r.enter();assert.ok(again.r.found);assert.ok(again.r.books.some(b=>b.userData.shelf==='secret'))}
  const far=island();far.r.enter();wait(far,far.r.room.cx,far.r.room.cz,20);assert.equal(far.r.jonathan.mode,'grazing','not to a reader in the garden room');
});
