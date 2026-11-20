// The Arctic Room (arctic-room.js): built for real with a stand-in for Three.js, its door hung in the explorers'
// anteroom, its shelves filled from the catalogue, the cairn opened, and every word of the Victory Point record read
// against M'Clintock's own text.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('arctic-room.js','utf8');
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8'),exploration=fs.readFileSync('exploration.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const arrivals=load('data/new-books.js','ATHENAEUM_NEW_BOOKS');
const letters=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}copy(v){return this.set(v.x,v.y,v.z)}}
const any=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:any,apply:()=>any,construct:()=>any});
function thing(){
  let self;const scale=Object.assign(function(){return self},{x:1,y:1,z:1,set(){return scale}});
  const t={children:[],parent:null,visible:true,position:new V(),scale,userData:{},rotation:{x:0,y:0,z:0,set(){return this}},quaternion:{clone:()=>({})},
    add(...c){for(const x of c){x.parent=self;t.children.push(x)}return self},removeFromParent(){if(t.parent)t.parent.children.splice(t.parent.children.indexOf(self),1);t.parent=null},
    traverse(fn){fn(self);for(const c of t.children)c.traverse?.(fn)}};
  return self=new Proxy(t,{get:(o,k)=>k in o?o[k]:typeof k==='symbol'?undefined:any,set:(o,k,v)=>{o[k]=v;return true}});
}
const THREE=new Proxy({},{get:()=>function(){return thing()}});
const listed=room=>arrivals.filter(e=>e[4]===room).map((e,i)=>e[0]??90000+i);
const ANTE={cx:1320,cz:320,w:12,d:9};
function room({stored=[],search='',anteBuilt=true}={}){
  const context={window:{},Math,Object,Array,Number,String,Set,Date};vm.runInNewContext(source,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const anteroom={built:anteBuilt,room:ANTE,build(){this.built=true}};
  const r=context.window.createArcticRoom({THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},
    move:(x,z)=>player.pos.set(x,0,z),anteroom,bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id}),registerSeat:(parts,group,at,yaw,data)=>seats.push({...data,yaw}),
    arrivals:Object.fromEntries(['arctic-passage','arctic-inuit','arctic-pole','arctic-table','arctic-record'].map(k=>[k,listed(k)])),
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,player,interactables,notices,seats,store,anteroom};
}

test('it loads before game.js and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert.ok(order.includes('arctic-room.js')&&order.indexOf('arctic-room.js')<order.indexOf('game.js'));
  for(const term of ['arcticRoom.floorAt','arcticRoom.allowed','arcticRoom.interact','arcticRoom.update',"if(arcticRoom?.contains(x,z))return 'arctic-room'","'arctic-room':arcticRoom&&(()=>arcticRoom.enter())","arctic:'arctic-room'","['arctic-room','The Arctic Room']","anteroom:exploration?.anteroom"])
    assert.ok(game.includes(term),term);
  for(const key of ['passage','inuit','pole','table','record'])assert.ok(game.includes(`'arctic-${key}'`),key);
  assert.ok(ambience.includes("'arctic-room':{beds:"),'it has an ambience');
  assert.ok(exploration.includes('build:buildAnteroom'),'the anteroom can be built for the way back');
  assert.ok(exploration.includes("'arctic-room':["),'the despatch tube has a hint for it');
});

test('its door hangs in the anteroom’s north wall, past the kit pegs, only while the anteroom is built',()=>{
  const {r,player,anteroom}=room({anteBuilt:false});player.pos.set(ANTE.cx,0,ANTE.cz);r.update(1);assert.equal(r.doorHung,false);
  anteroom.built=true;r.update(2);assert.equal(r.doorHung,true);
  assert.ok(Math.abs(r.door.z-(ANTE.cz-ANTE.d/2))<.3,'on the north wall');assert.ok(r.door.x-.75>ANTE.cx+4.2&&r.door.x+.75<ANTE.cx+ANTE.w/2,'between the pegs and the corner');
  anteroom.built=false;r.update(3);assert.equal(r.doorHung,false,'gone with the anteroom');
});

