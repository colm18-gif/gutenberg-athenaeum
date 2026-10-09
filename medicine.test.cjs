const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('index.html','utf8'),game=fs.readFileSync('game.js','utf8'),source=fs.readFileSync('medicine-room.js','utf8'),fetcher=fs.readFileSync('scripts/fetch-book-pages.mjs','utf8');
const arrivals=(()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/new-books.js','utf8'),c);return c.window.ATHENAEUM_NEW_BOOKS})();
const byRoom=room=>arrivals.filter(e=>e[4]===room);
const book=(()=>{const context={window:{},Math,setTimeout};vm.runInNewContext(fs.readFileSync('fine-books.js','utf8'),context);vm.runInNewContext(fs.readFileSync('vesalius-book.js','utf8'),context);return context.window.createVesaliusBook({THREE:{},renderer:{}})})();
const manifestFile='assets/vesalius/vesalius.json',manifest=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{};

class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){Object.assign(this,{x,y,z});return this}clone(){return new V().set(this.x,this.y,this.z)}}
class O{constructor(){this.children=[];this.parent=null;this.position=new V();this.scale=new V().set(1,1,1);this.rotation={x:0,y:0,z:0,order:'XYZ',set(x,y,z){Object.assign(this,{x,y,z})}};this.quaternion={clone:()=>({})};this.userData={}}
  add(c){c.parent=this;this.children.push(c);return this}removeFromParent(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class Mesh extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
class Instanced extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={}}setMatrixAt(){}dispose(){disposed++}}
let disposed=0;const G=class{dispose(){disposed++}},M=class{constructor(p){Object.assign(this,p)}dispose(){disposed++}};
class Q{setFromAxisAngle(){return this}}class M4{compose(){return this}}
const THREE={Group:O,Mesh,InstancedMesh:Instanced,Vector3:V,Quaternion:Q,Matrix4:M4,BoxGeometry:G,CylinderGeometry:G,PlaneGeometry:G,MeshStandardMaterial:M,DoubleSide:2,RepeatWrapping:1000,SRGBColorSpace:'srgb',
  PointLight:class extends O{constructor(c,i){super();this.isPointLight=true;this.isLight=true;this.intensity=i}}};
function room(){
  const context={window:{},Math};vm.runInNewContext(source,context);
  const scene=new O(),interactables=[],notices=[],player={pos:new V(),radius:.42},opened=[],tracked=[],seats=[];
  const r=context.window.createMedicineRoom({THREE,scene,MAT:{wood:new M({}),darkWood:new M({}),brass:new M({})},player,interactables,canvasTexture:()=>({dispose(){disposed++}}),bookMaterial:()=>new M({}),
    findBook:id=>({id,title:'Book '+id,author:'A'}),arrivals:{physic:byRoom('medicine-physic').map(e=>e[0]),discovery:byRoom('medicine-discovery').map(e=>e[0]),healers:byRoom('medicine-healers').map(e=>e[0])},
    showNotice:t=>notices.push(t),playSample:()=>{},move:(x,z)=>player.pos.set(x,0,z),analytics:{track:(n,p)=>tracked.push([n,p])},
    registerSeat:(parts,group)=>{const data={};seats.push(data);return data},vesalius:{open:()=>opened.push(1),folios:book.folios},mapRoom:{cx:-420,cz:-60,w:18,d:14}});
  return {r,scene,interactables,notices,player,opened,tracked,seats};
}

