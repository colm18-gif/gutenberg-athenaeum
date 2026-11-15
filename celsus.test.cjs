// The Library of Celsus (celsus-room.js): built for real with a stand-in for Three.js, entered from the Long Corridor,
// walked from the court through a doorway into the hall and down the stair into the vault, its four cases filled from
// the catalogue, and its cards checked for the things that are actually known about Ephesus.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('celsus-room.js','utf8'),corridorSource=fs.readFileSync('long-corridor.js','utf8');
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
function room({stored=[],search=''}={}){
  const context={window:{},Math,Object,Array,Number,String,Set,Date,RegExp};
  vm.runInNewContext(corridorSource,context);vm.runInNewContext(source,context);
  const player={pos:new V(),radius:.42},interactables=[],notices=[],seats=[],scene=thing(),store=new Map(stored.map(k=>[k,'1']));
  const shared={THREE,scene,MAT:new Proxy({},{get:()=>thing()}),player,interactables,canvasTexture:()=>thing(),showNotice:t=>notices.push(t),playSample(){},move:(x,z,yaw)=>{player.pos.set(x,0,z);player.yaw=yaw}};
  const corridor=context.window.createLongCorridor(shared);
  const r=context.window.createCelsusRoom({...shared,corridor,bookMaterial:()=>thing(),findBook:id=>({id,title:'Book '+id}),
    registerSeat:(parts,group,at,yaw,data)=>seats.push(data),
    arrivals:{'celsus-sophia':byRoom('celsus-sophia'),'celsus-episteme':byRoom('celsus-episteme'),'celsus-ennoia':byRoom('celsus-ennoia'),'celsus-arete':byRoom('celsus-arete'),'celsus-crypt':byRoom('celsus-crypt')},
    storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},search});
  return {r,corridor,player,interactables,notices,seats,store};
}

