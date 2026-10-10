const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('burns-room.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(...m){for(const c of m){c.parent=this;this.children.push(c)}return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,CircleGeometry:G,ConeGeometry:G,MeshStandardMaterial:M,MeshBasicMaterial:M,DoubleSide:2,RepeatWrapping:1000,
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.isLight=true;this.intensity=i}}};
const MAT={wood:new M({}),darkWood:new M({}),brass:new M({})};
function room({search='',stored=null}={}){
  const store=new Map(stored?[[stored,'1']]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,location:{search}};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],seats=[],tones=[],sounds=[];
  const r=context.window.createBurnsRoom({THREE,scene,MAT,player,interactables,canvasTexture:()=>({dispose(){disposed++}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{works:byRoom('burns-works'),lives:byRoom('burns-lives'),scotland:byRoom('burns-scotland'),cutty:byRoom('burns-cutty')},
    showNotice:t=>notices.push(t),playSample:name=>sounds.push(name),move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},tone:(...a)=>tones.push(a),storage,
    registerSeat:()=>{const data={};seats.push(data);return data},irishRoom:{cx:-330,cz:-205,w:16,d:14}});
  return {r,scene,interactables,notices,player,tracked,seats,tones,sounds,store};
}
// The Irish Room itself, built as the game builds it, to walk to the door across its floor.
function irish(){
  const context={window:{},Math};vm.runInNewContext(fs.readFileSync('irish-room.js','utf8'),context);
  const scene=new O(),player={pos:new V(),radius:.42};
  const r=context.window.createIrishRoom({THREE,scene,MAT,player,interactables:[],canvasTexture:()=>({dispose(){}}),bookMaterial:()=>new M({}),findBook:id=>({id,title:'Book '+id,author:'A'}),
    arrivals:{},showNotice:()=>{},playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z)});
  r.enter();return r;
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);

