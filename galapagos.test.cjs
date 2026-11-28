// The Galápagos (galapagos-island.js), the seventh ship in a bottle and the first on the shelf's lower tier: built for real
// with a stand-in for Three.js; its bottle, the shelter at Post Office Bay and its beach, its shelves filled from the
// catalogue, every quotation read against the library's own texts, and the post-office barrel.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('galapagos-island.js','utf8');
const others=['long-corridor.js','ships-in-bottles.js','montserrat-room.js','pitcairn-island.js','tristan-island.js','st-helena.js','norfolk-island.js','faroe-islands.js'].map(f=>fs.readFileSync(f,'utf8'));
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const arrivals=load('data/new-books.js','ATHENAEUM_NEW_BOOKS');
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);
const hasText=id=>fs.existsSync(`texts/pg${id}.txt`)||fs.existsSync(`texts/bundled-gzip/pg${id}.txt.gz`);
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
  for(const make of ['createMontserratRoom','createPitcairnIsland','createTristanIsland','createStHelena','createNorfolkIsland','createFaroeIslands'])context.window[make]({...shared,bottles});
  const r=context.window.createGalapagosIsland({...shared,bottles,registerSeat:(parts,group,at,yaw,data)=>seats.push(data),showPicture:p=>shown.push(p),
    arrivals:{beagle:byRoom('galapagos-beagle'),whalers:byRoom('galapagos-whalers'),encantadas:byRoom('galapagos-encantadas')},storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,corridor,bottles,player,interactables,notices,seats,shown,store,find:(type,key)=>interactables.find(o=>o.userData.type===type&&(key==null||o.userData.key===key))};
}

test('it loads after the Faroes, before game.js, and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]),at=f=>order.indexOf(f);
  assert.ok(at('faroe-islands.js')<at('galapagos-island.js')&&at('galapagos-island.js')<at('island-bottles.js')&&at('island-bottles.js')<at('game.js'),'the Galápagos take the seventh slot');
  for(const term of ['galapagosIsland.floorAt','galapagosIsland.allowed','galapagosIsland.interact','galapagosIsland.update',"if(galapagosIsland?.contains(x,z))return 'galapagos'",
    "galapagos:galapagosIsland&&(()=>galapagosIsland.enter())","floreana:'galapagos'","encantadas:'galapagos'","['galapagos','The Galápagos']","galapagos:galapagosIsland,naturalist:naturalistRoom"])assert.ok(game.includes(term),term);
  for(const key of ['beagle','whalers','encantadas'])assert.ok(game.includes(`arrivalIds('galapagos-${key}')`),key);
  assert.ok(ambience.includes('galapagos:{beds:'),'it has an ambience');
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.(Point|Directional|Spot)Light/g)||[]).length,2,'two lights, the sun and the lantern');
  assert.ok(!/destinations:\[[^\n]*'galapagos'/.test(game),'the Wandering Door does not open on the island');
});

test('its bottle is the seventh, the first on the shelf’s lower tier, and looking in goes to the bay and back',()=>{
  const h=island();assert.deepEqual(Array.from(h.bottles.bottles,b=>b.key),['montserrat','pitcairn','tristan','st-helena','norfolk','faroe','galapagos']);
  assert.equal(h.bottles.slots,6);assert.equal(h.bottles.tiers,2);assert.ok(h.bottles.slotY(6)<h.bottles.slotY(5)-.4,'a tier below the first');
  assert.equal(h.bottles.slotX(6),h.bottles.slotX(0),'at the head of its tier');
  const bottle=h.find('bottle','galapagos');assert.ok(bottle);h.bottles.interact(bottle);
  assert.ok(h.r.built);assert.equal(h.r.zoneAt(h.player.pos.x,h.player.pos.z),'galapagos');assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.match(h.notices.at(-1),/The Galápagos, at dusk/);
  h.r.interact(h.find('galapagos-exit'));const p=h.player.pos;assert.ok(h.corridor.contains(p.x,p.z)&&h.corridor.allowed(p.x,p.z));
  assert.ok(Math.abs(p.z-(h.bottles.bay.z+h.bottles.slotX(6)))<1e-9,'in front of its own bottle');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed after the reader has gone');assert.ok(!h.interactables.some(o=>o.userData.galapagos||String(o.userData.type).startsWith('galapagos-')));
  assert.ok(h.find('bottle','galapagos'),'its bottle stays on the shelf');
});