test('it loads after the corridor and before game.js, and is wired into the library',()=>{
  const order=[...index.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert.ok(order.indexOf('celsus-room.js')>order.indexOf('long-corridor.js'),'the corridor hands it its door');
  assert.ok(order.indexOf('celsus-room.js')<order.indexOf('game.js'),'game.js runs last');
  for(const term of ['celsusRoom.floorAt','celsusRoom.allowed','celsusRoom.interact','celsusRoom.update','const celsus=celsusRoom?.zoneAt(x,z)',
    "'celsus-room':celsusRoom&&(()=>celsusRoom.enter())","celsus:'celsus-room'","ephesus:'celsus-room'","['celsus-court','The court at Ephesus']"])
    assert.ok(game.includes(term),term);
  for(const key of ['sophia','episteme','ennoia','arete','crypt'])assert.ok(game.includes(`arrivalIds('celsus-${key}')`),key);
  for(const zone of ['celsus-court','celsus-hall','celsus-crypt'])assert.ok(ambience.includes(`'${zone}':{beds:`),`${zone} has an ambience`);
  assert.match(source,/if\(inside\|\|near&&\(root\|\|window\.libraryMayBuild\?\.\(\)!==false\)\)activate\(\)/,'it asks before building ahead of the reader');
  assert.equal((source.match(/new THREE\.PointLight/g)||[]).length,2,'two lights: the sun in the court and the lamp in the apse');
  assert.equal((source.match(/new THREE\.InstancedMesh/g)||[]).length,3,'the columns, their capitals and the scrolls are instanced');
});

test('its door is in the Long Corridor’s fifth east bay, on bare wall, and stays when the room is freed',()=>{
  const h=room(),c=h.corridor,d=h.r.door;
  assert.deepEqual({side:d.side,bay:d.bay},{side:'east',bay:4});
  assert.equal(d.z,c.bayZ(4));
  for(const other of [c.foodDoor.bay+':'+c.foodDoor.side,c.dickinsonDoor.bay+':'+c.dickinsonDoor.side,c.pictureBay.bay+':'+c.pictureBay.side])
    assert.notEqual(d.bay+':'+d.side,other,'the bay is its own');
  assert.match(corridorSource,/if\(side===CELSUS_DOOR\.side&&k===CELSUS_DOOR\.bay\)continue/,'no panel behind the door');
  assert.match(source,/onward:'towards the Grand Hall',label:'THE LONG CORRIDOR'/,'its way out names where it leads');
  const door=h.interactables.find(o=>o.userData.type==='celsus-door');assert.ok(door,'hung at startup');
  assert.ok(h.r.interact(door));assert.ok(h.r.built);
  assert.ok(h.r.allowed(h.player.pos.x,h.player.pos.z),'the reader arrives on open paving');
  assert.equal(h.r.zoneAt(h.player.pos.x,h.player.pos.z),'celsus-court');
  assert.ok(h.r.interact(h.interactables.find(o=>o.userData.type==='celsus-exit')));
  assert.ok(c.contains(h.player.pos.x,h.player.pos.z)&&c.allowed(h.player.pos.x,h.player.pos.z),'and comes out in the corridor');
  h.r.update(1);h.player.pos.set(0,0,0);h.r.update(40);
  assert.ok(!h.r.built,'freed a while after the reader has gone');
  assert.ok(h.interactables.includes(door),'its door in the corridor stays');
  assert.ok(!h.interactables.some(o=>o.userData.celsus||o.userData.type==='celsus-exit'),'and nothing of the room is left behind');
});

test('the front is a wall: the court and the hall meet only in its three doorways',()=>{
  const h=room();h.r.enter();const {cx}=h.r.hall;
  for(const d of h.r.doorways){
    assert.ok(h.r.allowed(cx+d.x,1.4),`the ${d.x} doorway is open on the court side`);
    assert.ok(h.r.allowed(cx+d.x,-.4),`and on the hall side`);
  }
  for(const dx of [-9.6,-2.7,2.7,9.6,-12,12])assert.ok(!h.r.allowed(cx+dx,.2),`the front is solid at ${dx}`);
  // Up the three steps, no step taller than a step.
  let last=h.r.floorAt(cx,2.4);
  for(let z=2.4;z>=-1.2;z-=.05){const y=h.r.floorAt(cx,z);
    assert.ok(y!==null,`there is floor at z=${z.toFixed(2)}`);
    assert.ok(Math.abs(y-last)<=.2,`the rise at z=${z.toFixed(2)} is one step at most (${last} to ${y})`);last=y}
  assert.equal(h.r.floorAt(cx,-1.2),h.r.hall.y,'and the hall floor is reached');
});

test('a reader can walk from the court to all four cases, the apse, and down the stair into the vault',()=>{
  const h=room();h.r.enter();const hall=h.r.hall,{cx,cz}=hall;
  const route=[[cx,14],[cx,6],[cx,2.4],[cx,1.2],[cx,-.4],[cx,-2],[cx-3,-4],// in by the middle doorway
    [cx-6.6,-6.8],// Sophia, on the west wall
    [cx+6.6,-6.8],// Episteme, opposite
    [cx-4.6,-9.9],[cx+4.6,-9.9],// Ennoia and Arete, either side of the apse
    [cx,-7.8],// before the lamp in the apse
    [h.r.stair.x,-6.5]];// as far as the head of the stair
  let last=null;
  for(const [x,z] of route){
    assert.ok(h.r.contains(x,z),`(${x}, ${z}) is in the room`);
    assert.ok(h.r.allowed(x,z),`(${x}, ${z}) can be stood on`);
    const y=h.r.floorAt(x,z);assert.ok(y!==null,`(${x}, ${z}) has a floor`);
    if(last!==null&&Math.abs(z-last[1])<2)assert.ok(Math.abs(y-last[2])<=.35,`the floor does not jump between (${last[0]}, ${last[1]}) and (${x}, ${z})`);
    last=[x,z,y];
  }
  // Down the stair into the vault, a step at a time: no step is taller than a step.
  let y=h.r.floorAt(h.r.stair.x,-6.5);
  for(let z=-6.5;z>=-10.8;z-=.15){
    assert.ok(h.r.contains(h.r.stair.x,z),`the stair has floor at z=${z.toFixed(2)}`);
    assert.ok(h.r.allowed(h.r.stair.x,z),`the stair can be walked at z=${z.toFixed(2)}`);
    const next=h.r.floorAt(h.r.stair.x,z);
    assert.ok(Math.abs(next-y)<=.32,`the drop at z=${z.toFixed(2)} is one step at most (${y} to ${next})`);y=next}
  assert.equal(h.r.zoneAt(cx,-4),'celsus-hall');
  assert.equal(h.r.zoneAt(h.r.stair.x,-10.6),'celsus-crypt');
  assert.equal(h.r.floorAt(h.r.stair.x,-10.6),h.r.vault.y,'the stair ends on the vault floor');
  // The stairwell is a real opening: nobody walks over it, and the parapet does not fence off the vault.
  assert.ok(!h.r.allowed(h.r.stair.x+1.2,-8.6),'the parapet keeps readers out of the opening');
  assert.ok(h.r.allowed(h.r.vault.cx+1.1,h.r.vault.cz),'there is floor beside the sarcophagus');
});

test('the four cases hold the library’s own classical books, under their names in Greek',()=>{
  const h=room();h.r.enter();const {groups}=h.r.catalogue();
  assert.deepEqual([...groups.map(g=>g.key)],['sophia','episteme','ennoia','arete']);
  assert.deepEqual([...groups.map(g=>g.greek)],['ΣΟΦΙΑ','ΕΠΙΣΤΗΜΗ','ΕΝΝΟΙΑ','ΑΡΕΤΗ']);
  for(const g of groups){
    assert.ok(g.books.length>=3,`${g.key} has books`);
    assert.ok(g.books.length<=g.max,`${g.key} fits its case`);
    for(const id of g.ids)assert.ok(game.includes(`[${id},'`)||game.includes(`[${id}, `)||arrivals.some(e=>e[0]===id),`${id} is in the catalogue already`);
  }
  assert.equal(h.r.books.length,groups.reduce((n,g)=>n+g.books.length,0),'every case book is in the room, and the vault’s is not out yet');
  const names=h.interactables.filter(o=>o.userData.type==='celsus-card').map(o=>o.userData.title);
  for(const g of groups)assert.ok(names.includes(`${g.greek} · ${g.name}`),`${g.key} has her name cut over the case`);
  // Each statue in the front says which case stands under her name inside.
  const cards=h.interactables.filter(o=>o.userData.type==='celsus-card');
  for(const s of h.r.statues){
    const card=cards.find(o=>o.userData.title===h.r.cards[s.key][0]);
    assert.ok(card,`${s.key} has a card`);assert.match(card.userData.author,/case/,`${s.key} points at her case`);
  }
});

test('the vault is the secret: reading the inscription leaves a book on the lid, found for good',()=>{
  const h=room();h.r.enter();
  assert.ok(!h.r.found);
  const tomb=h.interactables.find(o=>o.userData.type==='celsus-sarcophagus');
  assert.ok(tomb,'the sarcophagus is there to be read');
  const before=h.r.books.length;
  assert.ok(h.r.interact(tomb));
  assert.ok(h.r.found);assert.equal(h.store.get('athenaeum-celsus-crypt'),'1','and it is remembered');
  assert.equal(h.r.books.length,before+1,'the book is on the lid');
  assert.match(h.notices.at(-1),/Polemaeanus/);
  assert.equal(tomb.userData.action,'LOOK','and the inscription has been read');
  // Found before, or asked for with ?crypt: the book is on the lid as soon as the room is built.
  for(const h2 of [room({stored:['athenaeum-celsus-crypt']}),room({search:'?crypt'})]){
    h2.r.enter();assert.ok(h2.r.found);
    assert.equal(h2.r.books.length,h2.r.catalogue().groups.reduce((n,g)=>n+g.books.length,0)+1);
  }
});

test('its cards keep to what is known about Ephesus, and say the hall is a reconstruction',()=>{
  const h=room();const c=h.r.cards;
  assert.match(c.facade[1],/1970 and 1978/,'the front was raised again by anastylosis');
  assert.match(c.facade[1],/consul in 92/);
  assert.match(c.hall[1],/reconstruction/,'the hall is not pretended to be the original');
  assert.match(c.scrolls[1],/anachronism/,'the books standing where the scrolls stood is owned up to');
  assert.match(c.sophia[1],/Vienna/,'the statues at Ephesus are copies');
  assert.match(c.sarcophagus[1],/all but unheard of/);
  assert.ok(!/self-portrait|burned|library of Alexandria|Christians|Goths/i.test(Object.values(c).map(([,text])=>text).join(' ')),
    'no stories the evidence does not carry');
  h.r.enter();
  assert.match(h.notices[0],/reconstruction/,'and the reader is told on the way in');
});
