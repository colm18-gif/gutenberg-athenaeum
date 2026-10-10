const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('austen-room.js','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room).map(e=>e[0]);

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.visible=true;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(c){c.parent=this;this.children.push(c);return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
let disposed=0;const G=class{dispose(){disposed++}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
const THREE={Group:O,Mesh,Vector3:V,BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,SphereGeometry:G,CircleGeometry:G,MeshStandardMaterial:M,DoubleSide:2,
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.isLight=true;this.intensity=i}}};
function room({search='',stored=null}={}){
  const store=new Map(stored?[[stored,'1']]:[]),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const context={window:{},Math,location:{search}};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},tracked=[],seats=[],tones=[],sounds=[];
  const r=context.window.createAustenRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){disposed++}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{novels:byRoom('austen-novels'),writings:byRoom('austen-writings'),lives:byRoom('austen-lives'),read:byRoom('austen-read'),horrid:byRoom('austen-horrid')},
    showNotice:t=>notices.push(t),playSample:name=>sounds.push(name),move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},tone:(...a)=>tones.push(a),storage,
    registerSeat:()=>{const data={};seats.push(data);return data}});
  return {r,scene,interactables,notices,player,tracked,seats,tones,sounds,store};
}
const find=(a,type)=>a.interactables.find(o=>o.userData.type===type);

test('the Austen Room loads before the game and is wired in like the other rooms behind doors',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  assert(order.indexOf('austen-room.js')>=0&&order.indexOf('austen-room.js')<order.indexOf('game.js'));
  assert.match(game,/const austenRoom=window\.createAustenRoom\?\.\(/);assert.match(game,/tone:pianoTone/);
  assert.match(game,/\['austen-room','The Austen room'\]/);assert.match(game,/austen:'austen-room'/);assert.match(game,/udolpho:'austen-room'/);
  assert.match(game,/'austen-room':austenRoom&&\(\(\)=>austenRoom\.enter\(\)\)/);assert.match(game,/austenRoom\?\.update\(t\)/);assert.match(game,/if\(austenRoom\?\.contains\(x,z\)\)return 'austen-room'/);
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'austen-room':\{/);
  const pages=fs.readFileSync('scripts/book-pages.mjs','utf8'),resolver=fs.readFileSync('scripts/new-books.mjs','utf8');
  for(const key of ['austen-novels','austen-writings','austen-lives','austen-read','austen-horrid']){assert.match(resolver,new RegExp(`'${key}'`));assert.match(pages,new RegExp(`'${key}':'The Austen Room'`))}
  assert.match(pages,/'The Austen Room':'austen'/);
  assert.match(fs.readFileSync('book/1342-pride-and-prejudice.html','utf8'),/<a href="\/\?room=austen">The Austen Room<\/a>/,'the book pages say where the novels are');
});