test('the reader goes in, walks clear, finds every shelf filled and two seats, and comes back out to the anteroom',()=>{
  const {r,player,interactables,seats,anteroom}=room();r.update(1);
  r.interact(interactables.find(o=>o.userData.type==='arctic-door'));assert.ok(r.built&&r.contains(player.pos.x,player.pos.z));assert.ok(r.allowed(player.pos.x,player.pos.z),'standing where it is allowed');
  const {cx,cz,d}=r.room;for(let z=player.pos.z;z>cz+.5;z-=.1)assert.ok(r.allowed(cx-2.2,z)||r.allowed(cx+2.2,z),`a way up the cabin at ${z}`);
  const shelves=new Set(r.books.map(b=>b.userData.shelf));for(const key of ['arctic-passage','arctic-inuit','arctic-pole','arctic-table'])assert.ok(shelves.has(key),key);
  assert.ok(r.books.length>=30,`${r.books.length} books`);assert.equal(seats.length,2);
  for(const b of r.books.filter(b=>b.userData.shelf!=='arctic-table'))assert.ok(r.contains(b.position.x,b.position.z),'books inside the cabin');
  anteroom.built=false;r.interact(interactables.find(o=>o.userData.type==='arctic-exit'));assert.ok(anteroom.built,'the anteroom is built for the reader');
  assert.ok(Math.abs(player.pos.x-ANTE.cx)<ANTE.w/2-.7&&Math.abs(player.pos.z-ANTE.cz)<ANTE.d/2-.7,'standing in the anteroom');
});

test('the cairn gives up the Victory Point record, and M’Clintock’s book, for good',()=>{
  const {r,player,interactables,notices,store}=room();r.update(1);r.interact(interactables.find(o=>o.userData.type==='arctic-door'));
  const cairn=interactables.find(o=>o.userData.type==='arctic-cairn');assert.ok(cairn);r.interact(cairn);assert.ok(r.reading);
  for(let t=1;t<44;t+=.1)r.update(1+t);
  assert.ok(r.found);assert.equal(store.get('athenaeum-arctic-victory-point'),'1');assert.ok(r.books.some(b=>b.userData.shelf==='arctic-record'),'the book is on the chest');
  assert.ok(['form','party','margin','deaths','fish'].every(k=>notices.some(n=>n.includes(r.record[k]))),'the record is read out');
  const again=room({stored:['athenaeum-arctic-victory-point']});again.r.update(1);again.r.activate();assert.ok(again.r.books.some(b=>b.userData.shelf==='arctic-record'),'found for good');
});

test('every word of the record is M’Clintock’s, and every “quotation” on a card is in its book',()=>{
  const text=letters(zlib.gunzipSync(fs.readFileSync('texts/bundled-gzip/pg37669.txt.gz')).toString('utf8'));
  const {r}=room();assert.ok(r.record.form&&r.record.margin);
  for(const [key,words] of Object.entries(r.record))assert.ok(text.includes(letters(words)),key);
  const words=Object.values(r.record);
  for(const [title,body] of Object.values(r.cards))for(const m of body.matchAll(/“([^”]+)”/g))assert.ok(words.includes(m[1]),`an unchecked quotation on ${title}: ${m[1]}`);
  for(const m of source.matchAll(/showNotice\(`[^`]*`/g))for(const q of m[0].matchAll(/“([^”$]+)”/g))assert.ok(words.includes(q[1]),`an unchecked quotation in a notice: ${q[1]}`);
});

test('its cards keep to the Inuit part in the story, and its books are on the shelves of new books',()=>{
  const {r}=room();const f=r.cards.franklin[1];for(const term of ['Rae','Inuit','Schwatka','2014','2016','Kamookak','Kogvik'])assert.ok(f.includes(term),term);
  for(const key of ['arctic-passage','arctic-inuit','arctic-pole','arctic-table','arctic-record'])assert.ok(arrivals.some(e=>e[4]===key),key);
  assert.ok(!/cannibal/i.test(source),'the cards leave the worst of Rae’s report to the books');
});
