// The Indian room (india-room.js): built for real with a stand-in for Three.js, entered from the Long Corridor,
// its shelves filled from the catalogue, its books in English and none of them Russian.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('india-room.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8');
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const arrivals=load('data/new-books.js','ATHENAEUM_NEW_BOOKS');
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  let self;const scale=Object.assign(function(){return self},{x:1,y:1,z:1,set(){return scale}});
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},rotation:{x:0,y:0,z:0,set(){return this}},quaternion:{clone:()=>({})},
    add(...c){for(const x of c){x.parent=self;t.children.push(x)}return self},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(self),1);t.parent=null},
    traverse(fn){fn(self);for(const c of t.children)c.traverse?.(fn)}};
  return self=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
function room({stored=[],search='',tone}={}){
  const context={window:{},Math,Object,Array,Number,String,Set,Date};vm.runInNewContext(corridorSource,context);vm.runInNewContext(source,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z)=>player.pos.set(x,0,z)};
  const corridor=context.window.createLongCorridor(shared);
  const r=context.window.createIndiaRoom({...shared,corridor,bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id}),registerSeat:(parts,group,at,yaw,data)=>seats.push(data),
    arrivals:{tagore:byRoom('india-tagore'),poets:byRoom('india-poets'),epics:byRoom('india-epics'),tales:byRoom('india-tales'),history:byRoom('india-history'),vampire:byRoom('india-vampire')},
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search,tone});
  return {r,corridor,player,interactables,notices,seats,store};
}

test('it loads before game.js and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert.ok(order.indexOf('india-room.js')>order.indexOf('long-corridor.js')&&order.indexOf('india-room.js')<order.indexOf('game.js'));
  for(const term of ['indiaRoom.floorAt','indiaRoom.allowed','indiaRoom.interact','indiaRoom.update',"if(indiaRoom?.contains(x,z))return 'india-room'","'india-room':indiaRoom&&(()=>indiaRoom.enter())"])assert.ok(game.includes(term),term);
  for(const key of ['tagore','poets','epics','tales','history','vampire'])assert.ok(game.includes(`arrivalIds('india-${key}')`),key);
  assert.ok(ambience.includes("'india-room':{beds:"),'it has an ambience');
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.PointLight/g)||[]).length,1,'one lamp');
});

test('its door is in the Long Corridor’s fifth west bay, on bare wall, and stays when the room is freed',()=>{
  const h=room(),c=h.corridor,d=h.r.door;
  assert.deepEqual({side:d.side,bay:d.bay},{side:'west',bay:4});assert.equal(d.z,c.bayZ(4));
  for(const other of [c.foodDoor,c.dickinsonDoor])assert.notEqual(d.bay,other.bay);
  assert.match(corridorSource,/if\(side===INDIA_DOOR\.side&&k===INDIA_DOOR\.bay\)continue/,'no panel behind the door');
  assert.match(source,/onward:'towards the Grand Hall',label:'THE LONG CORRIDOR'/);
  const door=h.interactables.find(o=>o.userData.type==='india-door');assert.ok(door,'hung at startup');
  assert.ok(h.r.interact(door));assert.ok(h.r.built);assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.ok(h.r.interact(h.interactables.find(o=>o.userData.type==='india-exit')));assert.ok(c.contains(h.player.pos.x,h.player.pos.z)&&c.allowed(h.player.pos.x,h.player.pos.z),'and comes out in the corridor');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed a while after the reader has gone');assert.ok(h.interactables.includes(door));assert.ok(!h.interactables.some(o=>o.userData.india||o.userData.type==='india-card'));
});

test('the shelves are filled from the catalogue and none is by a Russian author',()=>{
  const h=room();h.r.enter();const {groups}=h.r.catalogue();
  for(const g of groups)assert.ok(g.books.length>=1,g.key);
  const mine=arrivals.filter(e=>String(e[4]).startsWith('india-'));assert.ok(mine.length>=50);
  const blocked=/blavatsk|tolstoy|dostoevsk|dostoyevsk|chekhov|pushkin|gogol|turgenev/i;
  for(const e of mine)assert.ok(!blocked.test(e[2]),e[1]);
  for(const g of groups)assert.ok(g.books.length<=g.max);
});

test('the goblin at the window leaves Vikram and the Vampire, found once and kept',()=>{
  const h=room();h.r.enter();const window_=h.interactables.find(o=>o.userData.type==='india-window');assert.ok(window_);
  assert.ok(!h.r.found);assert.ok(h.r.interact(window_));assert.ok(h.r.found);assert.equal(h.store.get('athenaeum-india-vetala'),'1');
  assert.ok(h.r.books.some(b=>b.userData.shelf==='vampire'),'the book is on the sill');
  const again=room({stored:['athenaeum-india-vetala']});again.r.enter();assert.ok(again.r.found);assert.ok(again.r.books.some(b=>b.userData.shelf==='vampire'));
  const shown=room({search:'?vetala'});shown.r.enter();assert.ok(shown.r.found);
});

test('the room’s cultural details are there, each with a card, and the tanpura drones when plucked',()=>{
  const played=[],h=room({tone:(f,at,dur,vol,voice)=>played.push([f,at,voice])});h.r.enter();
  const titles=h.interactables.map(o=>o.userData?.title);
  for(const title of ['Jootis at the door','A rangoli','A toran','Niches and diyas','A tanpura','Pachisi','Chai','A jhoola','A matka'])assert.ok(titles.includes(title),title);
  for(const key of ['joothi','rangoli','toran','niche','tanpura','pachisi','chai','jhoola','matka'])assert.ok(h.r.cards[key]&&h.r.cards[key][1].length>80,key);
  assert.ok(h.seats.some(s=>s.title==='The jhoola'),'the swing is a seat');
  const tanpura=h.interactables.find(o=>o.userData?.type==='india-tanpura');assert.ok(tanpura);
  assert.ok(h.r.interact(tanpura));assert.equal(played.length,12,'three rounds of four strings');
  assert.deepEqual(played.slice(0,4).map(p=>p[0]),[110,146.83,146.83,73.42],'Pa, Sa, Sa, low Sa');
  assert.ok(h.r.interact(tanpura));assert.equal(played.length,12,'not plucked again while it is still sounding');
  assert.equal((source.match(/new THREE\.PointLight/g)||[]).length,1,'still one lamp');
  assert.match(game,/createIndiaRoom\?\.\(\{[^]*?tone:pianoTone/,'game.js hands over the synthesiser');
  for(const claim of [/aala/,/kolam/,/pachis/,/kulhad/,/matka/i])assert.ok(claim.test(source));
});