test('the Burns Room loads before the game and is wired in like the other rooms behind doors',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('burns-room.js')>=0&&order.indexOf('burns-room.js')<order.indexOf('game.js'));assert(order.indexOf('irish-room.js')<order.indexOf('burns-room.js'));
  assert.match(game,/const burnsRoom=window\.createBurnsRoom\?\.\(/);assert.match(game,/irishRoom:irishRoom\?\.room/);assert(game.indexOf('const irishRoom=')<game.indexOf('const burnsRoom='),'the Irish Room is built first: its wall holds the door');
  assert.match(game,/\['burns-room','The Burns room'\]/);assert.match(game,/burns:'burns-room'/);assert.match(game,/cuttysark:'burns-room'/);
  assert.match(game,/'burns-room':burnsRoom&&\(\(\)=>burnsRoom\.enter\(\)\)/);assert.match(game,/burnsRoom\?\.update\(t\)/);assert.match(game,/if\(burnsRoom\?\.contains\(x,z\)\)return 'burns-room'/);
  assert.match(game,/voice==='fiddle'/,'the fiddle has a voice of its own');
  const ambience=fs.readFileSync('room-ambience.js','utf8');assert.match(ambience,/'burns-room':\{beds:\[\['fire',/);assert.match(ambience,/\['crackle',\d+,/,'the fire crackles');assert.match(ambience,/crackle:\(\)=>buffer/);
  const pages=fs.readFileSync('scripts/book-pages.mjs','utf8'),resolver=fs.readFileSync('scripts/new-books.mjs','utf8');
  for(const key of ['burns-works','burns-lives','burns-scotland','burns-cutty']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'The Burns Room'`))}
  assert.match(pages,/'The Burns Room':'burns'/);
});

test('the door is in the Irish Room’s south wall, past the harp and the ogham stone, and the Irish Room’s floor leads to it',()=>{
  const {r}=room(),ir=irish();
  assert.equal(r.door.yaw,Math.PI);assert.equal(r.door.z,-205+7-.2);
  // Clear of the room's own door in the middle of the wall, and of the corner.
  assert(Math.abs(r.door.x-(-330))>3.5,'clear of the Irish Room’s door');assert(r.door.x+1.25<-330+8-.3,'clear of the corner');
  // Standing in front of it, and walking there from the middle of the room, on the Irish Room's own floor.
  const front={x:r.door.x,z:r.door.z-1.2};assert(ir.allowed(front.x,front.z),'there is room to stand at the door');
  const seen=new Set(),queue=[[-330,-205+1]],key=(x,z)=>`${x.toFixed(1)},${z.toFixed(1)}`;let reached=false;
  while(queue.length&&!reached){const [x,z]=queue.shift();for(const [dx,dz] of [[.2,0],[-.2,0],[0,.2],[0,-.2]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k)||!ir.allowed(nx,nz))continue;seen.add(k);
    if(Math.hypot(nx-front.x,nz-front.z)<.25){reached=true;break}queue.push([nx,nz])}}
  assert(reached,'a reader can walk to the door from the middle of the Irish Room');
  // The Irish Room's door in the Grand Hall is the way to both rooms, and says so on its glass.
  const irishSource=fs.readFileSync('irish-room.js','utf8');assert.match(irishSource,/readingRoom\?\.\('IRELAND & SCOTLAND','The Irish Room · The Burns Room'\)/);assert.match(irishSource,/leads on to Scotland and the Burns Room/);
  const {cx,cz,w,d}=r.room;
  for(const [ox,oz,ow,od] of [[500,-160,16,14],[500,60,18,16],[500,220,14,12],[340,30,36,36],[384,-20,20,10],[300,-70,18,16],[620,120,68,68]])
    assert(Math.abs(cx-ox)>(w+ow)/2+60||Math.abs(cz-oz)>(d+od)/2+60,`well clear of ${ox}, ${oz}`);
});

test('the room is built on approach: three shelves, the supper, the box bed, the fiddle, seats, and a door back',()=>{
  const a=room();assert.equal(a.r.built,false);a.player.pos.set(a.r.door.x,0,a.r.door.z-2);a.r.update(1);assert.equal(a.r.built,true);
  a.r.interact(find(a,'burns-door'));assert(a.r.contains(a.player.pos.x,a.player.pos.z));assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'onto open floor');assert.match(a.notices.at(-1),/^The Burns Room/);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'burns-room'}]));
  for(const group of a.r.catalogue().groups)assert(group.books.length>=3,`${group.key} has its books`);
  for(const mesh of a.r.books){assert(a.r.contains(mesh.position.x,mesh.position.z),'every book is inside the room');assert(mesh.userData.burns)}
  assert(!a.r.books.some(m=>m.userData.shelf==='cutty'),'Tam o’ Shanter is not on the sill yet');assert.equal(a.seats.length,2,'two chairs at the supper table');
  for(const type of ['burns-fiddle','burns-window'])assert(find(a,type),type);assert(a.interactables.some(o=>/haggis/i.test(o.userData.title||'')),'a haggis');
  a.r.interact(find(a,'burns-fiddle'));assert(a.tones.length>=a.r.tune.length,'the fiddle plays');assert(a.tones.every(t=>t[4]==='fiddle'));
  a.r.interact(find(a,'burns-exit'));assert(!a.r.contains(a.player.pos.x,a.player.pos.z),'back to the Irish Room');assert(Math.abs(a.player.pos.z-(a.r.door.z-1.9))<.01,'out into the Irish Room');
  const lamps=[];a.scene.traverse(o=>{if(o.isPointLight)lamps.push(o)});assert.equal(lamps.length,1,'one lamp');
  a.player.pos.set(0,0,0);a.r.update(100);assert.equal(a.r.built,false,'freed once the reader has gone');for(const lamp of lamps)assert.equal(lamp.userData.freed,true);
  assert(!a.interactables.some(o=>/^burns-(card|exit|fiddle|window)$/.test(o.userData.type)),'its parts go with it');assert(find(a,'burns-door'),'but the door stays');
});

test('through the window, the witches dance and Tam o’ Shanter is left on the sill, for good',()=>{
  const a=room();a.r.enter();const window=find(a,'burns-window');assert(window);assert.equal(a.r.cuttySarkSeen,false);
  a.r.interact(window);assert.equal(a.r.cuttySarkSeen,true);assert.match(a.notices.at(-1),/Weel done, Cutty-sark!/);assert.match(a.notices.at(-1),/in an instant all is dark/);
  assert(a.tones.some(t=>t[4]==='pipes'),'the Devil’s pipes');assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'burns-cutty-sark'}]));assert.equal(a.store.get('athenaeum-burns-cutty-sark'),'1');
  const tam=a.r.books.filter(m=>m.userData.shelf==='cutty');assert.deepEqual(JSON.stringify(tam.map(m=>m.userData.book.id)),JSON.stringify(byRoom('burns-cutty')));for(const m of tam)assert.equal(m.visible,true);
  assert(!a.interactables.some(o=>o.userData.type==='burns-window'),'seen once');for(let t=1;t<8;t+=.1)a.r.update(t);
  const b=room({stored:'athenaeum-burns-cutty-sark'});b.r.enter();assert.equal(b.r.cuttySarkSeen,true,'found once, found for good');
  const c=room({search:'?cuttysark'});c.r.enter();assert.equal(c.r.cuttySarkSeen,true,'?cuttysark shows it');
});

test('its books are held nowhere else, and each has a note of three sentences',()=>{
  const burns=arrivals.filter(e=>/^burns-/.test(e[4]));assert(burns.length>=18);
  const elsewhere=new Set(arrivals.filter(e=>!/^burns-/.test(e[4])).map(e=>e[0]));
  const core=[...game.slice(game.indexOf('const books=['),game.indexOf('const books=[')+40000).matchAll(/\[(\d+),'/g)].map(m=>Number(m[1]));
  for(const [id,title,,,,note] of burns){
    assert(Number.isInteger(id),`${title} has its number`);assert(!elsewhere.has(id),`${title} is on no other shelf`);assert(!core.includes(id),`${title} is not already in the hall`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(burns.map(e=>e[0])).size,burns.length,'each once');assert.equal(byRoom('burns-cutty').length,1,'one book on the sill');
  assert(byRoom('burns-works').length+byRoom('burns-lives').length<=12&&byRoom('burns-scotland').length<=12,'each wall’s shelves hold them');
});
