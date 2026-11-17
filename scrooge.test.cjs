// Scrooge's chambers (scrooge-room.js): built for real with a stand-in for Three.js, entered from the Long Corridor,
// its shelves filled from the catalogue, its knocker and its bell tried, and every word of Dickens read against the
// library's own Carol.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync('scrooge-room.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8');
const game=fs.readFileSync('game.js','utf8'),index=fs.readFileSync('index.html','utf8'),ambience=fs.readFileSync('room-ambience.js','utf8');
const load=(file,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),c);return c.window[name]};
const arrivals=load('data/new-books.js','ATHENAEUM_NEW_BOOKS'),resolved=load('data/new-books-resolved.js','ATHENAEUM_NEW_BOOKS_RESOLVED').books;
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>resolved[e[1]]?.id).filter(Boolean);
const letters=s=>s.toLowerCase().replace(/[^a-z]/g,'');

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
// Pretend every new arrival has resolved, with its listed number (or a stand-in for one still to be looked up).
const listed=room=>arrivals.filter(e=>e[4]===room).map((e,i)=>e[0]??90000+i);
function room({stored=[],search='',date=new Date(2026,6,1)}={}){
  const context={window:{},Math,Object,Array,Number,String,Set,Date};vm.runInNewContext(corridorSource,context);vm.runInNewContext(source,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],tones=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z)=>player.pos.set(x,0,z)};
  const corridor=context.window.createLongCorridor(shared);
  const r=context.window.createScroogeRoom({...shared,corridor,bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id}),registerSeat:(parts,group,at,yaw,data)=>seats.push({...data,yaw}),
    tone:(...a)=>tones.push(a),sound:()=>tones.push(['sound']),
    arrivals:{christmas:listed('scrooge-christmas'),winter:listed('scrooge-winter'),london:listed('scrooge-london'),chimes:listed('scrooge-chimes')},
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search,now:()=>date});
  return {r,corridor,player,interactables,notices,seats,tones,store};
}

test('it loads before game.js and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);assert.ok(order.indexOf('scrooge-room.js')>order.indexOf('long-corridor.js')&&order.indexOf('scrooge-room.js')<order.indexOf('game.js'));
  for(const term of ['scroogeRoom.floorAt','scroogeRoom.allowed','scroogeRoom.interact','scroogeRoom.update',"if(scroogeRoom?.contains(x,z))return 'scrooge-room'","'scrooge-room':scroogeRoom&&(()=>scroogeRoom.enter())","scrooge:'scrooge-room'","['scrooge-room','Scrooge’s chambers']","'burns-room','scrooge-room','dickinson-room'"])
    assert.ok(game.includes(term),term);
  for(const key of ['christmas','winter','london','chimes'])assert.ok(game.includes(`arrivalIds('scrooge-${key}')`),key);
  assert.ok(ambience.includes("'scrooge-room':{beds:"),'it has an ambience');
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.PointLight/g)||[]).length,1,'one light, the fire');
  for(const script of ['scripts/new-books.mjs','scripts/book-pages.mjs'])for(const key of ['christmas','winter','london','chimes'])assert.ok(fs.readFileSync(script,'utf8').includes(`'scrooge-${key}'`),`${script} knows scrooge-${key}`);
});

test('its door is in the Long Corridor’s second east bay, on bare wall, and stays when the room is freed',()=>{
  const h=room(),c=h.corridor,d=h.r.door;
  assert.deepEqual({side:d.side,bay:d.bay},{side:'east',bay:1});assert.equal(d.z,c.bayZ(1));
  for(const other of [c.foodDoor,c.dickinsonDoor,c.celsusDoor,c.pictureBay])assert.ok(other.bay!==d.bay||other.side!==d.side,'a bay of its own');
  assert.match(corridorSource,/if\(side===SCROOGE_DOOR\.side&&k===SCROOGE_DOOR\.bay\)continue/,'no panel behind the door');
  assert.match(source,/doorKit\.readingRoom\?\.\('SCROOGE’S\\nCHAMBERS','A Christmas Carol · 1843'\)/);assert.match(source,/onward:'towards the Grand Hall',label:'THE LONG CORRIDOR'/);
  const door=h.interactables.find(o=>o.userData.type==='scrooge-door');assert.ok(door,'hung at startup');
  assert.ok(h.r.interact(door));assert.ok(h.r.built);assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open floor');
  assert.ok(h.r.interact(h.interactables.find(o=>o.userData.type==='scrooge-exit')));assert.ok(c.contains(h.player.pos.x,h.player.pos.z)&&c.allowed(h.player.pos.x,h.player.pos.z),'and comes out in the corridor');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);assert.ok(!h.r.built,'freed a while after the reader has gone');assert.ok(h.interactables.includes(door));
  assert.ok(h.interactables.some(o=>o.userData.type==='scrooge-knocker'),'the knocker stays with the door');
  assert.ok(!h.interactables.some(o=>o.userData.scrooge||o.userData.type==='scrooge-exit'||o.userData.type==='scrooge-bell'));
});

