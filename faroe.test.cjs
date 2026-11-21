// The Faroe Islands (faroe-islands.js), the sixth ship in a bottle: built for real with a stand-in for Three.js; its
// bottle on the Long Corridor's shelf, the roykstova at Kirkjubøur and its yard, its shelves filled from the catalogue,
// every quotation read against the library's own texts, and the sea chest of the seal woman.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('faroe-islands.js','utf8');
const others=['long-corridor.js','ships-in-bottles.js','montserrat-room.js','pitcairn-island.js','tristan-island.js','st-helena.js','norfolk-island.js'].map(f=>fs.readFileSync(f,'utf8'));
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8'),islandSource=fs.readFileSync('island-bottles.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const arrivals=load('data/new-books.js','ATHENAEUM_NEW_BOOKS'),resolved=load('data/new-books-resolved.js','ATHENAEUM_NEW_BOOKS_RESOLVED').books;
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);
const text=id=>{const plain=`texts/pg${id}.txt`;return fs.existsSync(plain)?fs.readFileSync(plain,'utf8'):zlib.gunzipSync(fs.readFileSync(`texts/bundled-gzip/pg${id}.txt.gz`)).toString('utf8')};
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
  const context={window:{},Math,Object,Array,Number,String,Set,Date};for(const s of [...others,source])vm.runInNewContext(s,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],shown=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z)=>player.pos.set(x,0,z),bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id})};
  const corridor=context.window.createLongCorridor(shared),bottles=context.window.createShipsInBottles({...shared,corridor});
  for(const make of ['createMontserratRoom','createPitcairnIsland','createTristanIsland','createStHelena','createNorfolkIsland'])context.window[make]({...shared,bottles});
  const r=context.window.createFaroeIslands({...shared,bottles,registerSeat:(parts,group,at,yaw,data)=>seats.push(data),showPicture:p=>shown.push(p),
    arrivals:{islands:byRoom('faroe-islands'),sagas:byRoom('faroe-sagas'),neighbours:byRoom('faroe-neighbours'),seal:byRoom('faroe-seal')},storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,corridor,bottles,player,interactables,notices,seats,shown,store,find:(type,key)=>interactables.find(o=>o.userData.type===type&&(key==null||o.userData.key===key))};
}

test('it loads after Norfolk Island, before game.js, and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]),at=f=>order.indexOf(f);
  assert.ok(at('norfolk-island.js')<at('faroe-islands.js')&&at('faroe-islands.js')<at('island-bottles.js')&&at('island-bottles.js')<at('game.js'),'the Faroes take the sixth slot');
  for(const term of ['faroeIslands.floorAt','faroeIslands.allowed','faroeIslands.interact','faroeIslands.update',"if(faroeIslands?.contains(x,z))return 'faroe'",
    "faroe:faroeIslands&&(()=>faroeIslands.enter())","faroes:'faroe'","sealwoman:'faroe'","['faroe','The Faroe Islands']","burns:burnsRoom,faroe:faroeIslands"])assert.ok(game.includes(term),term);
  for(const key of ['islands','sagas','neighbours','seal'])assert.ok(game.includes(`arrivalIds('faroe-${key}')`),key);
  assert.ok(ambience.includes('faroe:{beds:'),'it has an ambience');
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.(Point|Directional|Spot)Light/g)||[]).length,2,'two lights, the fire and the night');
  assert.ok(!/destinations:\[[^\n]*'faroe'/.test(game),'the Wandering Door does not open on the island');
});

test('its bottle is the sixth and last on the shelf, and looking in goes to the roykstova and back',()=>{
  const h=island();assert.deepEqual(Array.from(h.bottles.bottles,b=>b.key),['montserrat','pitcairn','tristan','st-helena','norfolk','faroe']);assert.equal(h.bottles.slots,6);
  // The shelf is long enough for six bottles lying end to end, and still within its bay.
  const gap=h.bottles.slotX(1)-h.bottles.slotX(0),long=.605*h.bottles.scale;assert.ok(gap>long,`the bottles do not touch (${gap.toFixed(3)} for ${long.toFixed(3)})`);
  assert.ok(h.bottles.shelf.length<=4-.42,'the shelf fits between the pilasters');assert.ok(h.bottles.slotX(0)-.415*h.bottles.scale>-h.bottles.shelf.length/2&&h.bottles.slotX(5)+.19*h.bottles.scale<h.bottles.shelf.length/2,'every bottle lies on the shelf');
  const bottle=h.find('bottle','faroe');assert.ok(bottle);h.bottles.interact(bottle);
  assert.ok(h.r.built);assert.equal(h.r.zoneAt(h.player.pos.x,h.player.pos.z),'faroe');assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.match(h.notices.at(-1),/The Faroe Islands, on a light night/);
  h.r.interact(h.find('faroe-exit'));const p=h.player.pos;assert.ok(h.corridor.contains(p.x,p.z)&&h.corridor.allowed(p.x,p.z));
  assert.ok(Math.abs(p.z-(h.bottles.bay.z+h.bottles.slotX(5)))<1e-9,'in front of its own bottle');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed after the reader has gone');assert.ok(!h.interactables.some(o=>o.userData.faroe||String(o.userData.type).startsWith('faroe-')));
  assert.ok(h.find('bottle','faroe'),'its bottle stays on the shelf');
});