test('the beach can be walked from the shelter to the barrel, the bench and the tortoise, and not into the sea or through the walls',()=>{
  const h=island();h.r.enter();const {cx,cz,w,d}=h.r.room,z1=cz+d/2;
  const walk=(a,b)=>{for(let i=0;i<=60;i++){const t=i/60,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(!h.r.allowed(x,z))return [x,z]}return null};
  const start=[cx,cz+.6];
  for(const [name,to] of [['the barrel',[h.r.barrel.x-.9,h.r.barrel.z]],['the beach',[cx,z1+4]],['the bench',[cx-.8,z1+4.6]],['the tortoise',[cx-4.2,z1+2.6]]]){
    const blocked=walk(start,[cx,z1+1])||walk([cx,z1+1],to);assert.equal(blocked,null,`to ${name}: blocked at ${blocked}`)}
  assert.ok(!h.r.allowed(cx,z1+h.r.beach+.5),'not out over the lava into the sea');
  assert.ok(!h.r.allowed(cx-w/2-.3,cz),'not through the west wall');assert.ok(!h.r.allowed(cx,cz-d/2+.2),'not through the back wall');
});

test('the shelves hold the Beagle, the whalers and the argument, every book always loaded and every note in three sentences',()=>{
  const h=island();h.r.enter();const {groups}=h.r.catalogue(),ids=k=>Array.from(groups.find(g=>g.key===k).books,b=>b.id);
  assert.equal(ids('beagle')[0],944,'Darwin’s own Voyage heads the Beagle’s');assert.equal(ids('whalers')[0],2701,'Moby-Dick heads the whalers');assert.equal(ids('taught')[0],1228,'the Origin heads the argument');
  for(const g of groups){assert.ok(g.books.length>=2,g.key);assert.ok(g.books.length<=g.max,`${g.key} fits its shelf`)}
  for(const id of Object.values(h.r.own).flat())assert.ok(game.includes(`[${id},`)||game.includes(`id:${id},`)||arrivals.some(e=>e[0]===id)||fs.readFileSync('data/after-dark-books.js','utf8').includes(`${id}`),`${id} is always loaded`);
  for(const row of arrivals.filter(e=>String(e[4]).startsWith('galapagos-')))assert.ok(row[5].split(/(?<=[.!?])\s+/).length>=3,`${row[1]} has a three-sentence note`);
  assert.deepEqual(Array.from(byRoom('galapagos-encantadas')),[15859],'The Piazza Tales waits in the barrel');
  const shelved=h.r.books.map(b=>b.userData.shelf);for(const k of ['beagle','whalers','taught'])assert.ok(shelved.includes(k),k);assert.ok(!shelved.includes('secret'),'nothing on the barrel yet');
  assert.ok(h.seats.length>=2,'the sea chest and the bench are seats');
});

test('every quotation is in its book, and every card quotes only them',()=>{
  const h=island();
  for(const [key,quote] of Object.entries(h.r.quotes)){const id=h.r.sources[key];assert.ok(id,key);if(!hasText(id))continue;assert.ok(letters(text(id)).includes(letters(quote)),`${key} is in ${id}`)}
  const allowed=Object.values(h.r.quotes).map(s=>s.replace(/--/g,'—'));
  for(const [title,body] of Object.values(h.r.cards))for(const m of body.matchAll(/“([^”]+)”/g))assert.ok(allowed.includes(m[1]),`${title}: “${m[1]}” is one of the quotations`);
});

test('its pictures are on disk, and open large',()=>{
  const h=island();for(const p of Object.values(h.r.pictures))for(const suffix of ['','-wall'])assert.ok(fs.existsSync(`assets/pictures/${p.file}${suffix}.jpg`),`${p.file}${suffix}.jpg`);
  h.r.enter();const chart=h.interactables.find(o=>o.userData.type==='galapagos-picture'&&o.userData.picture==='chart');assert.ok(chart);
  assert.ok(h.r.interact(chart));assert.match(h.shown[0].src,/galapagos-chart\.jpg$/);assert.match(h.shown[0].credit,/Public domain/);
});

test('looking in the barrel finds Melville’s Piazza Tales, found for good',()=>{
  const h=island();h.r.enter();const barrel=h.find('galapagos-barrel');assert.ok(barrel);assert.equal(barrel.userData.action,'LOOK IN');
  assert.ok(h.r.interact(barrel));assert.match(h.notices.at(-1),/Piazza Tales/);assert.equal(h.store.get('athenaeum-galapagos-barrel'),'1');
  assert.ok(h.r.books.some(b=>b.userData.shelf==='secret'&&b.userData.book.id===15859),'the book is on the barrel’s lid');
  h.r.interact(barrel);assert.match(h.notices.at(-1),/Post Office Bay/,'after that, the barrel tells its tradition');
  const again=island({stored:['athenaeum-galapagos-barrel']});again.r.enter();assert.ok(again.r.books.some(b=>b.userData.shelf==='secret'),'found for good');
  const linked=island({search:'?barrel'});linked.r.enter();assert.ok(linked.r.found);
});