test('the Medicine Room and the Fabrica load before the game and are wired in like the other rooms and fine books',()=>{
  const order=[...html.matchAll(/startupScript\('([^']+)'\)/g)].map(m=>m[1]);
  for(const file of ['vesalius-book.js','medicine-room.js'])assert(order.indexOf(file)>=0&&order.indexOf(file)<order.indexOf('game.js'),file);
  assert(order.indexOf('fine-books.js')<order.indexOf('vesalius-book.js'));assert(order.indexOf('map-room.js')<order.indexOf('medicine-room.js'));
  assert.match(game,/vesaliusBook=window\.createVesaliusBook\?\.\(fineBookOptions\)/);assert.match(game,/\|\|vesaliusBook\?\.isOpen\)/,'the world stops while the book is open');
  assert.match(game,/const medicineRoom=window\.createMedicineRoom\?\.\(/);assert.match(game,/vesalius:vesaliusBook/);assert.match(game,/mapRoom:mapRoom\?\.room/);
  assert(game.indexOf('const mapRoom=')<game.indexOf('const medicineRoom='),'the Map Room is built first: its east wall holds the door');
  assert.match(game,/\['medicine-room','The medicine room'\]/);assert.match(game,/medicine:'medicine-room'/);assert.match(game,/'medicine-room':medicineRoom&&\(\(\)=>medicineRoom\.enter\(\)\)/);
  assert.match(game,/medicineRoom\?\.update\(t\)/);assert.match(game,/if\(medicineRoom\?\.contains\(x,z\)\)return 'medicine-room'/);
  assert.match(fs.readFileSync('room-ambience.js','utf8'),/'medicine-room':\{/);
  for(const key of ['medicine-physic','medicine-discovery','medicine-healers']){assert.match(fs.readFileSync('scripts/new-books.mjs','utf8'),new RegExp(`'${key}'`));assert.match(fs.readFileSync('scripts/book-pages.mjs','utf8'),new RegExp(`'${key}':'The Medicine Room'`))}
  assert.match(fs.readFileSync('scripts/book-pages.mjs','utf8'),/'The Medicine Room':'medicine'/);
});

test('every page of the Fabrica has a card and a public-domain photograph, and the book is bound in order',()=>{
  const folios=Object.keys(book.folios),block=fetcher.slice(fetcher.indexOf('vesalius: {')),fetched=[...block.matchAll(/key: '([a-z0-9-]+)'/g)].map(m=>m[1]);
  assert.deepEqual(fetched,folios,'scripts/fetch-book-pages.mjs fetches the same pages, in the same order');
  for(const key of folios){
    const [label,title,note]=book.folios[key];assert(label&&title&&note.length>40,`${key} has a card`);
    if(/^p\d+$/.test(key))assert.equal(label,`Page ${Number(key.slice(1))}`);
    if(manifest[key]){assert(fs.existsSync(`assets/vesalius/${key}.jpg`),`${key}.jpg`);assert.match(manifest[key].licence,/public domain|^pd|cc0/i,`${key} is free to use`);assert.match(manifest[key].page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)}
  }
  assert(Object.keys(manifest).length>=12,'the pages have been fetched');
  const pages=folios.filter(k=>/^p\d+$/.test(k)).map(k=>Number(k.slice(1)));assert.deepEqual([...pages].sort((a,b)=>a-b),pages,'in the order of the book');
  assert.equal(new Set(book.faces).size,book.faces.length);assert.equal(book.faces.length,2*book.pages);for(const key of folios)assert(book.faces.includes(key),`${key} is bound in`);
  assert.deepEqual([...book.spreadAt(1)],['paste-front','f-title']);assert.deepEqual([...book.spreadAt(book.pages)],['colophon','paste-back']);
  assert(Array.from({length:book.pages+1},(_,n)=>book.spreadAt(n).join()).includes('p164,p165'),'the skeletons of pages 164 and 165 face each other, as in the book');
  assert(!fs.existsSync('assets/vesalius/survey'),'the survey pictures are gone');
});

test('the door is at the south end of the Map Room’s east wall, clear of its shelf and its maps, and the room stands apart',()=>{
  const {r}=room(),map=fs.readFileSync('map-room.js','utf8');
  assert.equal(r.door.x,-420+9-.15);assert.equal(r.door.yaw,-Math.PI/2);
  const shelf=map.match(/const EAST_SHELF=\{z:(-?[\d.]+),length:([\d.]+)\}/);assert(shelf,'the Map Room’s east shelf is set back');
  const shelfEnd=-60+Number(shelf[1])+Number(shelf[2])/2;assert(r.door.z-1.2>shelfEnd+.2,'clear of the east shelf');assert(r.door.z+1.2<-60+7-.15,'inside the wall’s south end');
  // The east wall's maps hang above 3.7 m; the door with its cornice reaches about 3.4 m.
  for(const [,along,y,,mh] of [...map.matchAll(/\['[a-z-]+','east',(-?[\d.]+),([\d.]+),([\d.]+),([\d.]+)\]/g)].map(m=>m.map(Number)))assert(y-mh/2>3.5||Math.abs(-60-along-r.door.z)>2.5,'no map comes down to the door');
  const {cx,cz,w,d}=r.room;
  for(const [ox,oz,ow,od] of [[-420,-60,18,14],[-330,-140,14,12],[-330,-205,16,14],[-330,-60,16,14],[-330,-290,30,14]])
    assert(Math.abs(cx-ox)>(w+ow)/2+20||Math.abs(cz-oz)>(d+od)/2+20,`well clear of the room at ${ox}, ${oz}`);
});

test('the room is built on approach: three shelves of its books, the Fabrica in its case, seats, and a door back',()=>{
  const a=room();assert.equal(a.r.built,false);a.player.pos.set(a.r.door.x-2,0,a.r.door.z);a.r.update(1);assert.equal(a.r.built,true,'built as the reader comes near the door');
  const door=a.interactables.find(o=>o.userData.type==='medicine-door');assert(door,'the door hangs in the Map Room');a.r.interact(door);
  assert(a.r.contains(a.player.pos.x,a.player.pos.z),'the door leads in');assert(a.r.allowed(a.player.pos.x,a.player.pos.z),'onto open floor');assert.match(a.notices.at(-1),/Fabrica/);
  assert.deepEqual(JSON.stringify(a.tracked.at(-1)),JSON.stringify(['Room Explored',{room:'medicine-room'}]));
  const shelves=a.r.catalogue();for(const group of shelves)assert(group.books.length>=5,`${group.key} has its books`);
  assert.equal(a.r.books.length,shelves.reduce((n,g)=>n+g.books.length,0));for(const mesh of a.r.books)assert(a.r.contains(mesh.position.x,mesh.position.z),'every book is inside the room');
  const fabrica=a.interactables.find(o=>o.userData.type==='medicine-fabrica');assert(fabrica,'the Fabrica is on show');a.r.interact(fabrica);assert.equal(a.opened.length,1,'and opens');
  assert(a.seats.length>=2,'chairs to read in');
  const exit=a.interactables.find(o=>o.userData.type==='medicine-exit');a.r.interact(exit);assert(!a.r.contains(a.player.pos.x,a.player.pos.z),'back to the Map Room');
  assert(Math.abs(a.player.pos.x-(a.r.door.x-1.6))<.01);
  const lamps=[];a.scene.traverse(o=>{if(o.isPointLight)lamps.push(o)});assert(lamps.length>=1);
  a.player.pos.set(0,0,0);a.r.update(100);assert.equal(a.r.built,false,'freed once the reader has gone');
  for(const lamp of lamps)assert.equal(lamp.userData.freed,true,'its lamp is let go by the light budget');
  assert(!a.interactables.some(o=>/^medicine-(fabrica|exit|card)$/.test(o.userData.type)),'its parts go with it');assert(a.interactables.some(o=>o.userData.type==='medicine-door'),'but the door stays');
});

test('its books are held nowhere else, and each has a note of three sentences',()=>{
  const medicine=arrivals.filter(e=>/^medicine-/.test(e[4]));assert(medicine.length>=18);
  const elsewhere=new Set(arrivals.filter(e=>!/^medicine-/.test(e[4])).map(e=>e[0]));
  for(const [id,title,,,,note] of medicine){
    assert(Number.isInteger(id),`${title} has its number`);assert(!elsewhere.has(id),`${title} is on no other shelf`);
    assert.equal(note.split(/(?<=[a-z0-9”’)I][.!?])\s+(?=[A-ZÁÉÍÓÚŒ“])/).length,3,`${title}: three sentences`);
  }
  assert.equal(new Set(medicine.map(e=>e[0])).size,medicine.length,'each once');
});