test('the shelves hold the islands, the sagas and the neighbours, every book resolved, with open floor and the yard',()=>{
  const h=island();h.r.enter();const {groups}=h.r.catalogue(),ids=k=>Array.from(groups.find(g=>g.key===k).books,b=>b.id);
  assert.equal(ids('islands')[0],40633,'Nansen, with Dicuil’s hermits, heads the islands');assert.ok(ids('islands').includes(71936),'Symington is there');
  assert.equal(ids('sagas')[0],598,'Heimskringla heads the sagas');
  for(const g of groups){assert.ok(g.books.length>=3,g.key);assert.ok(g.books.length<=g.max,`${g.key} fits its shelf`)}
  for(const id of Object.values(h.r.own).flat())assert.ok(game.includes(`[${id},`)||arrivals.some(e=>e[0]===id),`${id} is always loaded`);
  const mine=arrivals.filter(e=>String(e[4]).startsWith('faroe-'));assert.ok(mine.length>=7);
  for(const e of mine){assert.ok(resolved[e[1]]?.id===e[0],`${e[1]} resolved`);assert.ok(fs.existsSync(`texts/bundled-gzip/pg${e[0]}.txt.gz`),`${e[1]} bundled`);assert.ok(e[5].split(/[.!?]”?\s/).length>=3,`${e[1]} has a note`)}
  assert.equal(h.seats.length,3,'two chairs at the table and the bench in the yard');
  const {cx,cz,d,w}=h.r.room,z1=cz+d/2;
  for(const [x,z,why] of [[cx,cz+1.6,'arrival'],[cx-2.8,cz,'before the islands'],[cx+2.8,cz-1.3,'before the sagas'],[cx+2.8,cz+1.3,'before the neighbours'],[cx-2.6,cz-d/2+1.4,'before the chest'],
    [cx,z1,'the doorway'],[cx,z1+1.6,'the yard'],[cx+3.4,z1+2.4,'the yard’s east end'],[h.r.chestAt.x+.5,h.r.chestAt.z+1.0,'in front of the chest']])
    assert.ok(h.r.allowed(x,z),`${why} (${(x-cx).toFixed(1)}, ${(z-cz).toFixed(1)}) is open floor`);
  assert.ok(!h.r.allowed(cx-2,z1),'not through the wall beside the door');assert.ok(!h.r.allowed(cx,z1+h.r.yard-.1),'the yard wall is the edge');assert.ok(!h.r.allowed(cx,cz-d/2+.7),'not into the hearth');
  assert.ok(!h.r.allowed(cx-w/2-.2,cz),'not through the west wall');
});

test('every quotation is in its book, and every quotation on a card is one of them',()=>{
  const h=island();
  for(const [key,line] of Object.entries(h.r.quotes)){const id=h.r.sources[key];assert.ok(id,`${key} has a source`);assert.ok(letters(text(id)).includes(letters(line)),`${key} (${id}): ${line}`)}
  for(const [key,[,body]] of Object.entries(h.r.cards))for(const [,quoted] of body.matchAll(/“([^”]+)”/g))assert.ok(Object.values(h.r.quotes).includes(quoted),`${key}: “${quoted}”`);
  for(const [,quoted] of source.matchAll(/q\('([a-z]+)'\)/g))assert.ok(h.r.quotes[quoted],quoted);
  // The bottle in the Burns Room quotes Symington too.
  for(const [,quoted] of islandSource.matchAll(/“([^”]+)”/g))if(/Loch Long/.test(quoted))assert.ok(letters(text(71936)).includes(letters(quoted)),quoted);
  assert.match(h.r.cards.dicuil[1],/825/);assert.match(h.r.cards.language[1],/1846/);assert.match(h.r.cards.flag[1],/25 April 1940/);assert.match(h.r.cards.secret[1],/Mikladalur/);
});

test('the pictures are public-domain files the workflow fetched, and looked at, open large',()=>{
  const credits=JSON.parse(fs.readFileSync('assets/pictures/pictures.json','utf8')),script=fs.readFileSync('scripts/fetch-maps.mjs','utf8');
  const h=island();h.r.enter();
  for(const [key,p] of Object.entries(h.r.pictures)){assert.ok(script.includes(`key: '${p.file}'`),p.file);for(const f of [`${p.file}.jpg`,`${p.file}-wall.jpg`])assert.ok(fs.existsSync(`assets/pictures/${f}`),f);
    assert.match(JSON.stringify(credits[p.file]),/public domain/i,`${p.file} is public domain`);assert.match(p.credit,/Public domain/);assert.ok(h.r.cards[p.card],`${key} has a card`);
    const frame=h.interactables.find(o=>o.userData.type==='faroe-picture'&&o.userData.picture===key);assert.ok(frame,key);h.r.interact(frame);assert.equal(h.shown.at(-1).src,`assets/pictures/${p.file}.jpg`)}
  assert.equal(Object.keys(h.r.pictures).length,6);
});

test('the secret: the sea chest is empty, a seal looks back from the fjord, and Selous is left on the chest, for good',()=>{
  const h=island();h.r.enter();const chest=h.find('faroe-chest');assert.ok(chest);const count=h.r.books.length;assert.ok(!h.r.found);
  h.player.pos.set(h.r.room.cx,0,h.r.room.cz+1);h.r.update(1);h.r.interact(chest);
  assert.ok(h.r.found);assert.equal(h.store.get('athenaeum-faroe-seal'),'1');assert.match(h.notices.at(-1),/The seal woman/);assert.ok(h.r.sealShowing,'the seal is in the fjord');
  assert.equal(h.r.books.length,count+1,'a book is left on the chest');assert.equal(h.r.books.at(-1).userData.book.id,51429);
  for(let t=1.1;t<12;t+=.1)h.r.update(t);assert.ok(!h.r.sealShowing,'and gone again');
  h.r.interact(chest);assert.equal(h.r.books.length,count+1,'left once');assert.match(h.notices.at(-1),/seal looks back/);
  for(const again of [island({stored:['athenaeum-faroe-seal']}),island({search:'?room=faroe&sealwoman'})]){again.r.enter();assert.ok(again.r.found);assert.ok(again.r.books.some(b=>b.userData.shelf==='secret'))}
});