test('the door is in the Grand Hall’s east wall, clear of the great portrait, the column and the painting above, and the room stands apart',()=>{
  const {r}=room();assert.equal(r.door.x,18.72);assert.equal(r.door.yaw,-Math.PI/2);
  // The secret librarian's portrait is hinged at its north edge and swings out into the hall (game.js), so its whole sweep,
  // frame and all, is a circle round the hinge; the south-east column stands at x 17, z 27.
  const portrait=game.match(/painting\(18\.65,5,([\d.]+),([\d.]+),[\d.]+,-Math\.PI\/2,\[[^\]]*\],'assets\/secret-librarian-portrait\.jpg',true\)/);assert(portrait,'the hinged portrait');
  const hinge=Number(portrait[1]),reach=Number(portrait[2])+.3;assert(Math.hypot(.2,r.door.z-1.25-hinge)>reach,'clear of the portrait as it swings');
  assert(r.door.z+1.25<27-.7-.3,'clear of the column');
  const above=game.match(/galleryPicture\(18\.65,([\d.]+),27,([\d.]+),([\d.]+),/);assert(above);assert(Number(above[1])-Number(above[3])/2>3.7,'the painting above hangs higher than the door and its cornice');
  for(const d of [...fs.readFileSync('curious-doors.js','utf8').matchAll(/door:\{x:18\.72,z:(-?[\d.]+)/g)])assert(Math.abs(Number(d[1])-r.door.z)>4,'clear of the curious doors');
  const {cx,cz,w,d}=r.room;
  // The Room of Chance, the Lost Property Office, the Moon, the railway platforms and the Mars approach.
  for(const [ox,oz,ow,od] of [[500,60,18,16],[500,220,14,12],[340,30,36,36],[384,-20,20,10],[300,-70,18,16],[620,120,68,68]])
    assert(Math.abs(cx-ox)>(w+ow)/2+60||Math.abs(cz-oz)>(d+od)/2+60,`well clear of ${ox}, ${oz}`);
});

test('the room is built on approach: six novels in order, three shelves, the writing table, the pianoforte, seats, and a door back',()=>{
  const a=room();assert.equal(a.r.built,false);a.player.pos.set(a.r.door.x-2,0,a.r.door.z);a.r.update(1);assert.equal(a.r.built,true);
  const door=find(a,'austen-door');assert(door);a.r.interact(door);
  assert(a.r.contains(a.player.pos.x,a.player.pos.z));assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'onto open floor');assert.match(a.notices.at(-1),/^The Austen Room/);
  assert(a.sounds.includes('floorboardCreak'),'the door creaks');assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'austen-room'}]));
  const shelves=a.r.catalogue();assert.deepEqual([...shelves.novels.map(b=>b.id)],[161,1342,141,158,121,105],'in the order they were published');
  for(const group of shelves.groups)assert(group.books.length>=5,`${group.key} has its books`);
  for(const mesh of a.r.books){assert(a.r.contains(mesh.position.x,mesh.position.z),'every book is inside the room');assert(mesh.userData.austen)}
  assert(!a.r.books.some(m=>m.userData.shelf==='cabinet'),'Mrs Radcliffe is not on show yet');
  assert.equal(a.seats.length,2,'the sofa and the writing chair');
  a.r.interact(find(a,'austen-piano'));assert(a.tones.length>=a.r.tune.length,'the pianoforte plays');
  const exit=find(a,'austen-exit');a.r.interact(exit);assert(!a.r.contains(a.player.pos.x,a.player.pos.z),'back to the Grand Hall');assert(Math.abs(a.player.pos.x-(a.r.door.x-1.9))<.01);
  const lamps=[];a.scene.traverse(o=>{if(o.isPointLight)lamps.push(o)});assert.equal(lamps.length,1,'one lamp');
  a.player.pos.set(0,0,0);a.r.update(100);assert.equal(a.r.built,false,'freed once the reader has gone');for(const lamp of lamps)assert.equal(lamp.userData.freed,true);
  assert(!a.interactables.some(o=>/^austen-(card|exit|piano|cabinet)$/.test(o.userData.type)),'its parts go with it');assert(find(a,'austen-door'),'but the door stays');
});

test('the black cabinet gives up Mrs Radcliffe, and stays open',()=>{
  const a=room();a.r.enter();const cabinet=find(a,'austen-cabinet');assert(cabinet);assert.equal(a.r.cabinetOpen,false);
  a.r.interact(cabinet);assert.equal(a.r.cabinetOpen,true);assert.match(a.notices.at(-1),/list of linen/);assert.match(a.notices.at(-1),/Mrs Radcliffe/);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Secret Found',{secret:'austen-cabinet'}]));assert.equal(a.store.get('athenaeum-austen-cabinet'),'1');
  const radcliffe=a.r.books.filter(m=>m.userData.shelf==='cabinet');assert.deepEqual([...radcliffe.map(m=>m.userData.book.id)],[3268,...byRoom('austen-horrid')]);for(const m of radcliffe)assert.equal(m.visible,true);
  assert(!a.interactables.some(o=>o.userData.type==='austen-cabinet'),'opened once');
  for(let t=1;t<4;t+=.1)a.r.update(t);
  const b=room({stored:'athenaeum-austen-cabinet'});b.r.enter();assert.equal(b.r.cabinetOpen,true,'found once, found for good');
  const c=room({search:'?udolpho'});c.r.enter();assert.equal(c.r.cabinetOpen,true,'?udolpho opens it');
});

test('its new books are held nowhere else, and each has a note of three sentences',()=>{
  const austen=arrivals.filter(e=>/^austen-/.test(e[4]));assert(austen.length>=24);
  const elsewhere=new Set(arrivals.filter(e=>!/^austen-/.test(e[4])).map(e=>e[0]));
  const core=[...game.slice(game.indexOf('const books=['),game.indexOf('const books=[')+40000).matchAll(/\[(\d+),'/g)].map(m=>Number(m[1]));
  for(const [id,title,,,,note] of austen){
    assert(Number.isInteger(id),`${title} has its number`);assert(!elsewhere.has(id),`${title} is on no other shelf`);assert(!core.includes(id),`${title} is not already in the hall`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(austen.map(e=>e[0])).size,austen.length,'each once');
  const {r}=room();for(const id of [161,1342,141,158,105,3268])assert(core.includes(id),`${id} is the library’s own copy`);assert.deepEqual([...r.novels],[161,1342,141,158,121,105]);
});