test('the knocker is Marley’s face once, when a reader first comes up to the door',()=>{
  const h=room(),d=h.r.door;h.player.pos.set(d.x-6,0,d.z);h.r.update(1);assert.ok(!h.r.faceSeen,'not from down the corridor');
  h.player.pos.set(d.x-1.6,0,d.z);h.r.update(1.1);assert.ok(h.r.faceSeen);assert.match(h.notices.at(-1),/not a knocker, but Marley’s face/);
  const n=h.notices.length;for(let t=1.1;t<8;t+=.1)h.r.update(t);h.player.pos.set(d.x-6,0,d.z);h.r.update(9);h.player.pos.set(d.x-1.6,0,d.z);h.r.update(10);assert.equal(h.notices.length,n,'once');
  h.r.interact(h.interactables.find(o=>o.userData.type==='scrooge-knocker'));assert.match(h.notices.at(-1),/ghostly spectacles/);
});

test('the shelves hold the Christmas books, tales for a winter’s night and Dickens’s London, after the library’s own copies',()=>{
  const h=room();h.r.enter();const {groups,chimes}=h.r.catalogue(),ids=k=>[...groups.find(g=>g.key===k).books.map(b=>b.id)];
  assert.equal(ids('christmas')[0],46,'the library’s own Carol first');assert.deepEqual(ids('winter').slice(0,3),[7256,69297,1597]);assert.deepEqual(ids('london').slice(0,5),[580,766,1400,730,1023]);
  assert.deepEqual([...chimes].map(b=>b.id),[653],'The Chimes is kept for the bell');
  for(const id of Object.values(h.r.own).flat())assert.ok(game.includes(`[${id},'`)||arrivals.some(e=>e[0]===id),`${id} is in the catalogue`);
  for(const g of groups){assert.ok(g.books.length>=3,g.key);assert.ok(listed('scrooge-'+g.key).length+g.ids.length<=g.max,`${g.key} fits its shelf`)}
  const mine=arrivals.filter(e=>String(e[4]).startsWith('scrooge-'));assert.equal(mine.length,6);
  for(const e of mine){assert.ok(e[5].split(/[.!?]”?\s/).length>=3,`${e[1]} has a note`);
    // Once the New books workflow has resolved a book, its text is bundled.
    assert.ok(resolved[e[1]]?.id===e[0],`${e[1]} resolved`);assert.ok(fs.existsSync(`texts/bundled-gzip/pg${resolved[e[1]].id}.txt.gz`)||fs.existsSync(`texts/pg${resolved[e[1]].id}.txt`),`${e[1]} bundled`)}
  assert.equal(h.r.books.length,groups.reduce((n,g)=>n+g.books.length,0),'every shelf book is in the room, and The Chimes is not out yet');
  assert.equal(h.seats.length,1);assert.equal(h.seats[0].yaw,0,'the armchair faces the fire, north');assert.ok(Array.isArray(h.seats[0].bookIds)&&h.seats[0].bookIds.length>=12,'it opens one of the room’s books');
  // Open floor in front of the shelves, the fire, the bell and the window.
  for(const [dx,dz] of [[0,2.6],[2.9,-1.3],[-2.9,1.6],[-2.75,2.6],[0,-.8],[1.75,-2.6],[2.9,2.5],[-2.9,-.5]])assert.ok(h.r.allowed(h.r.room.cx+dx,h.r.room.cz+dz),`(${dx}, ${dz}) is open floor`);
});

test('every word of Dickens here is in the library’s Carol, and every quotation on a card is one of them',()=>{
  const carol=letters(fs.readFileSync('texts/pg46.txt','utf8')),h=room();
  for(const [key,line] of Object.entries(h.r.quotes))assert.ok(carol.includes(letters(line)),`${key}: ${line}`);
  const known=Object.values(h.r.quotes);
  for(const [key,[,body]] of Object.entries(h.r.cards))for(const [,quoted] of body.matchAll(/“([^”]+)”/g))assert.ok(known.includes(quoted),`${key}: “${quoted}”`);
});

test('the secret: the disused bell rings with every bell in the house, and leaves The Chimes by the fire, for good',()=>{
  const h=room();h.r.enter();const bell=()=>h.interactables.find(o=>o.userData.type==='scrooge-bell'),has=()=>h.r.books.some(b=>b.userData.book.id===653);
  assert.ok(bell());assert.equal(bell().userData.action,'LOOK');assert.ok(!has());
  h.r.interact(bell());assert.ok(h.r.ringing);assert.match(h.notices.at(-1),/every bell in the house/);
  h.r.interact(bell());const n=h.notices.length;
  for(let t=0;t<25;t+=.05)h.r.update(t);
  assert.ok(has(),'The Chimes is on the table');assert.equal(h.store.get('athenaeum-scrooge-chimes'),'1');assert.ok(!h.r.ringing);
  const said=h.notices.slice(n-1).join(' ');for(const words of ['ceased as they had begun','booming sound','Marley’s head on every one','Book 653'])assert.ok(said.includes(words),words);
  assert.ok(h.tones.length>10,'it is heard');assert.equal(bell().userData.action,'READ');
  const count=h.r.books.length;h.r.interact(bell());for(let t=25;t<50;t+=.1)h.r.update(t);assert.equal(h.r.books.length,count,'once');
  for(const again of [room({stored:['athenaeum-scrooge-chimes']}),room({search:'?room=scrooge&chimes'})]){again.r.enter();assert.ok(again.r.books.some(b=>b.userData.book.id===653))}
  // Snow in the yard in December and January only.
  assert.ok(room({date:new Date(2026,11,24)}).r.snowy());assert.ok(room({date:new Date(2027,0,5)}).r.snowy());assert.ok(!room({date:new Date(2026,10,17)}).r.snowy());
});
